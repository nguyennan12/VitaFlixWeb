import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl, handleImageError } from '../../utils/image';
import { useFavorites } from '../../context/FavoritesContext';

export function MovieCard({ movie, showHeart = true }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  if (!movie) return null;

  const posterUrl = getImageUrl(movie.poster_url || movie.thumb_url);
  const thumbUrl  = getImageUrl(movie.thumb_url  || movie.poster_url);
  const favorited = isFavorite(movie.slug);
  const imdb = movie.tmdb?.vote_average ? Number(movie.tmdb.vote_average).toFixed(1) : null;

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(movie);
  };

  return (
    <div
      className="movie-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Normal state ── */}
      <Link to={`/movie/${movie.slug}`} className="movie-card-poster">
        <img
          src={posterUrl}
          alt={movie.name || 'Phim'}
          loading="lazy"
          onError={handleImageError}
        />


      </Link>

      {/* Title & origin below poster */}
      <div className="movie-card-info">
        <Link to={`/movie/${movie.slug}`} title={movie.name}>
          <h3 className="movie-card-title">{movie.name}</h3>
        </Link>
        <p className="movie-card-origin">{movie.origin_name || ''}</p>
      </div>

      {/* ── Hover popup ── */}
      {hovered && (
        <div className="movie-card-popup">
          {/* Thumb banner */}
          <div className="mcp-thumb">
            <img
              src={thumbUrl}
              alt={movie.name}
              onError={handleImageError}
            />
          </div>

          {/* Info */}
          <div className="mcp-body">
            <h4 className="mcp-title">{movie.name}</h4>
            <p className="mcp-origin">{movie.origin_name || ''}</p>

            <div className="mcp-badges">
              {movie.quality && (
                <span className="mcp-badge">{movie.quality}</span>
              )}
              {movie.year && (
                <span className="mcp-badge">{movie.year}</span>
              )}
              {imdb && (
                <span className="mcp-badge mcp-badge-imdb">IMDb {imdb}</span>
              )}
            </div>

            {/* Actions */}
            <div className="mcp-actions">
              <button
                className="mcp-btn-play"
                onClick={() => navigate(`/watch/${movie.slug}`)}
              >
                <i className="fa-solid fa-play" /> Xem ngay
              </button>

              {showHeart && (
                <button
                  className={`mcp-btn-fav ${favorited ? 'active' : ''}`}
                  onClick={handleHeartClick}
                  title={favorited ? 'Bỏ thích' : 'Yêu thích'}
                >
                  <i className={`fa-${favorited ? 'solid' : 'regular'} fa-heart`} />
                </button>
              )}

              <Link to={`/movie/${movie.slug}`} className="mcp-btn-info">
                Thông tin phim <i className="fa-solid fa-angle-right" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
