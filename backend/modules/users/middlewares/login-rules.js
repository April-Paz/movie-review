const { body } = require("express-validator");
const checkValidation = require('../../../shared/middlewares/check-validation');

const loginRules = [
  body("email")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

];

module.exports = loginRules;