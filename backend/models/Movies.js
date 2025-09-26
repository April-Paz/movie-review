const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  genre: [{ 
    type: String 
  }],
  director: { 
    type: String,
    trim: true
  },
  cast: [{ 
    type: String 
  }],
  releaseYear: { 
    type: Number, 
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 5
  },
  description: { 
    type: String,
    trim: true
  },
  duration: { 
    type: Number 
  },
  poster: { 
    type: String 
  },
  averageRating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);