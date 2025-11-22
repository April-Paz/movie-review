import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ReviewForm = (props) => {
  const { movieId, movieTitle, onReviewSubmitted } = props;
  
  const [formData, setFormData] = useState({
    rating: "5",
    comment: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const auth = useAuth();
  const { isAuthenticated } = auth;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError("Please log in to submit a review");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          movieId: parseInt(movieId),
          rating: parseInt(formData.rating),
          comment: formData.comment
        })
      });

      if (!response.ok) throw new Error('Failed to submit review');

      setFormData({ rating: "5", comment: "" });
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div>
        <p>Please log in to write a review for "{movieTitle}"</p>
      </div>
    );
  }

  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <h3>Write a Review for "{movieTitle}"</h3>
      
      {error && <div>Error: {error}</div>}

      <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column"}}>
        
        <div>Rating</div>
        <div style={{marginBottom: "15px"}}>
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star} style={{marginRight: "10px"}}>
              <input
                type="radio"
                name="rating"
                value={star}
                checked={formData.rating === star.toString()}
                onChange={handleChange}
                disabled={loading}
                style={{marginRight: "5px"}}
              />
              {star}
            </label>
          ))}
        </div>

        <div>Your Review</div>
        <textarea
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          placeholder="Share your thoughts about this movie..."
          disabled={loading}
          required
          rows="4"
          style={{marginBottom: "15px"}}
        />

        <button type="submit" disabled={loading || formData.comment.length < 10}>
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;