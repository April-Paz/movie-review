// backend/shared/email-utils.js
const sendEmail = require("./send-utils");

/**
 * Send OTP email with formatted HTML
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<boolean>} - Success status
 */
async function sendOTPEmail(email, otp) {
  const subject = "Your Login OTP - MovieReviews";
  
  // Simple HTML email with OTP
  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #FFD700;">🎬 MovieReviews Login OTP</h2>
      <p>Your one-time password is:</p>
      <div style="font-size: 32px; font-weight: bold; color: #FFD700; 
                  background: #000; padding: 15px; text-align: center; 
                  margin: 20px 0; letter-spacing: 5px;">
        ${otp}
      </div>
      <p><strong>This OTP will expire in 5 minutes.</strong></p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px;">
        MovieReviews &copy; ${new Date().getFullYear()}
      </p>
    </div>
  `;

  try {
    const result = await sendEmail(email, subject, htmlMessage);
    return result;
  } catch (error) {
    console.error("Failed to send OTP email:", error.message);
    return false;
  }
}

module.exports = sendOTPEmail;