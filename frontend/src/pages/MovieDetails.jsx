import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMovie() {
      try {
        const response = await fetch(`http://localhost:3000/api/tmdb/movies/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setMovie(data.movie);
        } else {
          setError(data.error || 'Movie not found');
        }
      } catch (error) {
        setError('Error fetching movie: ' + error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [id]);

  if (loading) return <div className="loading">Loading movie details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!movie) return <div className="error">Movie not found</div>;

  return (
    <div className="movie-detail">
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {movie.poster_path && (
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
            alt={movie.title}
            style={{
              width: '300px',
              borderRadius: '12px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h1>{movie.title}</h1>
          {movie.tagline && <p style={{ fontStyle: 'italic', color: '#e50914' }}>"{movie.tagline}"</p>}
          
          <p><strong>Released:</strong> {movie.release_date || 'Unknown'}</p>
          <p><strong>Rating:</strong> ⭐ {movie.vote_average ? `${movie.vote_average}/10 (${movie.vote_count} votes)` : 'No ratings yet'}</p>
          <p><strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} minutes` : 'Unknown'}</p>
          
          {movie.genres && movie.genres.length > 0 && (
            <p><strong>Genres:</strong> {movie.genres.map(g => g.name).join(', ')}</p>
          )}
          
          {movie.overview && (
            <div style={{ marginTop: '1.5rem' }}>
              <strong>Overview:</strong>
              <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>{movie.overview}</p>
            </div>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <Link to="/movies" className="btn secondary">← Back to Movies</Link>
      </div>
    </div>
  );
}

export default MovieDetail;