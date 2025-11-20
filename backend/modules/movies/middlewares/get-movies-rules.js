// backend/modules/movies/middlewares/get-movies-rules.js
const { query } = require("express-validator");
const checkValidation = require('../../../shared/middlewares/check-validation');

const getMoviesRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
    
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
    
  query("search")
    .optional()
    .isString()
    .withMessage("Search must be a string"),

  query("source")
    .optional()
    .isIn(['local', 'tmdb'])
    .withMessage("Source must be 'local' or 'tmdb'"),

  checkValidation,
];

module.exports = getMoviesRules;