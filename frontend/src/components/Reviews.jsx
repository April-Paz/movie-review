import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Reviews = (props) => {
  const { movieId, movieTitle, onReviewDeleted } = props;
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const auth = useAuth();
  const { user } = auth;

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/reviews/movie/${movieId}`);
        if (!response.ok) throw new Error('Failed loading reviews');
        const result = await response.json();
        setReviews(result.data?.reviews || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [movieId]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete review');

      setReviews(reviews.filter((review) => review._id !== reviewId));
      if (onReviewDeleted) {
        onReviewDeleted();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading reviews...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>User Reviews ({reviews.length})</h2>

      {reviews.length === 0 ? (
        <div>
          <p>No reviews yet. Be the first to review "{movieTitle}"!</p>
        </div>
      ) : (
        <div>
          {reviews.map((review) => (
            <div key={review._id} style={{border: "1px solid #ccc", padding: "15px", marginBottom: "15px"}}>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: "10px"}}>
                <div>
                  <div style={{fontWeight: "bold"}}>
                    {review.userId?.username || "Anonymous"}
                  </div>
                  <div style={{fontSize: "0.9em", color: "#666"}}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  {"⭐".repeat(review.rating)}
                  <span>({review.rating}/5)</span>
                </div>
              </div>
              <div style={{marginBottom: "10px"}}>{review.comment}</div>
              <div>
                {user && review.userId && user.id === review.userId._id && (
                  <button 
                    onClick={() => handleDeleteReview(review._id)}
                    style={{padding: "5px 10px"}}
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
};

export default Reviews;