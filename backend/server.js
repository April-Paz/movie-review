// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const tmdbRoutes = require('./routes/tmdb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (WIP)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-review';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        console.log('📊 Database:', mongoose.connection.name);
    })
    .catch(err => {
        console.log('❌ MongoDB connection error:', err.message);
        console.log('💡 Tip: Make sure MongoDB is running with: brew services start mongodb-community');
    });

// TEST ROUTE 
app.get('/test', (req, res) => {
    res.json({ 
        message: '✅ Server is working!',
        timestamp: new Date().toISOString(),
        status: 'success',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: '🎬 Movie Review API is running!',
        version: '1.0.0',
        phase: 'Phase 1 - Complete',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        availableRoutes: [
            '/test',
            '/api/auth/test',
            '/api/movies',
            '/api/movies/123',
            '/api/movies/search/avengers',
            '/api/tmdb/status',          
            '/api/tmdb/movies/popular',  
            '/api/tmdb/movies/search?q=avengers'  
        ]
    });
});

// Import and use routes
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const reviewRoutes = require('./routes/reviews');

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tmdb', tmdbRoutes);

// Debug route
app.get('/api/debug-env', (req, res) => {
    res.json({
        tmdbKey: process.env.TMDB_API_KEY ? 'Configured ✅' : 'NOT FOUND ❌',
        tmdbKeyLength: process.env.TMDB_API_KEY ? process.env.TMDB_API_KEY.length : 0,
        port: process.env.PORT,
        nodeEnv: process.env.NODE_ENV,
        mongodbUri: process.env.MONGODB_URI ? 'Configured ✅' : 'Using default',
        databaseStatus: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'
    });
});

// 404 handler 
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        requestedUrl: req.originalUrl,
        availableRoutes: [
            'GET /',
            'GET /test', 
            'GET /api/auth/test',
            'GET /api/movies',
            'GET /api/tmdb/status',           
            'GET /api/tmdb/movies/popular',   
            'POST /api/auth/register'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Test these endpoints:`);
    console.log(`   - http://localhost:${PORT}/`);
    console.log(`   - http://localhost:${PORT}/test`);
    console.log(`   - http://localhost:${PORT}/api/tmdb/status`);        
    console.log(`   - http://localhost:${PORT}/api/tmdb/movies/popular`); 
    console.log(`   - http://localhost:${PORT}/api/debug-env`);
});