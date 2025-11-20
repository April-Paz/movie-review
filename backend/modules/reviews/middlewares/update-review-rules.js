// backend/modules/reviews/middlewares/update-review-rules.js
const { body } = require("express-validator");
const checkValidation = require('../../../shared/middlewares/check-validation');

const updateReviewRules = [
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .optional()
    .isString()
    .withMessage("Comment must be a string")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Comment must be between 10 and 1000 characters"),

  checkValidation,
];

module.exports = updateReviewRules;