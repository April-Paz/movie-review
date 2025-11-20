// backend/modules/tmdb/middlewares/tmdb-routes.js
const { Router } = require("express");

const getPopularRules = require("./get-popular-rules");
const searchMoviesRules = require("./search-movies-rules");
const getMovieRules = require("./get-movie-rules");
const getTrendingRules = require("./get-trending-rules");
const TMDbModel = require("../tmdb-model");

const tmdbRoute = Router();

// GET /api/tmdb/status - Check TMDB API status
tmdbRoute.get("/tmdb/status", async (req, res) => {
  const result = await TMDbModel.getAPIStatus();
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET /api/tmdb/movies/popular - Get popular movies
tmdbRoute.get("/tmdb/movies/popular", getPopularRules, async (req, res) => {
  const page = req.query.page || 1;
  const result = await TMDbModel.getPopularMovies(parseInt(page));
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET /api/tmdb/movies/trending - Get trending movies
tmdbRoute.get("/tmdb/movies/trending", getTrendingRules, async (req, res) => {
  const timeWindow = req.query.timeWindow || 'week';
  const result = await TMDbModel.getTrendingMovies(timeWindow);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET /api/tmdb/movies/search - Search movies
tmdbRoute.get("/tmdb/movies/search", searchMoviesRules, async (req, res) => {
  const { q: query, page = 1 } = req.query;
  const result = await TMDbModel.searchMovies(query, parseInt(page));
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET /api/tmdb/movies/:id - Get movie details
tmdbRoute.get("/tmdb/movies/:id", getMovieRules, async (req, res) => {
  const result = await TMDbModel.getMovieDetails(req.params.id);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET /api/tmdb/movies/:id/similar - Get similar movies
tmdbRoute.get("/tmdb/movies/:id/similar", getMovieRules, async (req, res) => {
  const result = await TMDbModel.getSimilarMovies(req.params.id);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET /api/tmdb/genres - Get movie genres
tmdbRoute.get("/tmdb/genres", async (req, res) => {
  const result = await TMDbModel.getGenres();
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET /api/tmdb/movies/now_playing - Get now playing movies
tmdbRoute.get("/tmdb/movies/now_playing", getPopularRules, async (req, res) => {
  const page = req.query.page || 1;
  const result = await TMDbModel.getNowPlayingMovies(parseInt(page));
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET /api/tmdb/movies/upcoming - Get upcoming movies
tmdbRoute.get("/tmdb/movies/upcoming", getPopularRules, async (req, res) => {
  const page = req.query.page || 1;
  const result = await TMDbModel.getUpcomingMovies(parseInt(page));
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

module.exports = { tmdbRoute };