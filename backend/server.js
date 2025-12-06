// server.js - UPDATED FOR RENDER
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const { moviesRoute } = require("./modules/movies/movies-routes");
const { reviewsRoute } = require("./modules/reviews/reviews-routes");
const { usersRoute } = require("./modules/users/users-routes");
const { tmdbRoute } = require("./modules/tmdb/tmdb-routes");

const port = process.env.PORT || 3000;
const server = express();

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.DB_URL, { 
      dbName: "movie-review" 
    });
    console.log("Database Connected");
  } catch (error) {
    console.log("Database connection failed");
    console.log(error);
    process.exit(1); 
  }
}

// Initialize database connection
connectDB();

// CORS configuration for Render
server.use(cors({
  origin: [
    'http://localhost:5173',
    'https://movie-review-eight-iota.vercel.app', 
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Request logging middleware
server.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  if (req.method === 'POST' && req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Health check route
server.get("/health", (req, res) => {
  res.json({ 
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString() 
  });
});

// Debug email route
server.get("/api/debug-email", async (req, res) => {
  try {
    console.log("=== DEBUG EMAIL CONFIG ===");
    
    // Check environment variables
    const envVars = {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing",
      GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN ? "✅ Set" : "❌ Missing",
      GOOGLE_SENDER_EMAIL: process.env.GOOGLE_SENDER_EMAIL ? "✅ Set" : "❌ Missing",
    };
    
    console.log("Environment Variables:", envVars);
    
    res.json({
      success: true,
      envVars,
      message: "Check console for detailed email config"
    });
    
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add test send email route
server.get("/api/test-send-email", async (req, res) => {
  try {
    const sendEmail = require("./shared/email-utils");
    
    // Use the SENDER_EMAIL for testing
    const testEmail = process.env.GOOGLE_SENDER_EMAIL || "your-email@gmail.com";
    const testSubject = "Test from MovieReviews API";
    const testMessage = "Test email content - This is a test from MovieReviews API";
    
    console.log(`Testing email to: ${testEmail}`);
    
    const result = await sendEmail(testEmail, testSubject, testMessage);
    
    if (result) {
      res.json({
        success: true,
        message: "Test email sent successfully!",
        to: testEmail
      });
    } else {
      res.json({
        success: false,
        error: "Failed to send test email"
      });
    }
  } catch (error) {
    console.error("Test send error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug login route (bypasses email)
server.post("/api/debug-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Debug login for: ${email}`);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password required"
      });
    }
    
    const User = require("./shared/models/User");
    const OTPModel = require("./shared/models/OTP");
    const { matchPassword } = require("./shared/password-utils");
    const { randomNumberOfNDigits } = require("./shared/compute-utils");
    
    const foundUser = await User.findOne({ email });
    
    if (!foundUser) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    
    const passwordMatched = matchPassword(password, foundUser.password);
    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        error: "Invalid password"
      });
    }
    
    // Generate OTP
    const otp = randomNumberOfNDigits(6);
    
    // Delete any existing OTP
    await OTPModel.deleteOne({ account: foundUser._id });
    
    // Create new OTP
    await OTPModel.create({ 
      account: foundUser._id, 
      email: email,
      otp: otp.toString() 
    });
    
    // Return OTP directly for testing
    console.log(`Debug OTP for ${email}: ${otp}`);
    
    res.json({
      success: true,
      message: "OTP generated (email bypassed for testing)",
      data: {
        email: email,
        otp: otp,
        userId: foundUser._id,
        username: foundUser.username
      }
    });
    
  } catch (error) {
    console.error("Debug login error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API routes
server.use("/api", moviesRoute);
server.use("/api", reviewsRoute);
server.use("/api", usersRoute);
server.use("/api", tmdbRoute);

// Serve static files from frontend in production
if (process.env.NODE_ENV === 'production') {
  server.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  server.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Error handling middleware
server.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({ 
    success: false,
    error: "Internal server error!" 
  });
});

// 404 handler
server.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    error: `404! ${req.method} ${req.path} Not Found.` 
  });
});

// Start server
server.listen(port, '0.0.0.0', (error) => {
  if (error) {
    console.log(error.message);
    process.exit(1);
  } else {
    console.log(`Movie Review API Server running on port ${port}`);
    console.log(`Health check: /health`);
    console.log(`Debug email: /api/debug-email`);
    console.log(`Test email: /api/test-send-email`);
    console.log(`Debug login (bypass email): POST /api/debug-login`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`TMDB API: ${process.env.TMDB_API_KEY ? 'Configured' : 'Missing'}`);
    console.log(`Database: ${process.env.MONGODB_URI || process.env.DB_URL ? 'Configured' : 'Missing'}`);
  }
});