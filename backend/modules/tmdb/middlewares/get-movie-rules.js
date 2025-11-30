// W.I.P
const { param } = require("express-validator");
const checkValidation = require('../../../shared/middlewares/check-validation');

const getMovieRules = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Movie ID must be a valid integer"),

  checkValidation,
];

module.exports = getMovieRules;