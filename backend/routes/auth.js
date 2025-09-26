const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
    res.json({ 
        success: true,
        message: 'Auth route is working!',
        timestamp: new Date().toISOString()
    });
});

// Register route
router.post('/register', (req, res) => {
    res.json({ 
        success: true,
        message: 'User registration endpoint'
    });
});

// Login route
router.post('/login', (req, res) => {
    res.json({ 
        success: true,
        message: 'User login endpoint'
    });
});

module.exports = router;