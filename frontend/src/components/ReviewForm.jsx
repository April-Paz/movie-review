import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function ReviewForm({ movieId, movieTitle, onReviewSubmitted }) {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const auth = useAuth();
  
  const { isAuthenticated } = auth;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in to submit a review');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movieId: parseInt(movieId),
          rating: parseInt(formData.rating),
          comment: formData.comment
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setFormData({ rating: 5, comment: '' });
        setError('');
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch {
      setError('Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="review-form">
        <div className="login-prompt">
          <p>Please <a href="/login">log in</a> to write a review for "{movieTitle}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-form">
      <h3>Write a Review</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Your Rating:</label>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(star => (
              <label key={star} className="star-label">
                <input
                  type="radio"
                  name="rating"
                  value={star}
                  checked={formData.rating === star}
                  onChange={handleChange}
                />
                <span className="star">⭐</span>
              </label>
            ))}
          </div>
          <span className="rating-text">({formData.rating}/5)</span>
        </div>

        <div className="form-group">
          <label>Your Review:</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder={`Share your thoughts about "${movieTitle}"...`}
            required
            minLength="10"
            maxLength="1000"
            rows="4"
          />
          <div className="char-count">
            {formData.comment.length}/1000 characters
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading || formData.comment.length < 10}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

export default ReviewForm;