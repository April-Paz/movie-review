require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { moviesRoute } = require("./modules/movies/movies-routes");
const { reviewsRoute } = require("./modules/reviews/reviews-routes");
const { usersRoute } = require("./modules/users/users-routes");
const { tmdbRoute } = require("./modules/tmdb/tmdb-routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || process.env.DB_URL, {
  dbName: "movie-review"
})
.then(() => console.log("Database Connected"))
.catch(err => {
  console.error("Database connection failed:", err.message);
  process.exit(1);
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://movie-review-eight-iota.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// Basic request logging (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Routes
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString() 
  });
});

app.use("/api", moviesRoute);
app.use("/api", reviewsRoute);
app.use("/api", usersRoute);
app.use("/api", tmdbRoute);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});