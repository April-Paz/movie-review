// backend/modules/users/users-model.js
const User = require('../../shared/models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserModel {
  // Get all users (admin only)
  async getAllUsers(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await User.countDocuments();
      
      return {
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 500
      };
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const user = await User.findById(id).select('-password');
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          status: 404
        };
      }
      
      return {
        success: true,
        data: user
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 500
      };
    }
  }

  // Create new user (register)
  async createUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });
      
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email or username already exists',
          status: 400
        };
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return {
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            joinDate: user.joinDate
          },
          token
        },
        status: 201
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 400
      };
    }
  }

  // Login user
  async loginUser(email, password) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password',
          status: 401
        };
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid email or password',
          status: 401
        };
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return {
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            joinDate: user.joinDate
          },
          token
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 500
      };
    }
  }

  // Update user
  async updateUser(id, updateData) {
    try {
      // Don't allow password updates through this method
      if (updateData.password) {
        delete updateData.password;
      }
      
      const user = await User.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          status: 404
        };
      }
      
      return {
        success: true,
        data: user
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 400
      };
    }
  }

  // Delete user
  async deleteUser(id) {
    try {
      const user = await User.findByIdAndDelete(id);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          status: 404
        };
      }
      
      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 500
      };
    }
  }
}

module.exports = new UserModel();