import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { getImageUrl, handleImageError } from '../utils/image';
import { stripHtml } from '../utils/format';
import { useFavorites } from '../context/FavoritesContext';
import { LoadingSpinner } from '../components/common/Loading';
import { ErrorState } from '../components/common/ErrorState';
import { CommentSection } from '../components/comments/CommentSection';
import { MovieCard } from '../components/common/MovieCard';

export function MovieDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getMovieDetail(slug)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.movie) {
          setData(res);
          // Set page title
          document.title = `${res.movie.name} — VitaFlix`;

          // Fetch recommendations (by country or genre)
          const countrySlug = res.movie.country?.[0]?.slug || 'han-quoc';
          api.getMoviesByCountry(countrySlug, 1, 8).then((recRes) => {
            if (isMounted) {
              const filtered = (recRes.items || []).filter((m) => m.slug !== slug);
              setRecommendations(filtered.slice(0, 6));
            }
          });
        } else {
          setData(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('[MovieDetailPage] error:', err);
        if (isMounted) {
          setData(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return <LoadingSpinner text="Đang tải thông tin phim..." />;
  }

  if (!data || !data.movie) {
    return (
      <ErrorState
        title="Không tìm thấy phim"
        message="Phim bạn yêu cầu không tồn tại hoặc đã bị gỡ bỏ."
        onRetry={() => navigate('/')}
      />
    );
  }

  const movie = data.movie;
  const episodes = data.episodes?.[0]?.server_data || [];
  const favorited = isFavorite(movie.slug);
  const thumbUrl = getImageUrl(movie.thumb_url || movie.poster_url);
  const posterUrl = getImageUrl(movie.poster_url || movie.thumb_url);

  return (
    <div>
      {/* Backdrop Header */}
      <div
        style={{
          position: 'relative',
          height: '55vh',
          minHeight: '380px',
          backgroundImage: `url("${thumbUrl}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(23, 25, 29, 0.4) 0%, rgba(23, 25, 29, 0.98) 100%)'
          }}
        />
      </div>

      {/* Main Details Card */}
      <div className="container-fluid px-lg-5 px-3" style={{ maxWidth: '1600px', margin: '-160px auto 0 auto', position: 'relative', zIndex: 10 }}>
        <div className="row g-4">
          {/* Left: Poster & Action Buttons */}
          <div className="col-lg-4 col-xl-3 text-center text-lg-start">
            <div
              style={{
                width: '100%',
                maxWidth: '280px',
                aspectRatio: '2/3',
                margin: '0 auto',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                border: '2px solid var(--border-card)'
              }}
            >
              <img
                src={posterUrl}
                alt={movie.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={handleImageError}
              />
            </div>

            {/* Actions */}
            <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
              <Link
                to={`/watch/${movie.slug}`}
                className="btn-play-hero"
                style={{ padding: '10px 24px', fontSize: '15px' }}
              >
                <i className="fa-solid fa-play" /> Xem Phim
              </Link>
              <button
                className={`btn-like-hero ${favorited ? 'active' : ''}`}
                onClick={() => toggleFavorite(movie)}
                title={favorited ? 'Bỏ thích' : 'Thêm vào yêu thích'}
              >
                <i className={`fa-${favorited ? 'solid' : 'regular'} fa-heart`} />
              </button>
            </div>
          </div>

          {/* Right: Metadata Info */}
          <div className="col-lg-8 col-xl-9">
            <h1 style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-white)', marginBottom: '6px' }}>
              {movie.name}
            </h1>
            <div className="gradient-text fs-5 mb-3">
              {movie.origin_name} ({movie.year || '2024'})
            </div>

            {/* Badges */}
            <div className="hero-badges mb-3">
              <span className="badge-item badge-imdb">
                <i className="fa-solid fa-star me-1 text-warning" />
                {movie.tmdb?.vote_average ? Number(movie.tmdb.vote_average).toFixed(1) : '8.6'} IMDb
              </span>
              <span className="badge-item badge-quality">{movie.quality || 'HD'}</span>
              <span className="badge-item badge-year">{movie.time || 'Đang cập nhật'}</span>
              <span className="badge-item badge-episode">{movie.episode_current || 'Full'}</span>
            </div>

            {/* Genres */}
            <div className="hero-genres mb-4">
              {movie.category?.map((c) => (
                <Link
                  key={c.slug}
                  to={`/category?type=genre&genre=${c.slug}`}
                  className="genre-tag"
                >
                  {c.name}
                </Link>
              ))}
            </div>

            {/* Director & Cast */}
            <div
              style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '24px'
              }}
            >
              <div className="row g-3">
                <div className="col-md-6">
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Đạo diễn:</div>
                  <div style={{ color: 'var(--text-white)', fontWeight: '500' }}>
                    {movie.director?.join(', ') || 'Đang cập nhật'}
                  </div>
                </div>
                <div className="col-md-6">
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Quốc gia:</div>
                  <div style={{ color: 'var(--text-white)', fontWeight: '500' }}>
                    {movie.country?.map(c => c.name).join(', ') || 'Đang cập nhật'}
                  </div>
                </div>
                <div className="col-12">
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Diễn viên:</div>
                  <div style={{ color: 'var(--text-white)', fontWeight: '500' }}>
                    {movie.actor?.join(', ') || 'Đang cập nhật'}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Synopsis */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--text-white)', marginBottom: '10px' }}>Nội dung phim</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '15px' }}>
                {stripHtml(movie.content) || 'Đang cập nhật nội dung chi tiết cho bộ phim này.'}
              </p>
            </div>

            {/* Episode List Quick View */}
            {episodes.length > 0 && (
              <div style={{ marginBottom: '36px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-white)', marginBottom: '14px' }}>
                  <i className="fa-solid fa-list-ol text-cyan me-2" />
                  Danh Sách Tập ({episodes.length} tập)
                </h3>
                <div className="episodes-grid" style={{ maxHeight: '200px' }}>
                  {episodes.map((ep, idx) => (
                    <Link
                      key={ep.slug || idx}
                      to={`/watch/${movie.slug}?ep=${idx}`}
                      className="episode-btn text-decoration-none"
                    >
                      {ep.name || `Tập ${idx + 1}`}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Movies Row */}
        {recommendations.length > 0 && (
          <section className="my-5">
            <div className="section-title-wrap">
              <h2 className="section-title">
                <i className="fa-solid fa-thumbs-up text-cyan me-2" />
                Bạn Có Thể Thích
              </h2>
            </div>
            <div className="movie-grid">
              {recommendations.map((rec) => (
                <MovieCard key={rec.slug} movie={rec} />
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <CommentSection movieSlug={movie.slug} />
      </div>
    </div>
  );
}
