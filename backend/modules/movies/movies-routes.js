// backend/modules/movies/movies-routes.js
const { Router } = require("express");

const createMovieRules = require("./middlewares/create-movie-rules");
const updateMovieRules = require("./middlewares/update-movie-rules");
const getMoviesRules = require("./middlewares/get-movies-rules");
const MovieModel = require("./movies-model"); 
const { authenticateToken, requireAdmin } = require("../../shared/middlewares/auth");

const moviesRoute = Router();

// GET /api/movies
moviesRoute.get("/movies", getMoviesRules, async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  
  let result;
  if (search) {
    result = await MovieModel.searchMovies(search, parseInt(page), parseInt(limit));
  } else {
    result = await MovieModel.getAllMovies(parseInt(page), parseInt(limit));
  }
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET /api/movies/:id
moviesRoute.get("/movies/:id", async (req, res) => {
  const result = await MovieModel.getMovieById(req.params.id);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// POST /api/movies
moviesRoute.post("/movies", createMovieRules, authenticateToken, requireAdmin, async (req, res) => {
  const result = await MovieModel.createMovie(req.body);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.status(result.status).json(result);
});

// PUT /api/movies/:id
moviesRoute.put("/movies/:id", updateMovieRules, authenticateToken, requireAdmin, async (req, res) => {
  const result = await MovieModel.updateMovie(req.params.id, req.body);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// DELETE /api/movies/:id
moviesRoute.delete("/movies/:id", authenticateToken, requireAdmin, async (req, res) => {
  const result = await MovieModel.deleteMovie(req.params.id);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

module.exports = { moviesRoute };