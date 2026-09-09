import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { MovieCard } from '../common/MovieCard';

export function MovieSlider({ title, viewMoreLink, movies = [] }) {
  const sliderRef = useRef(null);

  const handleScroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="mb-5">
      <div className="section-title-wrap">
        <h2 className="section-title">
          {title}
        </h2>
        {viewMoreLink && (
          <Link to={viewMoreLink} className="see-more-link">
            <span>Xem thêm</span>
            <i className="fa-solid fa-angle-right" />
          </Link>
        )}
      </div>

      <div className="movie-slider-wrap">
        {/* Left Arrow */}
        <button
          className="slider-arrow-btn prev d-none d-md-flex"
          onClick={() => handleScroll('left')}
          aria-label="Cuộn sang trái"
        >
          <i className="fa-solid fa-caret-left" />
        </button>

        {/* Slider Track */}
        <div className="movie-slider-track" ref={sliderRef}>
          {movies.map((movie) => (
            <MovieCard key={movie.slug || movie._id} movie={movie} />
          ))}
        </div>

        {/* Right Arrow */}
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
