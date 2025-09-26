// routes/tmdb.js - (WIP) TMDB API INTEGRATION
require('dotenv').config();
const express = require('express');
const https = require('https');
const router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

console.log('🎬 TMDB API Routes Loaded - Project: movie-review');

// Helper function to make TMDB API calls
const fetchFromTMDB = (endpoint, params = {}) => {
    return new Promise((resolve, reject) => {
        const urlParams = new URLSearchParams({
            api_key: TMDB_API_KEY,
            ...params
        });
        
        const url = `${TMDB_BASE_URL}${endpoint}?${urlParams}`;
        
        https.get(url, (response) => {
            let data = '';
            
            // Collect data chunks
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            // When all data is received
            response.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    
                    // Check for TMDB API errors
                    if (parsedData.success === false) {
                        reject(new Error(parsedData.status_message || 'TMDB API error'));
                    } else {
                        resolve(parsedData);
                    }
                } catch (error) {
                    reject(new Error('Failed to parse TMDB response: ' + error.message));
                }
            });
            
        }).on('error', (error) => {
            reject(new Error('TMDB API request failed: ' + error.message));
        });
    });
};

// ===== TMDB API ROUTES =====

// GET /api/tmdb/status - Check API connection
router.get('/status', async (req, res) => {
    try {
        if (!TMDB_API_KEY) {
            return res.status(400).json({
                success: false,
                error: 'TMDB_API_KEY not configured in .env file'
            });
        }

        // Test with genres endpoint
        const data = await fetchFromTMDB('/genre/movie/list');
        
        res.json({
            success: true,
            message: '✅ TMDB API is connected successfully!',
            project: 'movie-review',
            apiKey: 'Configured ✅',
            genresCount: data.genres.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            project: 'movie-review'
        });
    }
});

// GET /api/tmdb/movies/popular - Get popular movies
router.get('/movies/popular', async (req, res) => {
    try {
        if (!TMDB_API_KEY) {
            return res.status(400).json({
                success: false,
                error: 'TMDB API key required'
            });
        }

        const page = req.query.page || 1;
        const data = await fetchFromTMDB('/movie/popular', { page });
        
        res.json({
            success: true,
            project: 'movie-review',
            source: 'The Movie Database (TMDB)',
            page: data.page,
            totalPages: data.total_pages,
            totalResults: data.total_results,
            movies: data.results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            project: 'movie-review'
        });
    }
});

// GET /api/tmdb/movies/trending - Get trending movies
router.get('/movies/trending', async (req, res) => {
    try {
        if (!TMDB_API_KEY) {
            return res.status(400).json({
                success: false,
                error: 'TMDB API key required'
            });
        }

        const timeWindow = req.query.timeWindow || 'week'; // 'day' or 'week'
        const data = await fetchFromTMDB(`/trending/movie/${timeWindow}`);
        
        res.json({
            success: true,
            project: 'movie-review',
            timeWindow: timeWindow,
            movies: data.results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/tmdb/movies/search - Search movies
router.get('/movies/search', async (req, res) => {
    try {
        if (!TMDB_API_KEY) {
            return res.status(400).json({
                success: false,
                error: 'TMDB API key required'
            });
        }

        const query = req.query.q;
        if (!query || query.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Search query (q) is required',
                example: '/api/tmdb/movies/search?q=avengers'
            });
        }

        const page = req.query.page || 1;
        const data = await fetchFromTMDB('/search/movie', { 
            query: query.trim(),
            page: page
        });
        
        res.json({
            success: true,
            project: 'movie-review',
            query: query,
            page: data.page,
            totalPages: data.total_pages,
            totalResults: data.total_results,
            movies: data.results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/tmdb/movies/:id - Get movie details
router.get('/movies/:id', async (req, res) => {
    try {
        if (!TMDB_API_KEY) {
            return res.status(400).json({
                success: false,
                error: 'TMDB API key required'
            });
        }

        const movieId = req.params.id;
        const data = await fetchFromTMDB(`/movie/${movieId}`);
        
        res.json({
            success: true,
            project: 'movie-review',
            movie: {
                id: data.id,
                title: data.title,
                overview: data.overview,
                poster_path: data.poster_path,
                backdrop_path: data.backdrop_path,
                release_date: data.release_date,
                runtime: data.runtime,
                vote_average: data.vote_average,
                vote_count: data.vote_count,
                genres: data.genres,
                production_companies: data.production_companies,
                budget: data.budget,
                revenue: data.revenue,
                status: data.status,
                tagline: data.tagline
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/tmdb/movies/:id/similar - Get similar movies
router.get('/movies/:id/similar', async (req, res) => {
    try {
        if (!TMDB_API_KEY) {
            return res.status(400).json({
                success: false,
                error: 'TMDB API key required'
            });
        }

        const movieId = req.params.id;
        const data = await fetchFromTMDB(`/movie/${movieId}/similar`);
        
        res.json({
            success: true,
            project: 'movie-review',
            similarMovies: data.results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/tmdb/genres - Get movie genres
router.get('/genres', async (req, res) => {
    try {
        if (!TMDB_API_KEY) {
            return res.status(400).json({
                success: false,
                error: 'TMDB API key required'
            });
        }

        const data = await fetchFromTMDB('/genre/movie/list');
        
        res.json({
            success: true,
            project: 'movie-review',
            genres: data.genres
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/tmdb/now_playing - Get now playing movies
router.get('/movies/now_playing', async (req, res) => {
    try {
        if (!TMDB_API_KEY) {
            return res.status(400).json({
                success: false,
                error: 'TMDB API key required'
            });
        }

        const page = req.query.page || 1;
        const data = await fetchFromTMDB('/movie/now_playing', { page });
        
        res.json({
            success: true,
            project: 'movie-review',
            page: data.page,
            totalPages: data.total_pages,
            movies: data.results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/tmdb/upcoming - Get upcoming movies
router.get('/movies/upcoming', async (req, res) => {
    try {
        if (!TMDB_API_KEY) {
            return res.status(400).json({
                success: false,
                error: 'TMDB API key required'
            });
        }

        const page = req.query.page || 1;
        const data = await fetchFromTMDB('/movie/upcoming', { page });
        
        res.json({
            success: true,
            project: 'movie-review',
            page: data.page,
            totalPages: data.total_pages,
            movies: data.results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===== TEST ROUTES =====

// GET /api/tmdb/test - test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'TMDB API routes are working!',
        project: 'movie-review',
        timestamp: new Date().toISOString(),
        apiKeyStatus: TMDB_API_KEY ? 'Configured ✅' : 'Missing ❌'
    });
});

// GET /api/tmdb/test-key - API key test
router.get('/test-key', (req, res) => {
    res.json({
        apiKeyPresent: !!TMDB_API_KEY,
        apiKeyLength: TMDB_API_KEY ? TMDB_API_KEY.length : 0,
        apiKeyPreview: TMDB_API_KEY ? TMDB_API_KEY.substring(0, 8) + '...' : 'None',
        message: 'API Key is loaded!',
        project: 'movie-review'
    });
});

module.exports = router;