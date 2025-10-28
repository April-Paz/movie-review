
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// IMPORT MIDDLEWARES & ROUTES 
const connectDB = require('./shared/middlewares/connect-db');
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const reviewRoutes = require('./routes/reviews');
const tmdbRoutes = require('./routes/tmdb');

// APPLICATION-LEVEL MIDDLEWARES 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Atlas Connection Middleware
app.use(connectDB);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ROUTES SETUP
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tmdb', tmdbRoutes);

// HEALTH & TEST ROUTES 
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    status: 'success',
    database: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌',
    databaseType: 'MongoDB Atlas'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🎬 Movie Review API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      type: 'MongoDB Atlas',
      status: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌',
      name: mongoose.connection.name,
      host: mongoose.connection.host
    },
    version: '1.0.0',
    phase: 'Phase 3 - MongoDB Atlas Integration'
  });
});

// Database status route
app.get('/api/db-status', (req, res) => {
  res.json({
    database: 'MongoDB Atlas',
    status: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌',
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    atlas: true,
    readyState: mongoose.connection.readyState
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: '🎬 Movie Review API is running!',
    version: '1.0.0',
    phase: 'Phase 3 - MongoDB Atlas Complete',
    database: {
      type: 'MongoDB Atlas',
      status: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'
    },
    availableRoutes: [
      '/api/health',
      '/api/db-status',
      '/test',
      '/api/auth/register',
      '/api/auth/login', 
      '/api/movies',
      '/api/movies/search/:query',
      '/api/reviews/movie/:id/reviews',
      '/api/tmdb/status',
      '/api/tmdb/movies/popular',
      '/api/tmdb/movies/search?q=avengers',
      '/api/debug-env'
    ]
  });
});

// Debug route
app.get('/api/debug-env', (req, res) => {
  res.json({
    mongodb: {
      uri: process.env.MONGODB_URI ? 'Configured' : 'NOT FOUND',
      type: 'MongoDB Atlas',
      status: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'
    },
    tmdbKey: process.env.TMDB_API_KEY ? 'Configured' : 'NOT FOUND',
    tmdbKeyLength: process.env.TMDB_API_KEY ? process.env.TMDB_API_KEY.length : 0,
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET ? 'Configured' : 'Using default'
  });
});

// ERROR HANDLING MIDDLEWARES

// 404 Not Found handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    requestedUrl: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/db-status',
      'GET /test',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/movies',
      'GET /api/movies/:id',
      'GET /api/movies/search/:query',
      'GET /api/reviews/movie/:id/reviews',
      'GET /api/tmdb/status',
      'GET /api/tmdb/movies/popular'
    ]
  });
});

// Error-handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Error:', error);
  
  // MongoDB Atlas connection error
  if (error.message.includes('MongoDB Atlas connection failed')) {
    return res.status(503).json({
      success: false,
      error: 'Database connection failed',
      details: 'Check your MongoDB Atlas connection string in .env file'
    });
  }
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: Object.values(error.errors).map(err => err.message)
    });
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate field value entered'
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }
  
  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// START SERVER 
app.listen(PORT, () => {
  console.log(`\n🎬 ==========================================`);
  console.log(`Movie Review API Server Started!`);
  console.log(`Port: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: MongoDB Atlas`);
  console.log(`Status: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Connecting...'}`);
  console.log(`==========================================\n`);
  
  console.log(`Available Test Endpoints:`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`DB Status: http://localhost:${PORT}/api/db-status`);
  console.log(`Server Test: http://localhost:${PORT}/test`);
  console.log(`TMDB Status: http://localhost:${PORT}/api/tmdb/status`);
  console.log(`Popular Movies: http://localhost:${PORT}/api/tmdb/movies/popular`);
  console.log(`Debug Info: http://localhost:${PORT}/api/debug-env`);
  console.log(`Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`Login: POST http://localhost:${PORT}/api/auth/login\n`);
  
  console.log(`Phase 3 Features Implemented:`);
  console.log(`MongoDB Atlas Integration`);
  console.log(`Database Connection Middleware`);
  console.log(`MongoDB Compass Ready`);
  console.log(`Modular Architecture`);
  console.log(`Application-level Middlewares`);
  console.log(`Proper Error Handling`);
  console.log(`TMDB API Integration`);
  console.log(`JWT Authentication Ready`);
});