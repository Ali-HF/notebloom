/**
 * Utility to send WhatsApp messages to customers via Twilio WhatsApp API.
 *
 * Required env vars:
 *   TWILIO_ACCOUNT_SID   – from Twilio Console
 *   TWILIO_AUTH_TOKEN     – from Twilio Console
 *   TWILIO_PHONE_NUMBER   – sandbox or approved sender (default: +14155238886)
 *
 * Optional:
 *   WHATSAPP_ENABLED      – set to "false" to disable sending even when creds exist
 */
export async function sendWhatsappNotification(to: string, messageBody: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER || "+14155238886"; // Default Twilio sandbox number

  // Allow explicit opt-out via env var
  if (process.env.WHATSAPP_ENABLED === "false") {
    console.log(`[WHATSAPP DISABLED] Skipping send to ${to}`);
    return false;
  }

  if (!accountSid || !authToken || accountSid.startsWith("ACXXXX")) {
    console.warn("TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is not configured (or still placeholder). WhatsApp send skipped.");
    console.log(`[MOCK WHATSAPP SEND] To: ${to}, Message: "${messageBody}"`);
    return false;
  }

  // Normalize the phone number for WhatsApp delivery
  const formattedTo = normalizePhoneNumber(to);
  const recipient = `whatsapp:${formattedTo}`;
  const sender = `whatsapp:${from}`;

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const params = new URLSearchParams();
    params.append("To", recipient);
    params.append("From", sender);
    params.append("Body", messageBody);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": authHeader,
      },
      body: params.toString(),
    });

    const resJson = await response.json();

    if (!response.ok) {
      console.error(
        `Twilio WhatsApp API error [${response.status}]:`,
        `Code=${resJson.code ?? "?"}, Message="${resJson.message ?? resJson.error_message ?? "unknown"}"`,
        resJson
      );
      return false;
    }

    console.log(`✅ WhatsApp notification sent to ${formattedTo}. SID: ${resJson.sid}, Status: ${resJson.status}`);
    return true;
  } catch (error) {
    console.error("Failed to send WhatsApp message via Twilio:", error);
    return false;
  }
}

/**
 * Normalize a phone number to E.164 format for WhatsApp.
 *
 * - Pakistani numbers starting with "0" → +92…
 * - Numbers already starting with "+" are left as-is
 * - Bare digits are prefixed with "+"
 */
export function normalizePhoneNumber(raw: string): string {
  let phone = raw.trim().replace(/[\s\-()]/g, "");

  // Pakistani local format: 03xxxxxxxxx → +923xxxxxxxxx
  if (phone.startsWith("0") && phone.length >= 10 && phone.length <= 12) {
    phone = "+92" + phone.slice(1);
  }

  // Ensure it starts with +
  if (!phone.startsWith("+")) {
    phone = "+" + phone;
  }

  return phone;
}

/**
 * Validate a Twilio webhook request signature.
 * See: https://www.twilio.com/docs/usage/security#validating-requests
 *
 * Uses HMAC-SHA1 of (webhookUrl + sorted params) with the auth token as key.
 */
export async function validateTwilioSignature(
  signature: string,
  webhookUrl: string,
  params: Record<string, string>
): Promise<boolean> {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;

  // 1. Start with the full webhook URL
  // 2. Sort params by key, append key+value
  const sortedKeys = Object.keys(params).sort();
  let data = webhookUrl;
  for (const key of sortedKeys) {
    data += key + params[key];
  }

  // 3. HMAC-SHA1 with auth token, then base64
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(authToken),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  const computed = Buffer.from(signatureBytes).toString("base64");

  return computed === signature;
}
