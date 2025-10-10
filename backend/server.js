// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== APPLICATION-LEVEL MIDDLEWARES =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===== MONGODB CONNECTION =====
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-review';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    console.log('Database:', mongoose.connection.name);
  })
  .catch(err => {
    console.log('MongoDB connection error:', err.message);
    console.log('Make sure MongoDB is running with: brew services start mongodb-community');
  });

// ===== IMPORT ROUTES =====
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const reviewRoutes = require('./routes/reviews');
const tmdbRoutes = require('./routes/tmdb');

// ===== ROUTES SETUP =====
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tmdb', tmdbRoutes);

// ===== HEALTH & TEST ROUTES =====
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    status: 'success',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🎬 Movie Review API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    version: '1.0.0',
    phase: 'Phase 2 - Modular Architecture'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: '🎬 Movie Review API is running!',
    version: '1.0.0',
    phase: 'Phase 2 - Complete',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    availableRoutes: [
      '/api/health',
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
    tmdbKey: process.env.TMDB_API_KEY ? 'Configured' : 'NOT FOUND',
    tmdbKeyLength: process.env.TMDB_API_KEY ? process.env.TMDB_API_KEY.length : 0,
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
    mongodbUri: process.env.MONGODB_URI ? 'Configured' : 'Using default',
    databaseStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    jwtSecret: process.env.JWT_SECRET ? 'Configured' : 'Using default'
  });
});

// ===== PHASE 2 MIDDLEWARES =====

// 404 Not Found handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    requestedUrl: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /api/health',
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

// Error-handling middleware (Phase 2 requirement)
app.use((error, req, res, next) => {
  console.error('🚨 Error:', error);
  
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

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`\n🎬 ==========================================`);
  console.log(`Movie Review API Server Started!`);
  console.log(`Port: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Connecting...'}`);
  console.log(`==========================================\n`);
  
  console.log(`Available Test Endpoints:`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`Server Test: http://localhost:${PORT}/test`);
  console.log(`TMDB Status: http://localhost:${PORT}/api/tmdb/status`);
  console.log(`Popular Movies: http://localhost:${PORT}/api/tmdb/movies/popular`);
  console.log(`Debug Info: http://localhost:${PORT}/api/debug-env`);
  console.log(`Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`Login: POST http://localhost:${PORT}/api/auth/login\n`);
  
  console.log(`Phase 2 Features Implemented:`);
  console.log(`Modular Architecture`);
  console.log(`Application-level Middlewares`);
  console.log(`Proper Error Handling`);
  console.log(`404 Not Found Handler`);
  console.log(`MongoDB Integration`);
  console.log(`TMDB API Integration`);
  console.log(`JWT Authentication Ready`);
});