const { Router } = require("express");

const getPopularRules = require("./middlewares/get-popular-rules");
const searchMoviesRules = require("./middlewares/search-movies-rules");
const getMovieRules = require("./middlewares/get-movie-rules");
const getTrendingRules = require("./middlewares/get-trending-rules");
const TMDbModel = require("./tmdb-model");

const tmdbRoute = Router();

// GET - Check TMDB API status
tmdbRoute.get("/tmdb/status", async (req, res) => {
  const result = await TMDbModel.getAPIStatus();
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET - Get popular movies (Use only this for now)
tmdbRoute.get("/tmdb/movies/popular", getPopularRules, async (req, res) => {
  const page = req.query.page || 1;
  const result = await TMDbModel.getPopularMovies(parseInt(page));
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET - Get trending movies (W.I.P)
tmdbRoute.get("/tmdb/movies/trending", getTrendingRules, async (req, res) => {
  const timeWindow = req.query.timeWindow || 'week';
  const result = await TMDbModel.getTrendingMovies(timeWindow);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET - Search movies (W.I.P)
tmdbRoute.get("/tmdb/movies/search", searchMoviesRules, async (req, res) => {
  const { q: query, page = 1 } = req.query;
  const result = await TMDbModel.searchMovies(query, parseInt(page));
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET - Get movie details (W.I.P)
tmdbRoute.get("/tmdb/movies/:id", getMovieRules, async (req, res) => {
  const result = await TMDbModel.getMovieDetails(req.params.id);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET - Get similar movies (W.I.P)
tmdbRoute.get("/tmdb/movies/:id/similar", getMovieRules, async (req, res) => {
  const result = await TMDbModel.getSimilarMovies(req.params.id);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET - Get movie genres (W.I.P)
tmdbRoute.get("/tmdb/genres", async (req, res) => {
  const result = await TMDbModel.getGenres();
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET - Get now playing movies (W.I.P)
tmdbRoute.get("/tmdb/movies/now_playing", getPopularRules, async (req, res) => {
  const page = req.query.page || 1;
  const result = await TMDbModel.getNowPlayingMovies(parseInt(page));
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET - Get upcoming movies (W.I.P)
tmdbRoute.get("/tmdb/movies/upcoming", getPopularRules, async (req, res) => {
  const page = req.query.page || 1;
  const result = await TMDbModel.getUpcomingMovies(parseInt(page));
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

module.exports = { tmdbRoute };