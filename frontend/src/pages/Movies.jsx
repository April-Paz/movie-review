import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:3000/api/tmdb/movies/popular");
        if (!response.ok) throw new Error('Failed loading movies');
        const result = await response.json();
        setMovies(result.data?.movies || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  if (loading) return <div>Loading movies...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Popular Movies</h1>
      
      {movies.length === 0 ? (
        <p>No movies found</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
          {movies.map((movie) => (
            <div key={movie.id} style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    marginBottom: "10px"
                  }}
                />
              )}
              <h3 style={{ margin: "10px 0" }}>{movie.title}</h3>
              <p>⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "No rating"}</p>
              <p>
                {movie.release_date ? new Date(movie.release_date).getFullYear() : "Unknown"}
              </p>
              <Link to={`/movie/${movie.id}`} style={{ display: "inline-block", padding: "8px 16px", backgroundColor: "#007bff", color: "white", textDecoration: "none", borderRadius: "4px" }}>
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Movies;