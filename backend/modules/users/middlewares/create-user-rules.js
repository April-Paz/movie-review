const { body } = require("express-validator");
const checkValidation = require('../../../shared/middlewares/check-validation');

const createUserRules = [
  body("username")
    .isString()
    .withMessage("Username must be a string")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username should only contain letters, numbers, and underscores")
    .notEmpty()
    .withMessage("Username is required"),

  body("email")
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .notEmpty()
    .withMessage("Password is required"),

  checkValidation,
];

module.exports = createUserRules;