import { NextResponse, type NextRequest } from "next/server";
import { sql, updateOrderStatus } from "@/lib/db";
import { validateTwilioSignature, sendWhatsappNotification } from "@/lib/whatsapp";

/**
 * GET — Twilio sometimes pings the webhook URL during setup.
 * Return 200 so it doesn't flag the endpoint as down.
 */
export async function GET() {
  return NextResponse.json({ status: "ok", service: "notebloom-whatsapp-webhook" });
}

/**
 * POST — Receives incoming WhatsApp messages forwarded by Twilio.
 *
 * Flow:
 *  1. Parse the sender phone + message body from Twilio's form-data payload
 *  2. Match the phone number to a pending order
 *  3. If the user replies "confirm" → mark order as Confirmed
 *  4. If the user replies "cancel"  → mark order as Cancelled
 *  5. Otherwise prompt them with valid options
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let from = "";
    let body = "";
    const paramsMap: Record<string, string> = {};

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      from = (formData.get("From") as string) || "";
      body = (formData.get("Body") as string) || "";
      // Collect all params for signature validation
      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
          paramsMap[key] = value;
        }
      }
    } else {
      // Fallback to JSON if any tester sends JSON
      const json = await request.json();
      from = json.From || json.from || "";
      body = json.Body || json.body || "";
    }

    console.log(`📩 WhatsApp Webhook: From=${from}, Body="${body}"`);

    if (!from || !body) {
      return twilioXml("Error: Missing From or Body parameter.", 400);
    }

    // ── Twilio signature validation ──
    // Only validate when auth token is configured (skip in dev/testing)
    const twilioSignature = request.headers.get("x-twilio-signature") || "";
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (authToken && !authToken.startsWith("your_") && twilioSignature) {
      const webhookUrl = getWebhookUrl(request);
      const isValid = await validateTwilioSignature(twilioSignature, webhookUrl, paramsMap);
      if (!isValid) {
        console.warn("⚠️ Twilio signature validation failed — rejecting request");
        return twilioXml("Unauthorized: Invalid signature.", 403);
      }
    }

    // ── Match sender phone to a pending order ──
    const incomingDigits = from.replace(/\D/g, "");
    const incomingLast10 = incomingDigits.slice(-10);

    if (incomingLast10.length < 10) {
      return twilioXml("Error: Invalid sender phone number format.");
    }

    const pendingOrders = await sql`
      SELECT id, shipping_json 
      FROM orders 
      WHERE status = 'Pending'
      ORDER BY id DESC
    `;

    let matchedOrder: { id: number; shipping_json: string | null } | null = null;

    for (const order of pendingOrders) {
      if (order.shipping_json) {
        try {
          const shipping = JSON.parse(order.shipping_json);
          const orderPhone = shipping.phone || "";
          const orderPhoneDigits = orderPhone.replace(/\D/g, "");
          const orderPhoneLast10 = orderPhoneDigits.slice(-10);

          if (orderPhoneLast10 === incomingLast10) {
            matchedOrder = order as { id: number; shipping_json: string | null };
            break;
          }
        } catch {
          // Ignore shipping JSON parse errors
        }
      }
    }

    // ── Process the reply ──
    if (!matchedOrder) {
      return twilioXml(
        "Hi! We couldn't find any pending orders associated with this phone number. If you believe this is an error, please contact support@notebloom.shop."
      );
    }

    const text = body.toLowerCase().trim();

    if (isConfirmation(text)) {
      await updateOrderStatus(matchedOrder.id, "Confirmed");
      console.log(`✅ Order #${matchedOrder.id} confirmed via WhatsApp by ${from}`);
      return twilioXml(
        `Thank you! Your order #${matchedOrder.id} has been *Confirmed* and is now being processed for delivery. 🎉\n\nWe'll notify you when it's dispatched!`
      );
    }

    if (isCancellation(text)) {
      await updateOrderStatus(matchedOrder.id, "Cancelled");
      console.log(`❌ Order #${matchedOrder.id} cancelled via WhatsApp by ${from}`);
      return twilioXml(
        `Your order #${matchedOrder.id} has been *Cancelled*. If this was a mistake, please place a new order at notebloom.shop.\n\nWe hope to serve you again soon!`
      );
    }

    // Unrecognized reply — prompt with options
    return twilioXml(
      `We found your pending order #${matchedOrder.id}.\n\n` +
      `📦 Reply *confirm* to confirm your order\n` +
      `❌ Reply *cancel* to cancel your order`
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return twilioXml("Server Error: Failed to process message.", 500);
  }
}

// ── Helpers ──

function twilioXml(message: string, status: number = 200) {
  const xml = `<Response><Message>${escapeXml(message)}</Message></Response>`;
  return new NextResponse(xml, {
    status,
    headers: { "Content-Type": "application/xml" },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getWebhookUrl(request: NextRequest): string {
  // Build the full URL that Twilio used to call us
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host") || "localhost:3000";
  return `${proto}://${host}/api/webhook/whatsapp`;
}

/** Match confirmation keywords (English + Urdu + common typos) */
function isConfirmation(text: string): boolean {
  const keywords = [
    "confirm", "confirmed", "yes", "ok", "okay",
    "haan", "haa", "han", "ji", "ji haan",
    // Common typos
    "cinbfirm", "cionfrm", "comfirm", "confrm", "confrim",
  ];
  return keywords.some((kw) => text === kw || text === kw + "!");
}

/** Match cancellation keywords */
function isCancellation(text: string): boolean {
  const keywords = [
    "cancel", "cancelled", "no", "nahi", "nah",
    "reject", "decline",
  ];
  return keywords.some((kw) => text === kw || text === kw + "!");
}
