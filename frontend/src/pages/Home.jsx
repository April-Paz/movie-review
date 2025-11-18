function Home() {
  return (
    <div className="home">
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
          <div className="hero-icon">
            🎬
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;