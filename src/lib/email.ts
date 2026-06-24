/**
 * Utility to send email notifications via Resend API
 */
import { type CartRow, type OrderItem } from "./db";

export async function sendEmailNotification(to: string, subject: string, htmlContent: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const isPlaceholder = !apiKey || apiKey.startsWith("re_xxxx") || apiKey === "";

  if (isPlaceholder) {
    console.log("\n--- SIMULATED EMAIL NOTIFICATION (RESEND KEY NOT CONFIGURED) ---");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("Content:");
    console.log(htmlContent);
    console.log("----------------------------------------------------------------\n");
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "The Paperworm <onboarding@resend.dev>",
        to: to,
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Resend API Error: status=${res.status}, response=${errText}`);
      return false;
    }

    const data = await res.json();
    console.log(`Email successfully sent to ${to} via Resend. ID: ${data.id}`);
    return true;
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    return false;
  }
}



export async function sendVerificationCodeEmail(to: string, code: string): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Paperworm Account</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #faf8f5;
            color: #2e2926;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border: 1px solid #e5e0d8;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          }
          .header {
            background-color: #6b1d2f; /* Oxblood primary */
            padding: 40px 20px;
            text-align: center;
          }
          .logo {
            font-size: 28px;
            color: #faf8f5;
            text-decoration: none;
            letter-spacing: 0.05em;
            font-weight: bold;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          h1 {
            font-size: 22px;
            color: #591724;
            margin-top: 0;
            margin-bottom: 20px;
          }
          p {
            margin: 0 0 20px 0;
            font-size: 16px;
            color: #4a4540;
          }
          .code-container {
            margin: 30px 0;
            text-align: center;
          }
          .code-box {
            display: inline-block;
            background-color: #f5eff0;
            border: 1px dashed #6b1d2f;
            color: #6b1d2f;
            font-family: "Space Mono", monospace;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 0.2em;
            padding: 15px 30px 15px 40px; /* offset for letter-spacing */
            border-radius: 8px;
          }
          .footer {
            background-color: #f5eff0;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #8c827a;
            border-top: 1px solid #e5e0d8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">~ the paperworm ~</span>
          </div>
          <div class="content">
            <h1>Verify your account</h1>
            <p>Thank you for signing up for The Paperworm! Please use the following 6-digit verification code to complete your signup process:</p>
            
            <div class="code-container">
              <div class="code-box">${code}</div>
            </div>

            <p>This verification code is valid for 1 hour. If you did not request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; 2026 The Paperworm. All rights reserved. <br>
            Adding character to your desk, one page at a time.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailNotification(to, "Your Paperworm verification code", htmlContent);
}

function getBaseUrl() {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export async function sendOrderConfirmationRequestEmail(
  to: string,
  orderId: number,
  customerName: string,
  items: CartRow[],
  totalCents: number,
  shipping: { address: string; area: string; city: string; phone: string }
): Promise<boolean> {
  const baseUrl = getBaseUrl();
  const confirmUrl = `${baseUrl}/api/orders/${orderId}/confirm`;
  const totalPKR = `PKR ${(totalCents / 100).toFixed(2)}`;

  const itemsListHtml = items
    .map(
      (item) => `
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f2ece4;">
        <div>
          <span style="font-weight: 600; color: #2e2926;">${item.title}</span>
          <span style="color: #8c827a; font-size: 13px;">x${item.quantity}</span>
        </div>
        <div style="font-weight: 500; font-family: monospace;">PKR ${(item.price_cents * item.quantity / 100).toFixed(2)}</div>
      </div>
    `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Confirm Your Order #${orderId} - The Paperworm</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #faf8f5;
            color: #2e2926;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border: 1px solid #e5e0d8;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          }
          .header {
            background-color: #6b1d2f;
            padding: 30px 20px;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            color: #faf8f5;
            letter-spacing: 0.05em;
            font-weight: bold;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          h1 {
            font-size: 20px;
            color: #591724;
            margin-top: 0;
            margin-bottom: 15px;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .btn-primary {
            display: inline-block;
            background-color: #6b1d2f;
            color: #faf8f5 !important;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 24px;
            font-weight: bold;
            font-size: 14px;
            letter-spacing: 0.05em;
            box-shadow: 0 2px 4px rgba(107, 29, 47, 0.2);
          }
          .summary-card {
            background-color: #faf8f5;
            border: 1px solid #e5e0d8;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
          }
          .summary-header {
            font-weight: bold;
            color: #591724;
            border-bottom: 2px solid #e5e0d8;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .footer {
            background-color: #f5eff0;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #8c827a;
            border-top: 1px solid #e5e0d8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">~ the paperworm ~</span>
          </div>
          <div class="content">
            <h1>Thank you for your order, ${customerName}!</h1>
            <p>We've received your order <strong>#${orderId}</strong>. To help us process and prepare it for shipment, please verify and confirm your order by clicking the button below:</p>
            
            <div class="button-container">
              <a href="${confirmUrl}" class="btn-primary" style="color: #faf8f5;">CONFIRM MY ORDER</a>
            </div>

            <p style="font-size: 13px; color: #8c827a; text-align: center; margin-top: -15px;">
              Or reply "confirm" via WhatsApp on your phone (${shipping.phone}).
            </p>

            <div class="summary-card">
              <div class="summary-header">Order Details</div>
              ${itemsListHtml}
              <div style="display: flex; justify-content: space-between; padding: 15px 0 0; font-weight: bold; font-size: 16px; color: #591724;">
                <span>Total Amount:</span>
                <span>${totalPKR}</span>
              </div>
              <div style="margin-top: 20px; font-size: 13px; border-top: 1px solid #e5e0d8; padding-top: 15px; color: #4a4540;">
                <strong>Shipping Address:</strong><br>
                ${shipping.address}, ${shipping.area}, ${shipping.city}<br>
                <strong>Phone:</strong> ${shipping.phone}
              </div>
            </div>
          </div>
          <div class="footer">
            &copy; 2026 The Paperworm. All rights reserved. <br>
            Adding character to your desk, one page at a time.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailNotification(to, `Verify and Confirm Your Order #${orderId} - The Paperworm`, htmlContent);
}

export async function sendOrderShippedEmail(
  to: string,
  orderId: number,
  customerName: string,
  items: OrderItem[],
  totalCents: number,
  shipping: { address: string; area: string; city: string; phone: string }
): Promise<boolean> {
  const baseUrl = getBaseUrl();
  const viewOrderUrl = `${baseUrl}/account/orders/${orderId}`;
  const totalPKR = `PKR ${(totalCents / 100).toFixed(2)}`;

  const itemsListHtml = items
    .map(
      (item) => `
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f2ece4;">
        <div>
          <span style="font-weight: 600; color: #2e2926;">${item.title}</span>
          <span style="color: #8c827a; font-size: 13px;">x${item.quantity}</span>
        </div>
        <div style="font-weight: 500; font-family: monospace;">PKR ${(item.price_cents * item.quantity / 100).toFixed(2)}</div>
      </div>
    `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Your Order #${orderId} Has Shipped! 📦 - The Paperworm</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #faf8f5;
            color: #2e2926;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border: 1px solid #e5e0d8;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          }
          .header {
            background-color: #6b1d2f;
            padding: 30px 20px;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            color: #faf8f5;
            letter-spacing: 0.05em;
            font-weight: bold;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          h1 {
            font-size: 20px;
            color: #591724;
            margin-top: 0;
            margin-bottom: 15px;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .btn-primary {
            display: inline-block;
            background-color: #6b1d2f;
            color: #faf8f5 !important;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 24px;
            font-weight: bold;
            font-size: 14px;
            letter-spacing: 0.05em;
            box-shadow: 0 2px 4px rgba(107, 29, 47, 0.2);
          }
          .summary-card {
            background-color: #faf8f5;
            border: 1px solid #e5e0d8;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
          }
          .summary-header {
            font-weight: bold;
            color: #591724;
            border-bottom: 2px solid #e5e0d8;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .footer {
            background-color: #f5eff0;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #8c827a;
            border-top: 1px solid #e5e0d8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">~ the paperworm ~</span>
          </div>
          <div class="content">
            <h1>Great news! Your order has been shipped. 📦</h1>
            <p>Hi ${customerName}, your order <strong>#${orderId}</strong> is out for delivery/shipped and will be at your doorstep very soon!</p>
            
            <div class="button-container">
              <a href="${viewOrderUrl}" class="btn-primary" style="color: #faf8f5;">VIEW ORDER RECEIPT</a>
            </div>

            <div class="summary-card">
              <div class="summary-header">Shipping Details</div>
              ${itemsListHtml}
              <div style="display: flex; justify-content: space-between; padding: 15px 0 0; font-weight: bold; font-size: 16px; color: #591724;">
                <span>Total Amount:</span>
                <span>${totalPKR}</span>
              </div>
              <div style="margin-top: 20px; font-size: 13px; border-top: 1px solid #e5e0d8; padding-top: 15px; color: #4a4540;">
                <strong>Shipping Address:</strong><br>
                ${shipping.address}, ${shipping.area}, ${shipping.city}<br>
                <strong>Phone:</strong> ${shipping.phone}
              </div>
            </div>
          </div>
          <div class="footer">
            &copy; 2026 The Paperworm. All rights reserved. <br>
            Adding character to your desk, one page at a time.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailNotification(to, `Your Order #${orderId} Has Shipped! 📦 - The Paperworm`, htmlContent);
}

export async function sendOrderDeliveredEmail(
  to: string,
  orderId: number,
  customerName: string,
  items: OrderItem[]
): Promise<boolean> {
  const baseUrl = getBaseUrl();
  
  // Create review links for each item
  const itemsListHtml = items
    .map(
      (item) => `
      <div style="padding: 15px 0; border-bottom: 1px solid #f2ece4;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <strong style="color: #2e2926; font-size: 15px;">${item.title}</strong><br>
            <span style="color: #8c827a; font-size: 13px;">by ${item.author}</span>
          </div>
          <a href="${baseUrl}/shop/${item.book_id}" style="display: inline-block; background-color: #6b1d2f; color: #faf8f5 !important; padding: 6px 12px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 11px; letter-spacing: 0.05em;">WRITE REVIEW</a>
        </div>
      </div>
    `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order #${orderId} Delivered successfully! 🎉 - The Paperworm</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #faf8f5;
            color: #2e2926;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border: 1px solid #e5e0d8;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          }
          .header {
            background-color: #6b1d2f;
            padding: 30px 20px;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            color: #faf8f5;
            letter-spacing: 0.05em;
            font-weight: bold;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          h1 {
            font-size: 20px;
            color: #591724;
            margin-top: 0;
            margin-bottom: 15px;
          }
          .reviews-card {
            background-color: #faf8f5;
            border: 1px solid #e5e0d8;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
          }
          .reviews-header {
            font-weight: bold;
            color: #591724;
            border-bottom: 2px solid #e5e0d8;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .footer {
            background-color: #f5eff0;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #8c827a;
            border-top: 1px solid #e5e0d8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">~ the paperworm ~</span>
          </div>
          <div class="content">
            <h1>Your package has arrived! 📦🎉</h1>
            <p>Hi ${customerName}, we are pleased to let you know that your order <strong>#${orderId}</strong> has been successfully delivered.</p>
            <p>We hope you love your new additions! Since we are always looking to improve, would you mind sharing your review for the items you purchased?</p>
            
            <div class="reviews-card">
              <div class="reviews-header">Share Your Feedback</div>
              ${itemsListHtml}
            </div>
            
            <p style="margin-top: 25px;">Thank you for supporting ~ the paperworm ~!</p>
          </div>
          <div class="footer">
            &copy; 2026 The Paperworm. All rights reserved. <br>
            Adding character to your desk, one page at a time.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailNotification(to, `Order #${orderId} Delivered successfully! 🎉 - The Paperworm`, htmlContent);
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<boolean> {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Paperworm Password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #faf8f5;
            color: #2e2926;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border: 1px solid #e5e0d8;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          }
          .header {
            background-color: #6b1d2f; /* Oxblood primary */
            padding: 40px 20px;
            text-align: center;
          }
          .logo {
            font-size: 28px;
            color: #faf8f5;
            text-decoration: none;
            letter-spacing: 0.05em;
            font-weight: bold;
          }
          .content {
            padding: 40px 30px;
            line-height: 1.6;
          }
          h1 {
            font-size: 22px;
            color: #591724;
            margin-top: 0;
            margin-bottom: 20px;
          }
          p {
            margin: 0 0 20px 0;
            font-size: 16px;
            color: #4a4540;
          }
          .btn-container {
            margin: 30px 0;
            text-align: center;
          }
          .btn {
            display: inline-block;
            background-color: #6b1d2f;
            color: #faf8f5 !important;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 16px;
            letter-spacing: 0.03em;
            box-shadow: 0 4px 6px rgba(107, 29, 47, 0.15);
          }
          .btn:hover {
            background-color: #591724;
          }
          .footer {
            background-color: #f5eff0;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #8c827a;
            border-top: 1px solid #e5e0d8;
          }
          .link-fallback {
            font-size: 13px;
            color: #8c827a;
            word-break: break-all;
            background-color: #faf8f5;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #e5e0d8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">~ the paperworm ~</span>
          </div>
          <div class="content">
            <h1>Reset your password</h1>
            <p>We received a request to reset the password for your Paperworm account. Please click the button below to choose a new password:</p>
            
            <div class="btn-container">
              <a href="${resetUrl}" class="btn" style="color: #faf8f5;">Reset Password</a>
            </div>

            <p>This password reset link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
            
            <p style="margin-bottom: 5px; font-weight: bold;">Or copy and paste this link in your browser:</p>
            <div class="link-fallback">
              <a href="${resetUrl}" style="color: #6b1d2f;">${resetUrl}</a>
            </div>
          </div>
          <div class="footer">
            &copy; 2026 The Paperworm. All rights reserved. <br>
            Adding character to your desk, one page at a time.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailNotification(to, "Reset your Paperworm password", htmlContent);
}
