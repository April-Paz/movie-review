const { Router } = require("express");

const createReviewRules = require("./middlewares/create-review-rules.js"); 
const updateReviewRules = require("./middlewares/update-review-rules.js"); 
const ReviewModel = require("./reviews-model.js");
const { authenticateToken } = require("../../shared/middlewares/auth.js");

const reviewsRoute = Router();

// GET - Get reviews for a movie
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

// GET - Get reviews by user
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

// GET - Get single review
reviewsRoute.get("/reviews/:id", async (req, res) => {
  const result = await ReviewModel.getReviewById(req.params.id);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// POST - Create new review
reviewsRoute.post("/reviews", createReviewRules, authenticateToken, async (req, res) => {
  const reviewData = {
    ...req.body,
    userId: req.user._id
  };
  
  try {
    const result = await ReviewModel.createReview(reviewData);
    
    if (!result.success) {
      return res.status(result.status).json(result);
    }
    
    res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in review route:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// PUT - Update review
reviewsRoute.put("/reviews/:id", updateReviewRules, authenticateToken, async (req, res) => {
  const result = await ReviewModel.updateReview(req.params.id, req.user._id, req.body);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// DELETE - Delete review (/api/reviews/:id)
reviewsRoute.delete("/reviews/:id", authenticateToken, async (req, res) => {
  const result = await ReviewModel.deleteReview(req.params.id, req.user._id);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

module.exports = { reviewsRoute };