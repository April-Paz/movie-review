// backend/server.js
// Import and configure the 'dotenv' package at the top of server.js to load environment variables.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./shared/middlewares/connect-db");

// Import routes
const { moviesRoute } = require("./modules/movies/middlewares/movies-routes");
const { reviewsRoute } = require("./modules/reviews/middlewares/reviews-routes");
const { usersRoute } = require("./modules/users/middlewares/users-routes");
const { tmdbRoute } = require("./modules/tmdb/middlewares/tmdb-routes");

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || "localhost";

const server = express();

// CORS configuration
server.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Built-in middlewares to parse request body in application-level
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Add the connectDB middleware in application-level, before defining routes.
server.use(connectDB);

// Health check route
server.get("/health", (req, res) => {
  res.json({ 
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString() 
  });
});

// Mount all the routes with /api prefix
server.use("/api", moviesRoute);
server.use("/api", reviewsRoute);
server.use("/api", usersRoute);
server.use("/api", tmdbRoute);

// Error-handling middleware to logs the error for debugging.
server.use((error, req, res, next) => {
  console.log(error);
  res.status(500).json({ 
    success: false,
    error: "Oops! Internal server error!" 
  });
});

// Middleware to handle route not found error.
server.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    error: `404! ${req.method} ${req.path} Not Found.` 
  });
});

server.listen(port, hostname, (error) => {
  if (error) console.log(error.message);
  else {
    console.log(`Movie Review API Server running on http://${hostname}:${port}`);
    console.log(`Health check: http://${hostname}:${port}/health`);
    console.log(`TMDB API: ${process.env.TMDB_API_KEY ? 'Configured' : 'Missing'}`);
    console.log(`Database: ${process.env.DB_URL ? 'Configured' : 'Missing'}`);
  }
});