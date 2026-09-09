import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl, handleImageError } from '../../utils/image';
import { useFavorites } from '../../context/FavoritesContext';
import { stripHtml } from '../../utils/format';

export function HeroBanner({ movies = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const featuredList = movies.slice(0, 6);
  const activeMovie = featuredList[activeIndex] || featuredList[0];

  // Auto rotate banner every 8 seconds
  useEffect(() => {
    if (featuredList.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredList.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredList.length]);

  if (!activeMovie) {
    return (
      <div className="hero-banner" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="hero-banner-overlay" />
        <div className="text-center position-relative z-2">
          <h2 className="gradient-text">VitaFlix</h2>
          <p className="text-muted">Đang tải phim nổi bật...</p>
        </div>
      </div>
    );
  }

  const bgUrl = getImageUrl(activeMovie.thumb_url || activeMovie.poster_url);
  const favorited = isFavorite(activeMovie.slug);

  return (
    <div
      className="hero-banner"
      style={{
        backgroundImage: `url("${bgUrl}")`
      }}
    >
      <div className="hero-banner-overlay" />

      <div className="hero-content-wrap">
        {/* Left: Active Movie Details */}
        <div className="hero-text-box">
          <h2 className="hero-title">{activeMovie.name}</h2>
          <div className="hero-origin-title gradient-text">
            {activeMovie.origin_name || ''}
          </div>

          <div className="hero-badges">
            <span className="badge-item badge-imdb">IMDb 8.6</span>
            <span className="badge-item badge-quality">{activeMovie.quality || 'HD'}</span>
            <span className="badge-item badge-year">{activeMovie.year || '2024'}</span>
            <span className="badge-item badge-episode">{activeMovie.episode_current || 'Full'}</span>
          </div>

          {activeMovie.category && activeMovie.category.length > 0 && (
            <div className="hero-genres">
              {activeMovie.category.slice(0, 4).map((cat) => (
                <Link
                  key={cat.slug || cat.name}
                  to={`/category?type=genre&genre=${cat.slug}`}
                  className="genre-tag"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <p className="hero-description">
            {stripHtml(activeMovie.content) || 'Một tác phẩm điện ảnh xuất sắc với những tình tiết gay cấn, lôi cuốn và kỹ xảo đỉnh cao đáng xem nhất hiện nay.'}
          </p>

          <div className="hero-actions">
            <Link to={`/watch/${activeMovie.slug}`} className="btn-play-hero">
              <i className="fa-solid fa-play" /> Xem Ngay
            </Link>
            <Link to={`/movie/${activeMovie.slug}`} className="btn-info-hero" title="Chi tiết phim">
              <i className="fa-solid fa-circle-info" />
            </Link>
            <button
              className={`btn-like-hero ${favorited ? 'active' : ''}`}
              onClick={() => toggleFavorite(activeMovie)}
              title={favorited ? 'Bỏ thích' : 'Yêu thích'}
            >
              <i className={`fa-${favorited ? 'solid' : 'regular'} fa-heart`} />
            </button>
          </div>
        </div>

        {/* Right: 3D Cards Carousel */}
        <div className="hero-carousel-wrap d-none d-lg-flex">
          <div className="carousel-cards-container">
            {featuredList.map((movie, idx) => (
              <div
                key={movie.slug || idx}
                className={`carousel-card ${idx === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(idx)}
                title={movie.name}
              >
                <img
                  src={getImageUrl(movie.poster_url || movie.thumb_url)}
                  alt={movie.name}
                  onError={handleImageError}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
