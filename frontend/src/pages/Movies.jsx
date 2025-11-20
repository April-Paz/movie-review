// frontend/src/pages/Movies.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch("http://localhost:3000/api/tmdb/movies/popular");

        if (!response.ok) {
          throw new Error("Failed to fetch movies from TMDB");
        }

        const data = await response.json();

        if (data.success) {
          setMovies(data.data.movies || []);
        } else {
          setError(data.error || "Failed to load movies");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  if (loading) return <div className="loading">Loading movies from TMDB...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="movies" style={{ padding: "2rem" }}>
      <h1>Current Popular Movies</h1>
      <div className="movies-grid">
        {movies.length === 0 ? (
          <p>No movies found. Check your TMDB API connection.</p>
        ) : (
          movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "1rem"
                  }}
                />
              )}
              <h3>{movie.title}</h3>
              <p>⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "No ratings yet"}</p>
              <p>
                Year:{" "}
                {movie.release_date ? new Date(movie.release_date).getFullYear() : "Unknown"}
              </p>
              {movie.overview && (
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#aaa",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}
                >
                  {movie.overview}
                </p>
              )}
              <Link to={`/movie/${movie.id}`} className="btn primary">
                View Details
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Movies;