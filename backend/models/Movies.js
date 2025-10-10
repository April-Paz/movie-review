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
  },
  // TMDB integration fields
  tmdbId: {
    type: Number,
    unique: true,
    sparse: true
  },
  tmdbData: {
    type: Object
  }
}, {
  timestamps: true
});

// Static method to find or create from TMDB data
movieSchema.statics.findOrCreateFromTMDB = async function(tmdbMovie) {
  let movie = await this.findOne({ tmdbId: tmdbMovie.id });
  
  if (!movie) {
    movie = new this({
      title: tmdbMovie.title,
      genre: tmdbMovie.genres ? tmdbMovie.genres.map(g => g.name) : [],
      director: tmdbMovie.director || '',
      cast: tmdbMovie.cast ? tmdbMovie.cast.slice(0, 5).map(p => p.name) : [],
      releaseYear: new Date(tmdbMovie.release_date).getFullYear(),
      description: tmdbMovie.overview,
      duration: tmdbMovie.runtime,
      poster: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : '',
      tmdbId: tmdbMovie.id,
      tmdbData: tmdbMovie
    });
    await movie.save();
  }
  
  return movie;
};

module.exports = mongoose.model('Movie', movieSchema);