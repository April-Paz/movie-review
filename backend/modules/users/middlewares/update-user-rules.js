const { body } = require("express-validator");
const checkValidation = require('../../../shared/middlewares/check-validation');

const updateUserRules = [
  body("username")
    .optional()
    .isString()
    .withMessage("Username must be a string")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username should only contain letters, numbers, and underscores"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail(),

  body("avatar")
    .optional()
    .isString()
    .withMessage("Avatar must be a string"),

  checkValidation,
];

module.exports = updateUserRules;