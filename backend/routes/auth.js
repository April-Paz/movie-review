const express = require('express');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');
const UserModel = require('../models/UserModel');
const router = express.Router();

// Register new user
router.post('/register', validateUserRegistration, async (req, res) => {
  const result = await UserModel.createUser(req.body);
  res.status(result.status || 200).json(result);
});

// Login user
router.post('/login', validateUserLogin, async (req, res) => {
  const { email, password } = req.body;
  const result = await UserModel.loginUser(email, password);
  res.status(result.status || 200).json(result);
});

// Get current user profile
router.get('/me', async (req, res) => {
  // This would require authentication middleware
  res.json({ 
    success: true,
    message: 'Get current user profile endpoint'
  });
});

module.exports = router;