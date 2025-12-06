const { google } = require("googleapis");
const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.useOAuth2 = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN;
    
    if (this.useOAuth2) {
      // Using Gmail API OAuth2
      this.setupOAuth2();
    } else {
      // Fallback to standard SMTP
      this.setupSMTP();
    }
  }

  setupOAuth2() {
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
    const SENDER_EMAIL = process.env.GOOGLE_SENDER_EMAIL;

    this.oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    this.oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    this.gmail = google.gmail({ version: "v1", auth: this.oAuth2Client });
    this.senderEmail = SENDER_EMAIL;
    
    console.log("📧 Email service using Gmail API OAuth2");
  }

  setupSMTP() {
    const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
    const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;

    if (!GOOGLE_EMAIL || !GOOGLE_PASSWORD) {
      console.warn("⚠️ Email credentials not found. Email service disabled.");
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GOOGLE_EMAIL,
        pass: GOOGLE_PASSWORD,
      },
    });
    this.senderEmail = GOOGLE_EMAIL;
    
    console.log("📧 Email service using SMTP");
  }

  async sendEmailOAuth2(to, subject, message) {
    try {
      // Create HTML email with better formatting
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #000000;
              color: #FFD700;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .otp-code {
              background: #000000;
              color: #FFD700;
              font-size: 32px;
              font-weight: bold;
              padding: 15px;
              text-align: center;
              border-radius: 6px;
              letter-spacing: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎬 MovieReviews</h1>
          </div>
          <div class="content">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <div class="footer">
            <p>This email was sent from MovieReviews platform.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </body>
        </html>
      `;

      const rawEmail = [
        `From: MovieReviews <${this.senderEmail}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/html; charset=UTF-8`,
        `MIME-Version: 1.0`,
        ``,
        htmlContent,
      ];

      const composedEmail = rawEmail.join("\n");
      const encodedEmail = Buffer.from(composedEmail)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      // Remove any trailing "="
      const cleanEncodedEmail = encodedEmail.replace(/=+$/, "");

      const response = await this.gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: cleanEncodedEmail,
        },
      });

      console.log("✅ Email sent successfully via Gmail API:", response.data.id);
      return true;
    } catch (error) {
      console.error("❌ Gmail API Error:", error.response?.data || error.message);
      
      // Fallback to SMTP if OAuth2 fails
      if (this.transporter) {
        console.log("🔄 Falling back to SMTP...");
        return this.sendEmailSMTP(to, subject, message);
      }
      
      return false;
    }
  }

  async sendEmailSMTP(to, subject, message) {
    if (!this.transporter) {
      console.error("❌ SMTP transporter not configured");
      return false;
    }

    try {
      const mailOptions = {
        from: `MovieReviews <${this.senderEmail}>`,
        to: to,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #000000; color: #FFD700; padding: 20px; text-align: center;">
              <h1>🎬 MovieReviews</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
              <p>This email was sent from MovieReviews platform.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully via SMTP:", info.messageId);
      return true;
    } catch (error) {
      console.error("❌ SMTP Error:", error);
      return false;
    }
  }

  async sendEmail(to, subject, message) {
    if (!to || !subject || !message) {
      throw new Error("Email, subject, and message are required");
    }

    console.log(`📧 Sending email to: ${to}, Subject: ${subject}`);

    if (this.useOAuth2) {
      return this.sendEmailOAuth2(to, subject, message);
    } else if (this.transporter) {
      return this.sendEmailSMTP(to, subject, message);
    } else {
      console.error("❌ No email service configured");
      return false;
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export the sendEmail function
const sendEmail = async (to, subject, message) => {
  return emailService.sendEmail(to, subject, message);
};

module.exports = sendEmail;