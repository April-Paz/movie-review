const Movie = require('../../shared/models/Movie');

class MovieModel {
  // Get all movies from local database - (I don;t know if I'm going to use this)
  async getAllMovies(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const movies = await Movie.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Movie.countDocuments();
      
      return {
        success: true,
        data: {
          movies,
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

  // Get movie by ID
  async getMovieById(id) {
    try {
      const movie = await Movie.findById(id);
      if (!movie) {
        return {
          success: false,
          error: 'Movie not found',
          status: 404
        };
      }
      
      return {
        success: true,
        data: movie
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 500
      };
    }
  }

  // Create new movie
  async createMovie(movieData) {
    try {
      const movie = new Movie(movieData);
      await movie.save();
      
      return {
        success: true,
        data: movie,
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

  // Update movie
  async updateMovie(id, updateData) {
    try {
      const movie = await Movie.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );
      
      if (!movie) {
        return {
          success: false,
          error: 'Movie not found',
          status: 404
        };
      }
      
      return {
        success: true,
        data: movie
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 400
      };
    }
  }

  // Delete movie
  async deleteMovie(id) {
    try {
      const movie = await Movie.findByIdAndDelete(id);
      
      if (!movie) {
        return {
          success: false,
          error: 'Movie not found',
          status: 404
        };
      }
      
      return {
        success: true,
        message: 'Movie deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 500
      };
    }
  }

  // Search movies locally
  async searchMovies(query, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const movies = await Movie.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { director: { $regex: query, $options: 'i' } },
          { genre: { $in: [new RegExp(query, 'i')] } }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
      const total = await Movie.countDocuments({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { director: { $regex: query, $options: 'i' } },
          { genre: { $in: [new RegExp(query, 'i')] } }
        ]
      });
      
      return {
        success: true,
        data: {
          movies,
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

  // Sync with TMDB
  async syncWithTMDB(tmdbId) {
    try {
      const TMDbModel = require('../tmdb/tmdb-model');
      const tmdbResult = await TMDbModel.getMovieDetails(tmdbId);
      
      if (!tmdbResult.success) {
        return tmdbResult;
      }

      const movie = await Movie.findOrCreateFromTMDB(tmdbResult.data.movie);
      
      return {
        success: true,
        data: movie
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 500
      };
    }
  }

  // Get or create movie from TMDB ID
  async getOrCreateMovieByTMDBId(tmdbId) {
    try {
      let movie = await Movie.findOne({ tmdbId });
      
      if (!movie) {
        return await this.syncWithTMDB(tmdbId);
      }
      
      return {
        success: true,
        data: movie
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

module.exports = new MovieModel();