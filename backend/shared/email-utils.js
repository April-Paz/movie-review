const { google } = require("googleapis");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const SENDER_EMAIL = process.env.GOOGLE_SENDER_EMAIL;

// Validate environment variables
function validateEnv() {
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'GOOGLE_SENDER_EMAIL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

let oAuth2Client;
let gmail;

try {
  validateEnv();
  
  oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  
  gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  
  console.log("Gmail API initialized successfully");
} catch (error) {
  console.error("Failed to initialize Gmail API:", error.message);
  console.log("Email functionality will be disabled");
}

async function sendEmail(to, subject, message) {
  // Validate input
  if (!to || !to.trim()) {
    throw new Error("Recipient email is required");
  }
  if (!subject || !subject.trim()) {
    throw new Error("Email subject is required");
  }
  if (!message || !message.trim()) {
    throw new Error("Email message is required");
  }

  // Check if Gmail API is initialized
  if (!gmail) {
    console.warn("Gmail API not initialized, email not sent");
    return false;
  }

  try {
    // Create email message
    const emailLines = [
      `From: ${SENDER_EMAIL}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/html; charset=UTF-8",
      "MIME-Version: 1.0",
      "",
      message.replace(/\n/g, '<br>')
    ];
    
    const email = emailLines.join('\n');
    
    // Encode email
    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    console.log(`Email sent to ${to}, message ID: ${response.data.id}`);
    return true;
    
  } catch (error) {
    console.error("Error sending email:", error.message);
    
    // Handle specific errors
    if (error.code === 401) {
      console.error("Authentication error - check refresh token");
    } else if (error.code === 403) {
      console.error("Permission denied - check Gmail API scopes");
    }
    
    return false;
  }
}

// Test function (optional)
async function testEmailConnection() {
  if (!gmail) {
    console.log("Gmail API not initialized");
    return false;
  }
  
  try {
    const profile = await gmail.users.getProfile({ userId: 'me' });
    console.log(`Connected to Gmail as: ${profile.data.emailAddress}`);
    return true;
  } catch (error) {
    console.error("Failed to connect to Gmail:", error.message);
    return false;
  }
}

module.exports = { sendEmail, testEmailConnection };