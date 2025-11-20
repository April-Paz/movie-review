// backend/modules/reviews/middlewares/reviews-routes.js
const { Router } = require("express");

const createReviewRules = require("./create-review-rules"); 
const updateReviewRules = require("./update-review-rules.js"); 
const ReviewModel = require("../reviews-model");
const { authenticateToken } = require("../../../shared/middlewares/auth");

const reviewsRoute = Router();

// GET /api/reviews/movie/:movieId - Get reviews for a movie
reviewsRoute.get("/reviews/movie/:movieId", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await ReviewModel.getReviewsByMovie(
    req.params.movieId, 
    parseInt(page), 
    parseInt(limit)
  );
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET /api/reviews/user/:userId - Get reviews by user
reviewsRoute.get("/reviews/user/:userId", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await ReviewModel.getReviewsByUser(
    req.params.userId, 
    parseInt(page), 
    parseInt(limit)
  );
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET /api/reviews/:id - Get single review
reviewsRoute.get("/reviews/:id", async (req, res) => {
  const result = await ReviewModel.getReviewById(req.params.id);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// POST /api/reviews - Create new review
reviewsRoute.post("/reviews", createReviewRules, authenticateToken, async (req, res) => {
  const reviewData = {
    ...req.body,
    userId: req.user._id
  };
  const result = await ReviewModel.createReview(reviewData);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.status(result.status).json(result);
});

// PUT /api/reviews/:id - Update review
reviewsRoute.put("/reviews/:id", updateReviewRules, authenticateToken, async (req, res) => {
  const result = await ReviewModel.updateReview(req.params.id, req.user._id, req.body);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// DELETE /api/reviews/:id - Delete review
reviewsRoute.delete("/reviews/:id", authenticateToken, async (req, res) => {
  const result = await ReviewModel.deleteReview(req.params.id, req.user._id);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

module.exports = { reviewsRoute };