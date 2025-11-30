const Review = require('../../shared/models/Review');

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
      
      // Calculate average rating
      const averageResult = await Review.aggregate([
        { $match: { movieId: parseInt(movieId) } },
        { $group: { _id: null, averageRating: { $avg: '$rating' } } }
      ]);
      
      const averageRating = averageResult.length > 0 ? averageResult[0].averageRating : 0;
      
      return {
        success: true,
        data: {
          reviews,
          averageRating: Math.round(averageRating * 10) / 10,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      console.error("Error in getReviewsByMovie:", error);
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
      console.error("Error in getReviewsByUser:", error);
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
      
      return {
        success: true,
        data: review,
        status: 201
      };
    } catch (error) {
      console.error("Error creating review:", error);
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
      
      await review.populate('userId', 'username avatar');
      
      return {
        success: true,
        data: review
      };
    } catch (error) {
      console.error("Error updating review:", error);
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
      
      await Review.findByIdAndDelete(id);
      
      return {
        success: true,
        message: 'Review deleted successfully'
      };
    } catch (error) {
      console.error("Error deleting review:", error);
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
        .populate('userId', 'username avatar');
      
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
      console.error("Error getting review by ID:", error);
      return {
        success: false,
        error: error.message,
        status: 500
      };
    }
  }
}

module.exports = new ReviewModel();