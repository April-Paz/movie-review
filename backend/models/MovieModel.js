const Movie = require('./Movies');
const Review = require('./Review');

class MovieModel {
  // Get all movies from local database
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
      
      // Also delete associated reviews
      await Review.deleteMany({ movieId: id });
      
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

  // Update movie rating when review is added/updated
  async updateMovieRating(movieId) {
    try {
      const reviews = await Review.find({ movieId });
      
      if (reviews.length === 0) {
        await Movie.findByIdAndUpdate(movieId, {
          averageRating: 0,
          totalReviews: 0
        });
        return;
      }
      
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await Movie.findByIdAndUpdate(movieId, {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: reviews.length
      });
    } catch (error) {
      console.error('Error updating movie rating:', error);
    }
  }
}

module.exports = new MovieModel();