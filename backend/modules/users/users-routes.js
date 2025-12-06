const { Router } = require("express");

const createUserRules = require("./middlewares/create-user-rules");
const updateUserRules = require("./middlewares/update-user-rules");
const loginRules = require("./middlewares/login-rules");
const verifyLoginRules = require("./middlewares/verify-login-rules");
const checkValidation = require("../../shared/middlewares/check-validation");

const User = require("../../shared/models/User"); 
const OTPModel = require("../../shared/models/OTP");
const sendOTPEmail = require("../../shared/email-utils");
const { matchPassword } = require("../../shared/password-utils");
const { encodeToken } = require("../../shared/jwt-utils");
const { randomNumberOfNDigits } = require("../../shared/compute-utils");
const { authenticateToken, requireAdmin } = require("../../shared/middlewares/auth");

const usersRoute = Router();

// POST - Register new user
usersRoute.post("/register", createUserRules, checkValidation, async (req, res) => {
  try {
    const newUser = req.body;
    const existingUser = await User.findOne({
      email: newUser.email,
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: `User with ${newUser.email} already exists`,
      });
    }
    
    const addedUser = await User.create(newUser);
    if (!addedUser) {
      return res.status(500).json({
        success: false,
        error: `Oops! User couldn't be added!`,
      });
    }
    
    const user = { 
      _id: addedUser._id,
      username: addedUser.username,
      email: addedUser.email,
      role: addedUser.role,
      avatar: addedUser.avatar,
      joinDate: addedUser.joinDate
    };
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to register user"
    });
  }
});

// POST - User login - Send OTP
usersRoute.post("/login", loginRules, checkValidation, async (req, res) => {
  try {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email }); 
    
    if (!foundUser) {
      return res.status(404).json({
        success: false,
        error: `User with ${email} doesn't exist`,
      });
    }
    
    const passwordMatched = matchPassword(password, foundUser.password);
    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        error: `Email and password didn't match`,
      });
    }

    // Generate OTP
    const otp = randomNumberOfNDigits(6);

    // Delete any existing OTP for this user
    await OTPModel.deleteOne({ account: foundUser._id });
    
    // Create new OTP
    await OTPModel.create({ 
      account: foundUser._id, 
      email: email,
      otp: otp.toString() 
    });
    
    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: "Failed to send OTP email. Please try again."
      });
    }
    
    res.json({ 
      success: true,
      message: "OTP sent to your email", 
      email: email 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process login"
    });
  }
});

// POST - Verify OTP - Get JWT
usersRoute.post("/verify-login", verifyLoginRules, checkValidation, async (req, res) => {
  try {
    const { email, otp } = req.body;
    const foundUser = await User.findOne({ email });
    
    if (!foundUser) {
      return res.status(404).json({
        success: false,
        error: `User with ${email} doesn't exist`,
      });
    }
    
    const savedOTP = await OTPModel.findOne({ 
      account: foundUser._id, 
      otp: otp.toString() 
    });
    
    if (!savedOTP) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid or expired OTP" 
      });
    }
    
    // Generate JWT token
    const token = encodeToken({ 
      _id: foundUser._id.toString(), 
      email: foundUser.email,
      role: foundUser.role 
    });
    
    // Delete used OTP
    await OTPModel.deleteOne({ _id: savedOTP._id });
    
    // Return user data and token
    res.json({
      success: true,
      data: {
        user: {
          id: foundUser._id,
          username: foundUser.username,
          email: foundUser.email,
          role: foundUser.role,
          joinDate: foundUser.joinDate
        },
        token: token
      }
    });
  } catch (error) {
    console.error("Verify login error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify OTP"
    });
  }
});

// POST - Resend OTP
usersRoute.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }

    const foundUser = await User.findOne({ email }); 
    if (!foundUser) {
      return res.status(404).json({
        success: false,
        error: `User with ${email} doesn't exist`,
      });
    }
    
    // Generate new OTP
    const otp = randomNumberOfNDigits(6);

    // Delete any existing OTP for this user
    await OTPModel.deleteOne({ account: foundUser._id });
    
    // Create new OTP
    await OTPModel.create({ 
      account: foundUser._id, 
      email: email,
      otp: otp.toString() 
    });
    
    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: "Failed to resend OTP email"
      });
    }
    
    res.json({ 
      success: true,
      message: "New OTP sent to your email", 
      email: email 
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resend OTP"
    });
  }
});

// GET - Get all users (admin only)
usersRoute.get("/users", authenticateToken, requireAdmin, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const UserModel = require("./users-model"); 
  const result = await UserModel.getAllUsers(parseInt(page), parseInt(limit));
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET - Get user by ID
usersRoute.get("/users/:id", authenticateToken, async (req, res) => {
  // Users can view their own profile or admin can view any
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }
  
  const UserModel = require("./users-model");
  const result = await UserModel.getUserById(req.params.id);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// PUT - Update user
usersRoute.put("/users/:id", updateUserRules, authenticateToken, async (req, res) => {
  // Users can update their own profile or admin can update any
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }
  
  const UserModel = require("./users-model");
  const result = await UserModel.updateUser(req.params.id, req.body);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// DELETE - Delete user (admin only)
usersRoute.delete("/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  const UserModel = require("./users-model");
  const result = await UserModel.deleteUser(req.params.id);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

// GET - Get current user profile
usersRoute.get("/profile", authenticateToken, async (req, res) => {
  const UserModel = require("./users-model");
  const result = await UserModel.getUserById(req.user._id);
  
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  
  res.json(result);
});

module.exports = { usersRoute };