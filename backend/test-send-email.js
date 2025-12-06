require('dotenv').config();
const sendEmail = require('./shared/send-utils');

console.log('📧 Testing Email Sending\n');

async function testEmail() {
  try {
    const toEmail = process.env.GOOGLE_SENDER_EMAIL;
    const subject = '🎬 Test Email from MovieReviews';
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #FFD700;">✅ Email Test Successful!</h2>
        <p>If you can read this, your Google OAuth setup is working!</p>
        <p>Time: ${new Date().toLocaleString()}</p>
        <hr>
        <small>MovieReviews OTP System</small>
      </div>
    `;

    console.log(`📤 Sending test email to: ${toEmail}`);
    
    const result = await sendEmail(toEmail, subject, html);
    
    if (result) {
      console.log('\n🎉 SUCCESS! Email sent successfully!');
      console.log('📬 Check your Gmail inbox for the test email');
    } else {
      console.log('\n❌ FAILED: Email not sent');
      console.log('💡 Check the error message above');
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

testEmail();