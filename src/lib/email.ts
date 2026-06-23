/**
 * Utility to send email notifications via Resend API
 */

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

export async function sendVerificationEmail(to: string, token: string): Promise<boolean> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verificationLink = `${baseUrl}/verify-email?token=${token}`;

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
            <h1>Welcome to the Bookstore!</h1>
            <p>Thank you for creating an account with The Paperworm. To finish setting up your account, please verify your email address by clicking the button below:</p>
            
            <div class="btn-container">
              <a href="${verificationLink}" class="btn">Verify Email Address</a>
            </div>

            <p>This verification link is valid for 24 hours. If you did not sign up for a Paperworm account, you can safely ignore this email.</p>
            
            <p style="margin-bottom: 5px; font-weight: bold;">Or copy and paste this link in your browser:</p>
            <div class="link-fallback">
              <a href="${verificationLink}" style="color: #6b1d2f;">${verificationLink}</a>
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

  return sendEmailNotification(to, "Verify your Paperworm account", htmlContent);
}
