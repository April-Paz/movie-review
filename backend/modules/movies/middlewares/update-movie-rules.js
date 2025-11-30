const { body } = require("express-validator");
const checkValidation = require('../../../shared/middlewares/check-validation');

const updateMovieRules = [
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 1 })
    .withMessage("Title cannot be empty"),

  body("releaseYear")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 5 })
    .withMessage("Release year must be a valid year"),

  checkValidation,
];

module.exports = updateMovieRules;