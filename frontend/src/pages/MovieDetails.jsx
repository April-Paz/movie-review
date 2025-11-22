import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Reviews from "../components/Reviews";
import ReviewForm from "../components/ReviewForm";

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshReviews, setRefreshReviews] = useState(0);

  useEffect(() => {
    async function fetchMovie() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3000/api/tmdb/movies/${id}`);
        if (!response.ok) throw new Error('Failed loading movie details');
        const result = await response.json();
        setMovie(result.data?.movie || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [id]);

  const handleReviewSubmitted = () => {
    setRefreshReviews((prev) => prev + 1);
  };

  const handleReviewDeleted = () => {
    setRefreshReviews((prev) => prev + 1);
  };

  if (loading) return <div>Loading movie details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!movie) return <div>Movie not found</div>;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        {movie.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            style={{
              width: "300px",
              borderRadius: "8px"
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <h1>{movie.title}</h1>
          {movie.tagline && (
            <p style={{ fontStyle: "italic", marginBottom: "15px" }}>"{movie.tagline}"</p>
          )}

          <div style={{ marginBottom: "10px" }}>
            <strong>Released:</strong> {movie.release_date || "Unknown"}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>Rating:</strong> ⭐ {movie.vote_average ? `${movie.vote_average}/10` : "No rating"}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} minutes` : "Unknown"}
          </div>

          {movie.genres && movie.genres.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <strong>Genres:</strong> {movie.genres.map((g) => g.name).join(", ")}
            </div>
          )}

          {movie.overview && (
            <div style={{ marginTop: "20px" }}>
              <strong>Overview:</strong>
              <p style={{ marginTop: "10px" }}>{movie.overview}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <ReviewForm
          movieId={id}
          movieTitle={movie.title}
          onReviewSubmitted={handleReviewSubmitted}
        />
      </div>

      <div style={{ marginBottom: "30px" }}>
        <Reviews
          key={refreshReviews}
          movieId={id}
          movieTitle={movie.title}
          onReviewDeleted={handleReviewDeleted}
        />
      </div>

      <div>
        <Link to="/movies" style={{ display: "inline-block", padding: "8px 16px", backgroundColor: "#6c757d", color: "white", textDecoration: "none", borderRadius: "4px" }}>
          Back to Movies
        </Link>
      </div>
    </div>
  );
};

export default MovieDetails;