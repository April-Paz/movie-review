import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleSearch = async (e, page = 1) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/tmdb/movies/search?q=${encodeURIComponent(query)}&page=${page}`
      );
      
      if (!response.ok) throw new Error('Search failed');
      const result = await response.json();
      
      setResults(result.data?.movies || []);
      setTotalPages(result.data?.totalPages || 1);
      setCurrentPage(result.data?.page || 1);
      setShowResults(true);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
    setShowResults(false);
    setQuery("");
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const handlePageChange = (newPage) => {
    handleSearch(null, newPage);
  };

  return (
    <div className="search-container" style={{ position: "relative" }}>
      <form onSubmit={handleSearch} className="search-form" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies..."
          style={{
            padding: "10px 15px",
            borderRadius: "6px",
            border: "1px solid #FFD700",
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            flex: 1,
            minWidth: "200px"
          }}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{
            padding: "10px 20px",
            background: "#FFD700",
            color: "#000000",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          {loading ? "..." : "Search"}
        </button>
        {query && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: "10px",
              background: "transparent",
              color: "#FFD700",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem"
            }}
          >
            ✕
          </button>
        )}
      </form>

      {showResults && results.length > 0 && (
        <div className="search-results" style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "rgba(0, 0, 0, 0.95)",
          border: "1px solid #FFD700",
          borderRadius: "6px",
          zIndex: 1000,
          maxHeight: "500px",
          overflowY: "auto",
          marginTop: "10px"
        }}>
          {results.slice(0, 8).map((movie) => (
            <div
              key={movie.id}
              onClick={() => handleMovieClick(movie.id)}
              className="result-item"
              style={{
                display: "flex",
                padding: "10px 15px",
                cursor: "pointer",
                borderBottom: "1px solid rgba(255, 215, 0, 0.2)",
                alignItems: "center",
                transition: "background 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 215, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                  alt={movie.title}
                  style={{
                    width: "50px",
                    height: "75px",
                    objectFit: "cover",
                    marginRight: "15px",
                    borderRadius: "4px"
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", color: "#FFD700", fontSize: "1rem" }}>{movie.title}</div>
                <div style={{ color: "#cccccc", fontSize: "0.9em" }}>
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
                  {movie.vote_average && ` • ⭐${movie.vote_average.toFixed(1)}`}
                </div>
              </div>
            </div>
          ))}

          {/* Search Pagination */}
          {totalPages > 1 && (
            <div style={{
              padding: "15px",
              borderTop: "1px solid rgba(255, 215, 0, 0.3)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "15px",
              background: "rgba(0, 0, 0, 0.9)"
            }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 15px",
                  backgroundColor: currentPage === 1 ? "#333" : "#FFD700",
                  color: currentPage === 1 ? "#666" : "#000",
                  border: "1px solid #FFD700",
                  borderRadius: "6px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  minWidth: "100px"
                }}
              >
                ← Previous
              </button>
              <span style={{ color: "#FFD700", fontWeight: "600", fontSize: "0.9rem" }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 15px",
                  backgroundColor: currentPage === totalPages ? "#333" : "#FFD700",
                  color: currentPage === totalPages ? "#666" : "#000",
                  border: "1px solid #FFD700",
                  borderRadius: "6px",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  minWidth: "100px"
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {showResults && results.length === 0 && (
        <div className="search-results empty" style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "rgba(0, 0, 0, 0.95)",
          border: "1px solid #FFD700",
          borderRadius: "6px",
          padding: "20px",
          color: "#FFD700",
          textAlign: "center",
          zIndex: 1000,
          marginTop: "10px"
        }}>
          No movies found for "{query}"
        </div>
      )}
    </div>
  );
};

export default SearchBar;