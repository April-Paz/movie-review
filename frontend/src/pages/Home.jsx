function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Welcome to MovieReviews</h1>
        <p>Discover and review your favorite movies</p>
        <div className="hero-buttons">
          <a href="/movies" className="btn primary">Browse Movies</a>
          <a href="/register" className="btn secondary">Get Started</a>
        </div>
      </section>
    </div>
  );
}

export default Home;