require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { moviesRoute } = require("./modules/movies/movies-routes");
const { reviewsRoute } = require("./modules/reviews/reviews-routes");
const { usersRoute } = require("./modules/users/users-routes");
const { tmdbRoute } = require("./modules/tmdb/tmdb-routes");

const port = process.env.PORT || 3000;
// const hostname = process.env.HOSTNAME || "localhost";
const hostname = "0.0.0.0";

const server = express();

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URL, { dbName: "movie-review" });
    console.log("Database Connected");
  } catch (error) {
    console.log("Database connection failed");
    console.log(error);
    process.exit(1); 
  }
}

// Initialize database connection
connectDB();

// CORS configuration
server.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://movie-review-eight-iota.vercel.app',  // ADD https://
    'https://movie-review-eight-iota.vercel.app/', // Also try with trailing slash
    'http://movie-review-eight-iota.vercel.app'    // And http version
  ],
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

server.use("/api", moviesRoute);
server.use("/api", reviewsRoute);
server.use("/api", usersRoute);
server.use("/api", tmdbRoute);

server.use((error, req, res, next) => {
  console.log(error);
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

server.listen(port, hostname, (error) => {
  if (error) console.log(error.message);
  else {
    console.log(`Movie Review API Server running on http://${hostname}:${port}`);
    console.log(`Health check: http://${hostname}:${port}/health`);
    console.log(`TMDB API: ${process.env.TMDB_API_KEY ? 'Configured' : 'Missing'}`);
    console.log(`Database: ${process.env.DB_URL ? 'Configured' : 'Missing'}`);
  }
});