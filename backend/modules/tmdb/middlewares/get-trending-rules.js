// backend/modules/tmdb/middlewares/get-trending-rules.js

// W.I.P - not working as of now
const { query } = require("express-validator");
const checkValidation = require('../../../shared/middlewares/check-validation');

const getTrendingRules = [
  query("timeWindow")
    .optional()
    .isIn(['day', 'week'])
    .withMessage("Time window must be 'day' or 'week'"),

  checkValidation,
];

module.exports = getTrendingRules;