import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Movies = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_URL}/api/tmdb/movies/popular?page=${currentPage}`
        );
        if (!response.ok) throw new Error('Failed loading movies');
        const result = await response.json();
        setMovies(result.data?.movies || []);
        setTotalPages(result.data?.totalPages || 1);
        setTotalMovies(result.data?.total_results || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  if (loading) return <div style={{padding: "40px", textAlign: "center"}}>Loading movies...</div>;
  if (error) return <div style={{padding: "40px", textAlign: "center"}}>Error: {error}</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px", color: "#FFD700" }}>Popular Movies</h1>
      
      <div style={{ 
        marginBottom: "20px", 
        padding: "10px", 
        background: "rgba(255, 215, 0, 0.1)", 
        borderRadius: "6px",
        border: "1px solid rgba(255, 215, 0, 0.3)"
      }}>
        <p style={{ margin: 0 }}>
          Showing page {currentPage} of {totalPages} • {totalMovies} total movies
        </p>
      </div>
      
      {movies.length === 0 ? (
        <p>No movies found</p>
      ) : (
        <>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
            gap: "20px", 
            marginBottom: "30px" 
          }}>
            {movies.map((movie) => (
              <div key={movie.id} style={{ 
                border: "1px solid rgba(255, 215, 0, 0.3)", 
                padding: "15px", 
                borderRadius: "8px",
                background: "rgba(0, 0, 0, 0.7)"
              }}>
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
                <h3 style={{ margin: "10px 0", fontSize: "1.1rem" }}>{movie.title}</h3>
                <p>⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "No rating"}</p>
                <p>
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : "Unknown"}
                </p>
                <Link 
                  to={`/movie/${movie.id}`} 
                  style={{ 
                    display: "inline-block", 
                    padding: "8px 16px", 
                    backgroundColor: "#FFD700", 
                    color: "#000000", 
                    textDecoration: "none", 
                    borderRadius: "4px",
                    fontWeight: "600",
                    border: "1px solid #FFD700",
                    marginTop: "10px"
                  }}
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              marginTop: "40px",
              padding: "20px"
            }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: "10px 20px",
                  backgroundColor: currentPage === 1 ? "#333" : "#FFD700",
                  color: currentPage === 1 ? "#666" : "#000",
                  border: "1px solid #FFD700",
                  borderRadius: "6px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  transition: "all 0.3s ease"
                }}
              >
                Previous
              </button>

              <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: currentPage === pageNum ? "#FFD700" : "transparent",
                        color: currentPage === pageNum ? "#000" : "#FFF",
                        border: `1px solid ${currentPage === pageNum ? "#FFD700" : "rgba(255, 215, 0, 0.5)"}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: currentPage === pageNum ? "bold" : "normal",
                        transition: "all 0.3s ease"
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: "10px 20px",
                  backgroundColor: currentPage === totalPages ? "#333" : "#FFD700",
                  color: currentPage === totalPages ? "#666" : "#000",
                  border: "1px solid #FFD700",
                  borderRadius: "6px",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  transition: "all 0.3s ease"
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Movies;