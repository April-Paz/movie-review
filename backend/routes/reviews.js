// routes/reviews.js 
const express = require('express');
const router = express.Router();

// Get reviews for a movie 
router.get('/movie/:id/reviews', (req, res) => {
    res.json({ 
        success: true,
        message: `Get reviews for movie ID: ${req.params.id}`,
        endpoint: 'GET /api/reviews/movie/:id/reviews'
    });
});

// Add review to movie
router.post('/movie/:id/reviews', (req, res) => {
    res.json({ 
        success: true,
        message: `Add review to movie ID: ${req.params.id}`,
        endpoint: 'POST /api/reviews/movie/:id/reviews'
    });
});

// Update review
router.put('/:id', (req, res) => {
    res.json({ 
        success: true,
        message: `Update review ID: ${req.params.id}`,
        endpoint: 'PUT /api/reviews/:id'
    });
});

// Delete review
router.delete('/:id', (req, res) => {
    res.json({ 
        success: true,
        message: `Delete review ID: ${req.params.id}`,
        endpoint: 'DELETE /api/reviews/:id'
    });
});

module.exports = router;