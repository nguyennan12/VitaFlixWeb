import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { getImageUrl, handleImageError } from '../utils/image';
import { VideoPlayer } from '../components/watch/VideoPlayer';
import { EpisodeList } from '../components/watch/EpisodeList';
import { CommentSection } from '../components/comments/CommentSection';
import { LoadingSpinner } from '../components/common/Loading';
import { ErrorState } from '../components/common/ErrorState';

export function WatchPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [currentServer, setCurrentServer] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [recommendations, setRecommendations] = useState([]);

  // Read episode index from URL query param `?ep=0`
  useEffect(() => {
    const epParam = searchParams.get('ep');
    if (epParam !== null) {
      const parsed = parseInt(epParam, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        setCurrentEpisode(parsed);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getMovieDetail(slug)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.movie) {
          setData(res);
          document.title = `Đang xem: ${res.movie.name} — VitaFlix`;

          // Fetch recommendations
          const countrySlug = res.movie.country?.[0]?.slug || 'han-quoc';
          api.getMoviesByCountry(countrySlug, 1, 6).then((recRes) => {
            if (isMounted) {
              setRecommendations((recRes.items || []).filter((m) => m.slug !== slug));
            }
          });
        } else {
          setData(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('[WatchPage] error:', err);
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
    return <LoadingSpinner text="Đang tải video..." />;
  }

  if (!data || !data.movie) {
    return (
      <ErrorState
        title="Không thể phát phim"
        message="Dữ liệu phim không khả dụng hoặc đường truyền tạm thời gián đoạn."
        onRetry={() => navigate('/')}
      />
    );
  }

  const movie = data.movie;
  const servers = data.episodes || [];
  const currentServerData = servers[currentServer]?.server_data || [];
  const activeEpisodeData = currentServerData[currentEpisode] || currentServerData[0];

  const handleSelectEpisode = (serverIndex, episodeIndex) => {
    setCurrentServer(serverIndex);
    setCurrentEpisode(episodeIndex);
    setSearchParams({ ep: episodeIndex.toString() });
  };

  const handleNextEpisode = () => {
    if (currentEpisode < currentServerData.length - 1) {
      handleSelectEpisode(currentServer, currentEpisode + 1);
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisode > 0) {
      handleSelectEpisode(currentServer, currentEpisode - 1);
    }
  };

  const videoSource = activeEpisodeData?.link_m3u8 || activeEpisodeData?.link_embed || '';
  const posterUrl = getImageUrl(movie.thumb_url || movie.poster_url);

  return (
    <div className="container-fluid px-lg-5 px-3 py-4" style={{ maxWidth: '1600px', margin: '0 auto' }}>
      <div className="row g-4">
        {/* Left Column: Player, Controls, Episodes, Info, Comments */}
        <div className="col-lg-8 col-xl-9">
          {/* Video Player */}
          <VideoPlayer
            source={videoSource}
            poster={posterUrl}
            movieName={movie.name}
            episodeName={activeEpisodeData?.name || `Tập ${currentEpisode + 1}`}
            onNextEpisode={handleNextEpisode}
            onPrevEpisode={handlePrevEpisode}
            hasNext={currentEpisode < currentServerData.length - 1}
            hasPrev={currentEpisode > 0}
          />

          {/* Episode Selection List */}
          <EpisodeList
            servers={servers}
            currentServer={currentServer}
            currentEpisode={currentEpisode}
            onSelectEpisode={handleSelectEpisode}
          />

          {/* Movie Summary Details */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              border: '1px solid var(--border-subtle)',
              marginTop: '24px'
            }}
          >
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-white)', margin: 0 }}>
                {movie.name}
              </h1>
              <Link to={`/movie/${movie.slug}`} className="see-more-link">
                <span>Xem chi tiết phim</span>
                <i className="fa-solid fa-circle-info ms-1" />
              </Link>
            </div>

            <div className="gradient-text mb-3">
              {movie.origin_name} ({movie.year || '2024'})
            </div>

            <div className="hero-badges mb-3">
              <span className="badge-item badge-imdb">IMDb {movie.tmdb?.vote_average ? Number(movie.tmdb.vote_average).toFixed(1) : '8.6'}</span>
              <span className="badge-item badge-quality">{movie.quality || 'HD'}</span>
              <span className="badge-item badge-episode">{movie.episode_current || 'Full'}</span>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14px', margin: 0 }}>
              {movie.content?.replace(/<[^>]*>/g, '') || 'Nội dung đang được cập nhật.'}
            </p>
          </div>

          {/* Comments Component */}
          <CommentSection movieSlug={movie.slug} />
        </div>

        {/* Right Sidebar: Recommended Movies */}
        <div className="col-lg-4 col-xl-3">
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              border: '1px solid var(--border-subtle)',
              position: 'sticky',
              top: '90px'
            }}
          >
            <h3 style={{ fontSize: '18px', color: 'var(--text-white)', marginBottom: '16px' }}>
              <i className="fa-solid fa-fire text-danger me-2" />
              Đề Xuất Cho Bạn
            </h3>

            <div className="d-flex flex-column gap-3">
              {recommendations.map((rec) => (
                <Link
                  key={rec.slug}
                  to={`/watch/${rec.slug}`}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    transition: 'var(--transition-fast)'
                  }}
                  className="rec-sidebar-item"
                >
                  <img
                    src={getImageUrl(rec.poster_url || rec.thumb_url)}
                    alt={rec.name}
                    style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                    onError={handleImageError}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rec.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {rec.origin_name || ''}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--accent-gold)', marginTop: '4px' }}>
                      <i className="fa-solid fa-star me-1" /> {rec.year || '2024'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
