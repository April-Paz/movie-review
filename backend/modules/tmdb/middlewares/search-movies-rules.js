// W.I.P - not working as of now

const { query } = require("express-validator");
const checkValidation = require('../../../shared/middlewares/check-validation');

const searchMoviesRules = [
  query("q")
    .isString()
    .withMessage("Search query must be a string")
    .notEmpty()
    .withMessage("Search query is required"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  checkValidation,
];

module.exports = searchMoviesRules;