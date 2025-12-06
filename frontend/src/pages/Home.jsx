import { useState, useEffect } from "react";

const Home = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    async function fetchPopularMovies() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/tmdb/movies/popular`);
        if (!response.ok) throw new Error('Failed loading popular movies');
        const result = await response.json();
        setPopularMovies(result.data?.movies || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPopularMovies();
  }, [API_URL]);

  useEffect(() => {
    if (popularMovies.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % popularMovies.length);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [popularMovies.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % popularMovies.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + popularMovies.length) % popularMovies.length);
  };

  if (loading) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;
  if (error) return <div style={{padding: "40px", textAlign: "center"}}>Error: {error}</div>;

  return (
    <div style={{minHeight: "100vh", position: "relative"}}>
      {popularMovies.length > 0 && (
        <div style={{width: "100%", height: "100vh", position: "relative", overflow: "hidden"}}>
          <div style={{width: "100%", height: "100%", position: "relative"}}>
            {popularMovies.map((movie, index) => (
              <div
                key={movie.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  opacity: index === currentSlide ? 1 : 0,
                  transition: "opacity 1s ease-in-out"
                }}
              >
                {/* Movie info overlay */}
                <div style={{
                  position: "absolute",
                  bottom: "0",
                  left: "0",
                  right: "0",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                  padding: "40px",
                  color: "white"
                }}>
                  <h1 style={{fontSize: "3rem", marginBottom: "1rem"}}>{movie.title}</h1>
                  <p style={{fontSize: "1.2rem", marginBottom: "1rem", maxWidth: "600px"}}>
                    {movie.overview?.substring(0, 200)}...
                  </p>
                  <div style={{display: "flex", alignItems: "center", gap: "20px"}}>
                    <span style={{fontSize: "1.5rem"}}>⭐ {movie.vote_average?.toFixed(1)}/10</span>
                    <span>{movie.release_date?.substring(0, 4)}</span>
                    <a 
                      href={`/movie/${movie.id}`}
                      style={{
                        padding: "10px 20px",
                        background: "#FFD700",
                        color: "#000000",
                        textDecoration: "none",
                        borderRadius: "6px",
                        fontWeight: "600"
                      }}
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation buttons */}
            <button 
              onClick={prevSlide}
              style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                left: "20px",
                background: "rgba(255, 215, 0, 0.3)",
                border: "none",
                color: "white",
                fontSize: "2.5rem",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10
              }}
            >
              ‹
            </button>
            <button 
              onClick={nextSlide}
              style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                right: "20px",
                background: "rgba(255, 215, 0, 0.3)",
                border: "none",
                color: "white",
                fontSize: "2.5rem",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10
              }}
            >
              ›
            </button>

            {/* Slide indicators */}
            <div style={{
              position: "absolute",
              bottom: "120px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "8px",
              zIndex: 10
            }}>
              {popularMovies.slice(0, 10).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    border: "2px solid #FFD700",
                    background: index === currentSlide ? "#FFD700" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;