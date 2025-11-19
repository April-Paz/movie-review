import { useState, useEffect } from 'react';

function Home() {
  const [popularMovies, setPopularMovies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Fetch popular movies for the slideshow
    async function fetchPopularMovies() {
      try {
        const response = await fetch('http://localhost:3000/api/tmdb/movies/popular');
        const data = await response.json();
        
        if (data.success) {
          // Take only the top 5 movies
          setPopularMovies(data.movies.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching popular movies:', error);
      }
    }

    fetchPopularMovies();
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (popularMovies.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % popularMovies.length);
      }, 4000); // Change slide every 4 seconds

      return () => clearInterval(interval);
    }
  }, [popularMovies.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % popularMovies.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + popularMovies.length) % popularMovies.length);
  };

  return (
    <div className="home">
      {/* Banner Slideshow */}
      {popularMovies.length > 0 && (
        <div className="banner-slideshow">
          <div className="banner-container">
            {popularMovies.map((movie, index) => (
              <div
                key={movie.id}
                className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
                style={{
                  backgroundImage: `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`
                }}
              />
            ))}
            
            {/* Navigation arrows */}
            <button className="banner-nav prev" onClick={prevSlide}>
              ‹
            </button>
            <button className="banner-nav next" onClick={nextSlide}>
              ›
            </button>
            
            {/* Slide indicators */}
            <div className="banner-indicators">
              {popularMovies.map((_, index) => (
                <button
                  key={index}
                  className={`banner-indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Welcome to MovieReviews</h1>
            <p>Everyone's Guide to the Movies</p>
            <div className="hero-buttons">
              <a href="/movies" className="btn primary">Browse Movies</a>
              <a href="/register" className="btn secondary">Get Started</a>
            </div>
          </div>
          {/* <div className="hero-icon">
            🎬
          </div> */}
        </div>
      </section>
    </div>
  );
}

export default Home;