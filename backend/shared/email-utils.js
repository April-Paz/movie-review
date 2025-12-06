const sendEmail = require("./send-utils");

/**
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<boolean>} - Success status
 */
async function sendOTPEmail(email, otp) {
  const subject = "Your Login OTP - MovieReviews";
  
  const plainMessage = `
    MovieReviews Login OTP
    
    Your one-time password is: ${otp}
    
    This OTP will expire in 5 minutes.
    
    If you didn't request this, please ignore this email.
    
    ---
    MovieReviews © ${new Date().getFullYear()}
  `;

  try {
    const htmlMessage = plainMessage.replace(/\n/g, '<br>');
    const result = await sendEmail(email, subject, htmlMessage);
    return result;
  } catch (error) {
    console.error("Failed to send OTP email:", error.message);
    return false;
  }
}

module.exports = sendOTPEmail;