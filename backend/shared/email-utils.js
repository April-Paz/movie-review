const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({  // FIXED: createTransport not createTransporter
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_PASSWORD,
  },
});

async function sendEmail(to, subject, message) {
  if (!to) throw new Error("Email is required");
  if (!subject) throw new Error("Subject is required");
  if (!message) throw new Error("Message is required");

  try {
    const info = await transporter.sendMail({
      from: process.env.GOOGLE_EMAIL,
      to: to,
      subject: subject,
      text: message,
      html: message.replace(/\n/g, '<br>')
    });
    
    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}

module.exports = sendEmail;