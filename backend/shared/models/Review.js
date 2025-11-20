// backend/shared/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  movieId: { 
    type: Number, 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  comment: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  likes: { 
    type: Number, 
    default: 0 
  },
  dislikes: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per user per movie
reviewSchema.index({ movieId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);