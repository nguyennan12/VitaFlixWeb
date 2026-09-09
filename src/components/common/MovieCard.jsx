import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl, handleImageError } from '../../utils/image';
import { useFavorites } from '../../context/FavoritesContext';

export function MovieCard({ movie, showHeart = true }) {
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!movie) return null;

  const posterUrl = getImageUrl(movie.poster_url || movie.thumb_url);
  const favorited = isFavorite(movie.slug);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(movie);
  };

  return (
    <div className="movie-card">
      <Link to={`/movie/${movie.slug}`} className="movie-card-poster">
        <img
          src={posterUrl}
          alt={movie.name || 'Phim'}
          loading="lazy"
          onError={handleImageError}
        />
        
        {/* Badges */}
        <div className="movie-card-badges">
          {movie.quality && (
            <span className="movie-badge-quality">{movie.quality}</span>
          )}
          {movie.episode_current && (
            <span className="movie-badge-ep">{movie.episode_current}</span>
          )}
        </div>

        {/* Favorite Heart Button */}
        {showHeart && (
          <button
            className={`movie-fav-btn ${favorited ? 'active' : ''}`}
            onClick={handleHeartClick}
            title={favorited ? 'Bỏ thích' : 'Yêu thích'}
            aria-label="Yêu thích"
          >
            <i className={`fa-${favorited ? 'solid' : 'regular'} fa-heart`} />
          </button>
        )}
      </Link>

      <div className="movie-card-info">
        <Link to={`/movie/${movie.slug}`} title={movie.name}>
          <h3 className="movie-card-title">{movie.name}</h3>
        </Link>
        <p className="movie-card-origin">{movie.origin_name || 'Đang cập nhật'}</p>

        <div className="movie-card-footer">
          <span>{movie.year || '2024'}</span>
          <span style={{ color: 'var(--accent-gold)' }}>
            <i className="fa-solid fa-star me-1" />
            {movie.tmdb?.vote_average ? Number(movie.tmdb.vote_average).toFixed(1) : '8.5'}
          </span>
        </div>
      </div>
    </div>
  );
}
