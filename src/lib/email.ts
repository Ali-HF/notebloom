/**
 * Utility to send email notifications via Brevo API
 */
import { type CartRow, type OrderItem } from "./db";

export async function sendEmailNotification(to: string, subject: string, htmlContent: string): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "notebloom@gmail.com";
  const senderName = process.env.BREVO_SENDER_NAME || "Notebloom";

  if (!apiKey) {
    console.log("\n--- SIMULATED EMAIL (BREVO NOT CONFIGURED) ---");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("----------------------------------------------\n");
    return true;
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Brevo API Error: status=${res.status}, response=${errText}`);
      return false;
    }

    console.log(`Email successfully sent to ${to} via Brevo.`);
    return true;
  } catch (error) {
    console.error("Failed to send email via Brevo:", error);
    return false;
  }
}

export async function sendVerificationCodeEmail(to: string, code: string): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Notebloom Account</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #faf8f5; color: #2e2926; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e5e0d8; border-radius: 8px; overflow: hidden; }
          .header { background-color: #6b1d2f; padding: 40px 20px; text-align: center; }
          .logo { font-size: 28px; color: #faf8f5; font-weight: bold; }
          .content { padding: 40px 30px; line-height: 1.6; }
          h1 { font-size: 22px; color: #591724; margin-top: 0; }
          .code-box { display: inline-block; background-color: #f5eff0; border: 1px dashed #6b1d2f; color: #6b1d2f; font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 0.2em; padding: 15px 30px; border-radius: 8px; }
          .footer { background-color: #f5eff0; padding: 20px; text-align: center; font-size: 13px; color: #8c827a; border-top: 1px solid #e5e0d8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><span class="logo">~ notebloom ~</span></div>
          <div class="content">
            <h1>Verify your account</h1>
            <p>Thank you for signing up! Please use this verification code:</p>
            <div style="text-align:center;margin:30px 0;"><div class="code-box">${code}</div></div>
            <p>This code is valid for 1 hour.</p>
          </div>
          <div class="footer">&copy; 2026 Notebloom. All rights reserved.</div>
        </div>
      </body>
    </html>
  `;
  return sendEmailNotification(to, "Your Notebloom verification code", htmlContent);
}

function getBaseUrl() {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export async function sendOrderConfirmationRequestEmail(
  to: string, orderId: number, customerName: string,
  items: CartRow[], totalCents: number,
  shipping: { address: string; area: string; city: string; phone: string }
): Promise<boolean> {
  const baseUrl = getBaseUrl();
  const confirmUrl = `${baseUrl}/api/orders/${orderId}/confirm`;
  const totalPKR = `PKR ${(totalCents / 100).toFixed(2)}`;
  const itemsListHtml = items.map((item) => `
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f2ece4;">
      <div><span style="font-weight:600;">${item.title}</span> <span style="color:#8c827a;font-size:13px;">x${item.quantity}</span></div>
      <div style="font-family:monospace;">PKR ${(item.price_cents * item.quantity / 100).toFixed(2)}</div>
    </div>`).join("");

  const htmlContent = `
    <!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      body { font-family: -apple-system, sans-serif; background-color: #faf8f5; color: #2e2926; margin:0; padding:0; }
      .container { max-width:600px; margin:40px auto; background:#fff; border:1px solid #e5e0d8; border-radius:12px; overflow:hidden; }
      .header { background-color:#6b1d2f; padding:30px 20px; text-align:center; }
      .logo { font-size:24px; color:#faf8f5; font-weight:bold; }
      .content { padding:40px 30px; line-height:1.6; }
      .btn { display:inline-block; background-color:#6b1d2f; color:#faf8f5 !important; padding:14px 28px; text-decoration:none; border-radius:24px; font-weight:bold; font-size:14px; }
      .card { background-color:#faf8f5; border:1px solid #e5e0d8; border-radius:8px; padding:20px; margin-top:30px; }
      .footer { background-color:#f5eff0; padding:20px; text-align:center; font-size:12px; color:#8c827a; border-top:1px solid #e5e0d8; }
    </style></head>
    <body><div class="container">
      <div class="header"><span class="logo">~ notebloom ~</span></div>
      <div class="content">
        <h1 style="color:#591724;">Thank you for your order, ${customerName}!</h1>
        <p>We've received your order <strong>#${orderId}</strong>. Our team will call you shortly to confirm.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${confirmUrl}" class="btn" style="color:#faf8f5;">VIEW ORDER</a>
        </div>
        <div class="card">
          ${itemsListHtml}
          <div style="display:flex;justify-content:space-between;padding:15px 0 0;font-weight:bold;font-size:16px;color:#591724;">
            <span>Total:</span><span>${totalPKR}</span>
          </div>
          <div style="margin-top:15px;font-size:13px;color:#4a4540;">
            <strong>Address:</strong> ${shipping.address}, ${shipping.area}, ${shipping.city}<br>
            <strong>Phone:</strong> ${shipping.phone}
          </div>
        </div>
      </div>
      <div class="footer">&copy; 2026 Notebloom. All rights reserved.</div>
    </div></body></html>`;

  return sendEmailNotification(to, `Your Order #${orderId} - Notebloom`, htmlContent);
}

export async function sendOrderShippedEmail(
  to: string, orderId: number, customerName: string,
  items: OrderItem[], totalCents: number,
  shipping: { address: string; area: string; city: string; phone: string }
): Promise<boolean> {
  const baseUrl = getBaseUrl();
  const viewOrderUrl = `${baseUrl}/account/orders/${orderId}`;
  const totalPKR = `PKR ${(totalCents / 100).toFixed(2)}`;
  const itemsListHtml = items.map((item) => `
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f2ece4;">
      <div><span style="font-weight:600;">${item.title}</span> <span style="color:#8c827a;font-size:13px;">x${item.quantity}</span></div>
      <div style="font-family:monospace;">PKR ${(item.price_cents * item.quantity / 100).toFixed(2)}</div>
    </div>`).join("");

  const htmlContent = `
    <!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      body { font-family: -apple-system, sans-serif; background-color: #faf8f5; color: #2e2926; margin:0; padding:0; }
      .container { max-width:600px; margin:40px auto; background:#fff; border:1px solid #e5e0d8; border-radius:12px; overflow:hidden; }
      .header { background-color:#6b1d2f; padding:30px 20px; text-align:center; }
      .logo { font-size:24px; color:#faf8f5; font-weight:bold; }
      .content { padding:40px 30px; line-height:1.6; }
      .btn { display:inline-block; background-color:#6b1d2f; color:#faf8f5 !important; padding:14px 28px; text-decoration:none; border-radius:24px; font-weight:bold; }
      .card { background-color:#faf8f5; border:1px solid #e5e0d8; border-radius:8px; padding:20px; margin-top:30px; }
      .footer { background-color:#f5eff0; padding:20px; text-align:center; font-size:12px; color:#8c827a; border-top:1px solid #e5e0d8; }
    </style></head>
    <body><div class="container">
      <div class="header"><span class="logo">~ notebloom ~</span></div>
      <div class="content">
        <h1 style="color:#591724;">Your order has shipped! 📦</h1>
        <p>Hi ${customerName}, your order <strong>#${orderId}</strong> is on its way!</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${viewOrderUrl}" class="btn" style="color:#faf8f5;">VIEW ORDER</a>
        </div>
        <div class="card">
          ${itemsListHtml}
          <div style="display:flex;justify-content:space-between;padding:15px 0 0;font-weight:bold;color:#591724;">
            <span>Total:</span><span>${totalPKR}</span>
          </div>
          <div style="margin-top:15px;font-size:13px;color:#4a4540;">
            <strong>Address:</strong> ${shipping.address}, ${shipping.area}, ${shipping.city}
          </div>
        </div>
      </div>
      <div class="footer">&copy; 2026 Notebloom. All rights reserved.</div>
    </div></body></html>`;

  return sendEmailNotification(to, `Your Order #${orderId} Has Shipped! 📦 - Notebloom`, htmlContent);
}

export async function sendOrderOutForDeliveryEmail(
  to: string, orderId: number, customerName: string,
  items: OrderItem[], totalCents: number,
  shipping: { address: string; area: string; city: string; phone: string }
): Promise<boolean> {
  const baseUrl = getBaseUrl();
  const viewOrderUrl = `${baseUrl}/account/orders/${orderId}`;
  const totalPKR = `PKR ${(totalCents / 100).toFixed(2)}`;
  const itemsListHtml = items.map((item) => `
    <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f2ece4;">
      <div><span style="font-weight:600;">${item.title}</span> <span style="color:#8c827a;font-size:13px;">x${item.quantity}</span></div>
      <div style="font-family:monospace;">PKR ${(item.price_cents * item.quantity / 100).toFixed(2)}</div>
    </div>`).join("");

  const htmlContent = `
    <!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      body { font-family: -apple-system, sans-serif; background-color: #faf8f5; color: #2e2926; margin:0; padding:0; }
      .container { max-width:600px; margin:40px auto; background:#fff; border:1px solid #e5e0d8; border-radius:12px; overflow:hidden; }
      .header { background-color:#6b1d2f; padding:30px 20px; text-align:center; }
      .logo { font-size:24px; color:#faf8f5; font-weight:bold; }
      .content { padding:40px 30px; line-height:1.6; }
      .btn { display:inline-block; background-color:#6b1d2f; color:#faf8f5 !important; padding:14px 28px; text-decoration:none; border-radius:24px; font-weight:bold; }
      .card { background-color:#faf8f5; border:1px solid #e5e0d8; border-radius:8px; padding:20px; margin-top:30px; }
      .footer { background-color:#f5eff0; padding:20px; text-align:center; font-size:12px; color:#8c827a; border-top:1px solid #e5e0d8; }
    </style></head>
    <body><div class="container">
      <div class="header"><span class="logo">~ notebloom ~</span></div>
      <div class="content">
        <h1 style="color:#591724;">Out for delivery! 🛵</h1>
        <p>Hi ${customerName}, your order <strong>#${orderId}</strong> is out for delivery and will arrive soon!</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${viewOrderUrl}" class="btn" style="color:#faf8f5;">VIEW ORDER</a>
        </div>
        <div class="card">
          ${itemsListHtml}
          <div style="display:flex;justify-content:space-between;padding:15px 0 0;font-weight:bold;color:#591724;">
            <span>Total:</span><span>${totalPKR}</span>
          </div>
          <div style="margin-top:15px;font-size:13px;color:#4a4540;">
            <strong>Address:</strong> ${shipping.address}, ${shipping.area}, ${shipping.city}
          </div>
        </div>
      </div>
      <div class="footer">&copy; 2026 Notebloom. All rights reserved.</div>
    </div></body></html>`;

  return sendEmailNotification(to, `Your Order #${orderId} Is Out for Delivery! 🛵 - Notebloom`, htmlContent);
}

export async function sendOrderDeliveredEmail(
  to: string, orderId: number, orderCode: string, customerName: string, items: OrderItem[]
): Promise<boolean> {
  const baseUrl = getBaseUrl();
  const itemsListHtml = items.map((item) => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-bottom:1px solid #f2ece4;margin-bottom:10px;padding-bottom:10px;">
      <tr>
        <td align="left" style="vertical-align:middle;padding:10px 0;">
          <strong style="color:#2e2926;font-size:14px;line-height:1.3;display:block;">${item.title}</strong>
          <span style="color:#8c827a;font-size:12px;">by ${item.author}</span>
        </td>
        <td align="right" width="80" style="vertical-align:middle;text-align:right;padding-left:10px;width:80px;">
          <a href="${baseUrl}/shop/${item.book_id}/review?orderId=${orderId}&code=${orderCode}" style="display:inline-block;background-color:#6b1d2f;color:#faf8f5 !important;padding:8px 16px;text-decoration:none;border-radius:18px;font-size:11px;font-weight:bold;letter-spacing:0.03em;white-space:nowrap;text-align:center;">REVIEW</a>
        </td>
      </tr>
    </table>`).join("");

  const htmlContent = `
    <!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      body { font-family: -apple-system, sans-serif; background-color: #faf8f5; color: #2e2926; margin:0; padding:0; }
      .container { max-width:600px; margin:40px auto; background:#fff; border:1px solid #e5e0d8; border-radius:12px; overflow:hidden; }
      .header { background-color:#6b1d2f; padding:30px 20px; text-align:center; }
      .logo { font-size:24px; color:#faf8f5; font-weight:bold; }
      .content { padding:40px 30px; line-height:1.6; }
      .card { background-color:#faf8f5; border:1px solid #e5e0d8; border-radius:8px; padding:20px; margin-top:30px; }
      .footer { background-color:#f5eff0; padding:20px; text-align:center; font-size:12px; color:#8c827a; border-top:1px solid #e5e0d8; }
    </style></head>
    <body><div class="container">
      <div class="header"><span class="logo">~ notebloom ~</span></div>
      <div class="content">
        <h1 style="color:#591724;">Your package has arrived! 🎉</h1>
        <p>Hi ${customerName}, your order <strong>#${orderId}</strong> has been delivered. We hope you love it!</p>
        <div class="card">
          <div style="font-weight:bold;color:#591724;border-bottom:2px solid #e5e0d8;padding-bottom:8px;margin-bottom:15px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Share Your Feedback</div>
          ${itemsListHtml}
        </div>
        <p style="margin-top:25px;">Thank you for shopping at Notebloom! 🌸</p>
      </div>
      <div class="footer">&copy; 2026 Notebloom. All rights reserved.</div>
    </div></body></html>`;

  return sendEmailNotification(to, `Order #${orderId} Delivered! 🎉 - Notebloom`, htmlContent);
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<boolean> {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      body { font-family: -apple-system, sans-serif; background-color: #faf8f5; color: #2e2926; margin:0; padding:0; }
      .container { max-width:600px; margin:40px auto; background:#fff; border:1px solid #e5e0d8; border-radius:8px; overflow:hidden; }
      .header { background-color:#6b1d2f; padding:40px 20px; text-align:center; }
      .logo { font-size:28px; color:#faf8f5; font-weight:bold; }
      .content { padding:40px 30px; line-height:1.6; }
      .btn { display:inline-block; background-color:#6b1d2f; color:#faf8f5 !important; text-decoration:none; padding:14px 28px; border-radius:4px; font-weight:600; font-size:16px; }
      .footer { background-color:#f5eff0; padding:20px; text-align:center; font-size:13px; color:#8c827a; border-top:1px solid #e5e0d8; }
    </style></head>
    <body><div class="container">
      <div class="header"><span class="logo">~ notebloom ~</span></div>
      <div class="content">
        <h1 style="color:#591724;">Reset your password</h1>
        <p>Click below to reset your Notebloom password. This link is valid for 1 hour.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${resetUrl}" class="btn" style="color:#faf8f5;">Reset Password</a>
        </div>
        <p style="font-size:13px;color:#8c827a;">If you didn't request this, ignore this email.</p>
      </div>
      <div class="footer">&copy; 2026 Notebloom. All rights reserved.</div>
    </div></body></html>`;

  return sendEmailNotification(to, "Reset your Notebloom password", htmlContent);
}

export async function sendLowStockAlert(productName: string, remainingStock: number): Promise<boolean> {
  const adminEmail = process.env.BREVO_SENDER_EMAIL || "admin@notebloom.shop";
  const htmlContent = `
    <!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      body { font-family: sans-serif; background-color: #ede4d3; color: #20283a; margin:0; padding:20px; }
      .container { max-width:600px; margin:0 auto; background-color:#faf6ec; padding:30px; border-radius:12px; border:1px solid rgba(32,40,58,0.1); }
      h2 { color:#7c2f2f; margin-top:0; }
      .details { background-color:#ede4d3; padding:20px; border-radius:8px; margin:20px 0; border:1.5px dashed #af8a4f; }
      .btn { display:inline-block; background-color:#7c2f2f; color:#faf6ec !important; text-decoration:none; padding:12px 24px; border-radius:20px; font-size:14px; text-transform:uppercase; font-family:monospace; font-weight:bold; }
    </style></head>
    <body><div class="container">
      <h2>⚠️ Low Stock Notification</h2>
      <p>Inventory has dropped to 5 or below for a product.</p>
      <div class="details">
        <p><strong>Product:</strong> ${productName}</p>
        <p style="color:#7c2f2f;"><strong>Remaining Stock:</strong> ${remainingStock}</p>
      </div>
      <p>Please restock soon.</p>
      <div style="text-align:center;margin-top:25px;">
        <a href="https://the-paperworm.vercel.app/admin" class="btn" style="color:#faf6ec;">Admin Panel</a>
      </div>
    </div></body></html>`;

  return sendEmailNotification(adminEmail, `⚠️ Low Stock Alert: "${productName}"`, htmlContent);
}