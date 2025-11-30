const { body } = require("express-validator");

const verifyLoginRules = [
  body("email")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required"),

  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers")
    .notEmpty()
    .withMessage("OTP is required"),
];

module.exports = verifyLoginRules;