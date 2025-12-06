const { Router } = require("express");

const createUserRules = require("./middlewares/create-user-rules");
const updateUserRules = require("./middlewares/update-user-rules");
const loginRules = require("./middlewares/login-rules");
const verifyLoginRules = require("./middlewares/verify-login-rules");
const checkValidation = require("../../shared/middlewares/check-validation");

const User = require("../../shared/models/User"); 
const OTPModel = require("../../shared/models/OTP");
const { matchPassword } = require("../../shared/password-utils");
const { encodeToken } = require("../../shared/jwt-utils");
const { sendEmail } = require("../../shared/email-utils"); // CHANGED: destructured import
const { randomNumberOfNDigits } = require("../../shared/compute-utils");
const { authenticateToken, requireAdmin } = require("../../shared/middlewares/auth");

const usersRoute = Router();

// POST - Register new user
usersRoute.post("/register", createUserRules, checkValidation, async (req, res) => {
  try {
    const newUser = req.body;
    
    // Check if user already exists (both email AND username)
    const existingUser = await User.findOne({
      $or: [
        { email: newUser.email },
        { username: newUser.username }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: `User with email ${newUser.email} or username ${newUser.username} already exists`,
      });
    }
    
    const addedUser = await User.create(newUser);
    if (!addedUser) {
      return res.status(500).json({
        success: false,
        error: "Oops! User couldn't be added!",
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
    
    res.status(201).json({
      success: true,
      data: user,
      message: "User registered successfully"
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
    
    // Send OTP email using Gmail API
    const emailSent = await sendEmail(
      email, 
      "Your Login OTP - MovieReviews", `Your one-time password is: <strong>${otp}</strong><br>It expires in 5 minutes.`
    );
      
    if (!emailSent) {
      console.error("Failed to send OTP email to:", email);
      return res.status(500).json({
        success: false,
        error: "Failed to send OTP email. Please try again."
      });
    }
    
    res.json({ 
      success: true,
      message: "OTP sent to your email", 
      data: {
        email: email,
        userId: foundUser._id
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process login request"
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
    
    // Check OTP expiration (5 minutes)
    const now = new Date();
    const otpCreatedAt = new Date(savedOTP.createdAt);
    const minutesDiff = (now - otpCreatedAt) / (1000 * 60);
    
    if (minutesDiff > 5) {
      await OTPModel.deleteOne({ _id: savedOTP._id });
      return res.status(401).json({ 
        success: false,
        error: "OTP has expired. Please request a new one." 
      });
    }
    
    // Generate JWT token
    const token = encodeToken({ 
      _id: foundUser._id.toString(), 
      email: foundUser.email,
      username: foundUser.username,
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
          avatar: foundUser.avatar,
          joinDate: foundUser.joinDate
        },
        token: token
      },
      message: "Login successful"
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
    
    // Send OTP email using Gmail API
    const emailSent = await sendEmail(
      email, 
        "Your New Login OTP - MovieReviews", 
        `Your new one-time password is: <strong>${otp}</strong><br>It expires in 5 minutes.`
    );
    
    if (!emailSent) {
      console.error("Failed to resend OTP email to:", email);
      return res.status(500).json({
        success: false,
        error: "Failed to send new OTP. Please try again."
      });
    }
    
    res.json({ 
      success: true,
      message: "New OTP sent to your email", 
      data: {
        email: email
      }
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
  
  try {
    const skip = (page - 1) * limit;
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    
    const total = await User.countDocuments();
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users"
    });
  }
});

// GET - Get user by ID
usersRoute.get("/users/:id", authenticateToken, async (req, res) => {
  // Users view their own profile or they're admin
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }
  
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user"
    });
  }
});

// PUT - Update user
usersRoute.put("/users/:id", updateUserRules, authenticateToken, async (req, res) => {
  // Check authorization
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }
  
  // Prevent password updates through this route
  if (req.body.password) {
    delete req.body.password;
  }
  
  // Prevent role escalation for non-admins
  if (req.user.role !== 'admin' && req.body.role) {
    delete req.body.role;
  }
  
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true,
        runValidators: true 
      }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully"
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user"
    });
  }
});

// DELETE - Delete user (admin only)
usersRoute.delete("/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }
    
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Also delete associated OTPs
    await OTPModel.deleteMany({ account: req.params.id });
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete user"
    });
  }
});

// GET - Get current user profile
usersRoute.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile"
    });
  }
});

// GET - Check if user exists (for registration validation)
usersRoute.get("/check-user", async (req, res) => {
  try {
    const { email, username } = req.query;
    
    if (!email && !username) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email or username to check'
      });
    }
    
    const query = {};
    if (email) query.email = email;
    if (username) query.username = username;
    
    const existingUser = await User.findOne(query);
    
    res.json({
      success: true,
      data: {
        exists: !!existingUser,
        user: existingUser ? {
          email: existingUser.email,
          username: existingUser.username
        } : null
      }
    });
  } catch (error) {
    console.error("Check user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check user"
    });
  }
});

module.exports = { usersRoute };