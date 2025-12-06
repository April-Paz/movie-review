// server.js - UPDATED FOR RENDER
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const { moviesRoute } = require("./modules/movies/movies-routes");
const { reviewsRoute } = require("./modules/reviews/reviews-routes");
const { usersRoute } = require("./modules/users/users-routes");
const { tmdbRoute } = require("./modules/tmdb/tmdb-routes");

const port = process.env.PORT || 3000;
const server = express();

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.DB_URL, { 
      dbName: "movie-review" 
    });
    console.log("Database Connected");
  } catch (error) {
    console.log("Database connection failed");
    console.log(error);
    process.exit(1); 
  }
}

// Initialize database connection
connectDB();

// CORS configuration for Render
server.use(cors({
  origin: [
    'http://localhost:5173',
    'movie-review-eight-iota.vercel.app', 
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Health check route
server.get("/health", (req, res) => {
  res.json({ 
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString() 
  });
});

// API routes
server.use("/api", moviesRoute);
server.use("/api", reviewsRoute);
server.use("/api", usersRoute);
server.use("/api", tmdbRoute);

// Serve static files from frontend in production
if (process.env.NODE_ENV === 'production') {
  server.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  server.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

server.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({ 
    success: false,
    error: "Internal server error!" 
  });
});

server.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    error: `404! ${req.method} ${req.path} Not Found.` 
  });
});

server.listen(port, '0.0.0.0', (error) => {
  if (error) {
    console.log(error.message);
    process.exit(1);
  } else {
    console.log(`Movie Review API Server running on port ${port}`);
    console.log(`Health check: /health`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`TMDB API: ${process.env.TMDB_API_KEY ? 'Configured' : 'Missing'}`);
    console.log(`Database: ${process.env.MONGODB_URI ? 'Configured' : 'Missing'}`);
  }
});