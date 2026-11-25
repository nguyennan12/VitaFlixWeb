import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { HeroBanner } from '../components/home/HeroBanner';
import { MovieSlider } from '../components/home/MovieSlider';
import { ProfileBox } from '../components/home/ProfileBox';
import { ContinueWatchingSlider } from '../components/home/ContinueWatchingSlider';
import { LoadingSpinner } from '../components/common/Loading';
import { MovieCard } from '../components/common/MovieCard';

export function HomePage() {
  const [loading, setLoading] = useState(true);
  const [bannerMovies, setBannerMovies] = useState([]);
  const [newMovies, setNewMovies] = useState([]);
  const [koreaMovies, setKoreaMovies] = useState([]);
  const [chinaMovies, setChinaMovies] = useState([]);
  const [japanMovies, setJapanMovies] = useState([]);
  const [singleMovies, setSingleMovies] = useState([]);
  const [dubbedMovies, setDubbedMovies] = useState([]);
  const [randomMovies, setRandomMovies] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Fetch initial datasets in parallel
    Promise.all([
      api.getTopRatedMovies(8),
      api.getNewMovies(1),
      api.getMoviesByCountry('han-quoc', 1, 16),
      api.getMoviesByCountry('trung-quoc', 1, 16),
      api.getMoviesByCountry('nhat-ban', 1, 16),
      api.getMoviesByType('single', 1, 16),
      api.getMoviesByList('phim-long-tieng', { page: 1, limit: 16 })
    ])
      .then(([topRated, newRes, korRes, chnRes, jpnRes, sglRes, dubRes]) => {
        if (!isMounted) return;
        const newItems = newRes.items || [];
        setNewMovies(newItems);
        setBannerMovies(topRated.length > 0 ? topRated : newItems);
        setKoreaMovies(korRes.items || []);
        setChinaMovies(chnRes.items || []);
        setJapanMovies(jpnRes.items || []);
        setSingleMovies(sglRes.items || []);
        setDubbedMovies(dubRes.items || []);

        // Initial random pool (deduplicated by slug)
        const pool = [...newItems, ...(korRes.items || []), ...(chnRes.items || [])];
        const uniquePool = Array.from(new Map(pool.filter((m) => m?.slug).map((m) => [m.slug, m])).values());
        const shuffled = uniquePool.sort(() => 0.5 - Math.random()).slice(0, 14);
        setRandomMovies(shuffled);

        setLoading(false);
      })
      .catch((err) => {
        console.error('[HomePage] Fetch error:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleShuffleRandom = () => {
    const pool = [...newMovies, ...koreaMovies, ...chinaMovies, ...singleMovies];
    const uniquePool = Array.from(new Map(pool.filter((m) => m?.slug).map((m) => [m.slug, m])).values());
    const shuffled = uniquePool.sort(() => 0.5 - Math.random()).slice(0, 14);
    setRandomMovies(shuffled);
  };

  return (
    <div>
      {/* Hero Banner with active top-rated carousel */}
      <HeroBanner movies={bannerMovies} />

      <div className="container-fluid px-lg-5 px-3 py-4" style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* User Profile & Favorites Highlight */}
        <ProfileBox />

        {/* Continue Watching History */}
        <ContinueWatchingSlider />

        {loading ? (
          <LoadingSpinner text="Đang tải danh sách phim..." />
        ) : (
          <>
            {/* Phim Hàn Quốc Slider */}
            <MovieSlider
              title="Hàn Xẻng Nay Có Gì Hot?"
              viewMoreLink="/category?type=country&country=han-quoc"
              movies={koreaMovies}
            />

            {/* Phim Trung Quốc Slider */}
            <MovieSlider
              title="Cập Nhật Hoa Ngữ Hôm Nay"
              viewMoreLink="/category?type=country&country=trung-quoc"
              movies={chinaMovies}
            />

            {/* Phim Bom Tấn / Phim Lẻ Slider */}
            <MovieSlider
              title="Bom Tấn Cập Cảng — Phim Lẻ Nổi Bật"
              viewMoreLink="/category?type=single"
              movies={singleMovies}
              splitLayout
            />

            {/* Phim Lồng Tiếng Slider */}
            {dubbedMovies.length > 0 && (
              <MovieSlider
                title="Phim Lồng Tiếng Tuyển Chọn"
                viewMoreLink="/category?type=phim-long-tieng&sort_lang=long-tieng"
                movies={dubbedMovies}
              />
            )}

            {/* Phim Hoạt Hình / Anime Slider */}
            <MovieSlider
              title="Mới Ra Lò — Anime Nóng Hổi"
              viewMoreLink="/category?type=country&country=nhat-ban"
              movies={japanMovies}
            />

            {/* Random Movies Section */}
            <section className="mb-5">
              <div className="section-title-wrap">
                <h2 className="section-title">
                  <i className="fa-solid fa-dice text-cyan me-2" />
                  Không Biết Xem Gì Hôm Nay?
                </h2>
                <button
                  onClick={handleShuffleRandom}
                  className="see-more-link"
                  style={{ cursor: 'pointer' }}
                >
                  <i className="fa-solid fa-shuffle me-1" />
                  <span>Random lại</span>
                </button>
              </div>

              <div className="movie-grid">
                {randomMovies.map((movie) => (
                  <MovieCard key={`random-${movie.slug || movie._id}`} movie={movie} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
