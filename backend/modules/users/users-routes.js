// backend/modules/users/users-routes.js
const { Router } = require("express");

const createUserRules = require("./middlewares/create-user-rules");
const updateUserRules = require("./middlewares/update-user-rules");
const loginRules = require("./middlewares/login-rules");
const UserModel = require("./users-model");
const { authenticateToken, requireAdmin } = require("../../shared/middlewares/auth");

const usersRoute = Router();

// POST - Register new user
usersRoute.post("/register", createUserRules, async (req, res) => {
  const result = await UserModel.createUser(req.body);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.status(result.status).json(result);
});

// POST - User login
usersRoute.post("/login", loginRules, async (req, res) => {
  const { email, password } = req.body;
  const result = await UserModel.loginUser(email, password);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET - Get all users (admin only)
usersRoute.get("/users", authenticateToken, requireAdmin, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await UserModel.getAllUsers(parseInt(page), parseInt(limit));
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET - Get user by ID
usersRoute.get("/users/:id", authenticateToken, async (req, res) => {
  // Users can only view their own profile unless they're admin
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }
  
  const result = await UserModel.getUserById(req.params.id);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// PUT  - Update user
usersRoute.put("/users/:id", updateUserRules, authenticateToken, async (req, res) => {
  // Users can only update their own profile unless they're admin
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }
  
  const result = await UserModel.updateUser(req.params.id, req.body);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// DELETE - Delete user (admin only)
usersRoute.delete("/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  const result = await UserModel.deleteUser(req.params.id);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET - Get current user profile
usersRoute.get("/profile", authenticateToken, async (req, res) => {
  const result = await UserModel.getUserById(req.user._id);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

module.exports = { usersRoute };