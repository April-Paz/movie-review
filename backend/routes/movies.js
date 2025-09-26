const express = require('express');
const router = express.Router();

// Get all movies
router.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'Get all movies endpoint'
    });
});

// Get movie by ID
router.get('/:id', (req, res) => {
    res.json({ 
        success: true,
        message: `Get movie details for ID: ${req.params.id}`
    });
});

// Create movie
router.post('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'Create movie endpoint'
    });
});

// Search movies
router.get('/search/:query', (req, res) => {
    res.json({ 
        success: true,
        message: `Search movies for: "${req.params.query}"`
    });
});

module.exports = router;