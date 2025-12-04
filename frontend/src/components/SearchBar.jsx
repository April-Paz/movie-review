import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/tmdb/movies/search?q=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) throw new Error('Search failed');
      const result = await response.json();
      
      setResults(result.data?.movies || []);
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

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies..."
          className="search-input"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="search-button"
        >
          {loading ? "..." : "Search"}
        </button>
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="clear-button"
          >
            ✕
          </button>
        )}
      </form>

      {showResults && results.length > 0 && (
        <div className="search-results">
          {results.slice(0, 8).map((movie) => (
            <div
              key={movie.id}
              onClick={() => handleMovieClick(movie.id)}
              className="result-item"
            >
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                  alt={movie.title}
                  className="result-poster"
                />
              )}
              <div className="result-info">
                <div className="result-title">{movie.title}</div>
                <div className="result-meta">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
                  {movie.vote_average && ` • ⭐${movie.vote_average.toFixed(1)}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && (
        <div className="search-results empty">
          No movies found for "{query}"
        </div>
      )}
    </div>
  );
};

export default SearchBar;