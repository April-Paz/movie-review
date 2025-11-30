const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 5 }, // 5 minutes
});

const OTPModel = mongoose.model("OTP", OTPSchema);

module.exports = OTPModel;