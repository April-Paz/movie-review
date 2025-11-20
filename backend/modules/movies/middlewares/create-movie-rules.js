// backend/modules/movies/middlewares/create-movie-rules.js
const { body } = require("express-validator");
const checkValidation = require('../../../shared/middlewares/check-validation');

const createMovieRules = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 1 })
    .withMessage("Title is required")
    .notEmpty()
    .withMessage("Title is required"),

  body("releaseYear")
    .isInt({ min: 1900, max: new Date().getFullYear() + 5 })
    .withMessage("Release year must be a valid year")
    .notEmpty()
    .withMessage("Release year is required"),

  checkValidation,
];

module.exports = createMovieRules;