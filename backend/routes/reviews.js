const express = require('express');
const { validateReview, validateReviewId, validatePagination } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const ReviewModel = require('../models/ReviewModel');
const router = express.Router();

// Get reviews for a movie
router.get('/movie/:movieId', validatePagination, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await ReviewModel.getReviewsByMovie(req.params.movieId, parseInt(page), parseInt(limit));
  res.status(result.status || 200).json(result);
});

// Get reviews by user
router.get('/user/:userId', validatePagination, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await ReviewModel.getReviewsByUser(req.params.userId, parseInt(page), parseInt(limit));
  res.status(result.status || 200).json(result);
});

// Create a new review (protected)
router.post('/', authenticateToken, validateReview, async (req, res) => {
  const reviewData = {
    ...req.body,
    userId: req.user._id
  };
  const result = await ReviewModel.createReview(reviewData);
  res.status(result.status || 200).json(result);
});

// Update a review (protected - user can only update their own)
router.put('/:id', authenticateToken, validateReviewId, async (req, res) => {
  const result = await ReviewModel.updateReview(req.params.id, req.user._id, req.body);
  res.status(result.status || 200).json(result);
});

// Delete a review (protected - user can only delete their own)
router.delete('/:id', authenticateToken, validateReviewId, async (req, res) => {
  const result = await ReviewModel.deleteReview(req.params.id, req.user._id);
  res.status(result.status || 200).json(result);
});

// Get review by ID
router.get('/:id', validateReviewId, async (req, res) => {
  const result = await ReviewModel.getReviewById(req.params.id);
  res.status(result.status || 200).json(result);
});

module.exports = router;