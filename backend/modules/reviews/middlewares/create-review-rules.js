// backend/modules/reviews/middlewares/create-review-rules.js
const { body } = require("express-validator");
const checkValidation = require('../../../shared/middlewares/check-validation');

const createReviewRules = [
  body("movieId")
    .isInt({ min: 1 })
    .withMessage("Movie ID must be a valid TMDB ID")
    .notEmpty()
    .withMessage("Movie ID is required"),

  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5")
    .notEmpty()
    .withMessage("Rating is required"),

  body("comment")
    .isString()
    .withMessage("Comment must be a string")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Comment must be between 10 and 1000 characters")
    .notEmpty()
    .withMessage("Comment is required"),

  checkValidation,
];

module.exports = createReviewRules;