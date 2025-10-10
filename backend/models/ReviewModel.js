const Review = require('./Review');
const MovieModel = require('./MovieModel');

class ReviewModel {
  // Get all reviews for a movie
  async getReviewsByMovie(movieId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const reviews = await Review.find({ movieId })
        .populate('userId', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Review.countDocuments({ movieId });
      
      return {
        success: true,
        data: {
          reviews,
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

  // Get reviews by user
  async getReviewsByUser(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const reviews = await Review.find({ userId })
        .populate('movieId', 'title poster releaseYear')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Review.countDocuments({ userId });
      
      return {
        success: true,
        data: {
          reviews,
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

  // Create new review
  async createReview(reviewData) {
    try {
      // Check if user already reviewed this movie
      const existingReview = await Review.findOne({
        movieId: reviewData.movieId,
        userId: reviewData.userId
      });
      
      if (existingReview) {
        return {
          success: false,
          error: 'You have already reviewed this movie',
          status: 400
        };
      }
      
      const review = new Review(reviewData);
      await review.save();
      
      // Populate user data for response
      await review.populate('userId', 'username avatar');
      
      // Update movie rating
      await MovieModel.updateMovieRating(reviewData.movieId);
      
      return {
        success: true,
        data: review,
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

  // Update review
  async updateReview(id, userId, updateData) {
    try {
      const review = await Review.findOne({ _id: id, userId });
      
      if (!review) {
        return {
          success: false,
          error: 'Review not found or you are not authorized to update it',
          status: 404
        };
      }
      
      Object.assign(review, updateData);
      await review.save();
      
      // Update movie rating
      await MovieModel.updateMovieRating(review.movieId);
      
      await review.populate('userId', 'username avatar');
      
      return {
        success: true,
        data: review
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 400
      };
    }
  }

  // Delete review
  async deleteReview(id, userId) {
    try {
      const review = await Review.findOne({ _id: id, userId });
      
      if (!review) {
        return {
          success: false,
          error: 'Review not found or you are not authorized to delete it',
          status: 404
        };
      }
      
      const movieId = review.movieId;
      await Review.findByIdAndDelete(id);
      
      // Update movie rating
      await MovieModel.updateMovieRating(movieId);
      
      return {
        success: true,
        message: 'Review deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 500
      };
    }
  }

  // Get review by ID
  async getReviewById(id) {
    try {
      const review = await Review.findById(id)
        .populate('userId', 'username avatar')
        .populate('movieId', 'title poster releaseYear');
      
      if (!review) {
        return {
          success: false,
          error: 'Review not found',
          status: 404
        };
      }
      
      return {
        success: true,
        data: review
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

module.exports = new ReviewModel();