import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Reviews({ movieId, movieTitle, onReviewDeleted }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const auth = useAuth();
  const { user } = auth;

  useEffect(() => {
    fetchReviews();
  }, [movieId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/reviews/movie/${movieId}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data.reviews || []);
      } else {
        setError(data.error || 'Failed to load reviews');
      }
    } catch {
      setError('Error loading reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove the review from the local state
        setReviews(reviews.filter(review => review._id !== reviewId));
        if (onReviewDeleted) {
          onReviewDeleted();
        }
      } else {
        setError(data.error || 'Failed to delete review');
      }
    } catch {
      setError('Error deleting review');
    }
  };

  if (loading) return <div className="loading">Loading reviews...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="reviews-section">
      <h2>User Reviews ({reviews.length})</h2>
      
      {reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review "{movieTitle}"!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <span className="reviewer-name">
                    {review.userId?.username || 'Anonymous'}
                  </span>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="review-rating">
                  {'⭐'.repeat(review.rating)}
                  <span className="rating-number">({review.rating}/5)</span>
                </div>
              </div>
              <div className="review-comment">
                {review.comment}
              </div>
              <div className="review-actions">            
                {/* Delete button - only show if user owns this review */}
                {user && review.userId && user.id === review.userId._id && (
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteReview(review._id)}
                    title="Delete this review"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reviews;