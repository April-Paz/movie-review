const mongoose = require('mongoose');
const { encodePassword } = require('../password-utils');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  avatar: {
    type: String,
    default: ''
  },
  joinDate: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.password = encodePassword(this.password);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);