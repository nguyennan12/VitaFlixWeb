import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { MovieCard } from '../common/MovieCard';

export function MovieSlider({ title, viewMoreLink, movies = [], splitLayout = false }) {
  const sliderRef = useRef(null);

  const handleScroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -700 : 700;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  /* ── SPLIT LAYOUT (title left + 2 rows right) ── */
  if (splitLayout) {
    const mid = Math.ceil(movies.length / 2);
    const row1 = movies.slice(0, mid);
    const row2 = movies.slice(mid);

    return (
      <section className="split-section mb-5">
        {/* Left: Title */}
        <div className="split-section-left">
          <h2 className="split-section-title">{title}</h2>
          {viewMoreLink && (
            <Link to={viewMoreLink} className="see-more-link">
              <span>Xem thêm</span>
              <i className="fa-solid fa-angle-right" />
            </Link>
          )}
        </div>

        {/* Right: 2 rows */}
        <div className="split-section-right">
          <div className="movie-slider-wrap">
            <button
              className="slider-arrow-btn prev d-none d-md-flex"
              onClick={() => handleScroll('left')}
              aria-label="Cuộn sang trái"
            >
              <i className="fa-solid fa-caret-left" />
            </button>

            <div className="split-slider-track" ref={sliderRef}>
              <div className="split-slider-row">
                {row1.map((movie) => (
                  <MovieCard key={`r1-${movie.slug || movie._id}`} movie={movie} />
                ))}
              </div>
              {row2.length > 0 && (
                <div className="split-slider-row">
                  {row2.map((movie) => (
                    <MovieCard key={`r2-${movie.slug || movie._id}`} movie={movie} />
                  ))}
                </div>
              )}
            </div>

            <button
              className="slider-arrow-btn next d-none d-md-flex"
              onClick={() => handleScroll('right')}
              aria-label="Cuộn sang phải"
            >
              <i className="fa-solid fa-caret-right" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ── NORMAL LAYOUT (title top + 1 row) ── */
  return (
    <section className="mb-5">
      <div className="section-title-wrap">
        <h2 className="section-title">{title}</h2>
        {viewMoreLink && (
          <Link to={viewMoreLink} className="see-more-link">
            <span>Xem thêm</span>
            <i className="fa-solid fa-angle-right" />
          </Link>
        )}
      </div>

      <div className="movie-slider-wrap">
        <button
          className="slider-arrow-btn prev d-none d-md-flex"
          onClick={() => handleScroll('left')}
          aria-label="Cuộn sang trái"
        >
          <i className="fa-solid fa-caret-left" />
        </button>

        <div className="movie-slider-track" ref={sliderRef}>
          {movies.map((movie) => (
            <MovieCard key={movie.slug || movie._id} movie={movie} />
          ))}
        </div>

        <button
          className="slider-arrow-btn next d-none d-md-flex"
          onClick={() => handleScroll('right')}
          aria-label="Cuộn sang phải"
        >
          <i className="fa-solid fa-caret-right" />
        </button>
      </div>
    </section>
  );
}
