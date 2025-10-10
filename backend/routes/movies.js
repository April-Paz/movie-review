const express = require('express');
const { validateMovie, validateMovieId, validatePagination } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const MovieModel = require('../models/MovieModel');
const router = express.Router();

// Get all movies
router.get('/', validatePagination, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await MovieModel.getAllMovies(parseInt(page), parseInt(limit));
  res.status(result.status || 200).json(result);
});

// Get movie by ID
router.get('/:id', validateMovieId, async (req, res) => {
  const result = await MovieModel.getMovieById(req.params.id);
  res.status(result.status || 200).json(result);
});

// Create movie (admin only)
router.post('/', authenticateToken, requireAdmin, validateMovie, async (req, res) => {
  const result = await MovieModel.createMovie(req.body);
  res.status(result.status || 200).json(result);
});

// Update movie (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateMovieId, validateMovie, async (req, res) => {
  const result = await MovieModel.updateMovie(req.params.id, req.body);
  res.status(result.status || 200).json(result);
});

// Delete movie (admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateMovieId, async (req, res) => {
  const result = await MovieModel.deleteMovie(req.params.id);
  res.status(result.status || 200).json(result);
});

// Search movies
router.get('/search/:query', validatePagination, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await MovieModel.searchMovies(req.params.query, parseInt(page), parseInt(limit));
  res.status(result.status || 200).json(result);
});

module.exports = router;