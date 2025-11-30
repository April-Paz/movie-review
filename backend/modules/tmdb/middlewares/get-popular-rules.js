const { query } = require("express-validator");
const checkValidation = require('../../../shared/middlewares/check-validation');

const getPopularRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  checkValidation,
];

module.exports = getPopularRules;