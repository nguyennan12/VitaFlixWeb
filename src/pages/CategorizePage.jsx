import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { GENRES, COUNTRIES } from '../config/constants';
import { MovieCard } from '../components/common/MovieCard';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/Loading';
import { ErrorState } from '../components/common/ErrorState';

export function CategorizePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const type = searchParams.get('type') || 'series';
  const countrySlug = searchParams.get('country');
  const genreSlug = searchParams.get('genre');
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [pageTitle, setPageTitle] = useState('Danh Sách Phim');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    let fetchPromise;
    let title = 'Danh Sách Phim';

    if (type === 'country' && countrySlug) {
      const foundCountry = COUNTRIES.find((c) => c.slug === countrySlug);
      title = foundCountry ? `Phim ${foundCountry.name}` : `Phim Quốc Gia: ${countrySlug}`;
      fetchPromise = api.getMoviesByCountry(countrySlug, page, 24);
    } else if (type === 'genre' && genreSlug) {
      const foundGenre = GENRES.find((g) => g.slug === genreSlug);
      title = foundGenre ? `Thể Loại: ${foundGenre.name}` : `Thể Loại: ${genreSlug}`;
      fetchPromise = api.getMoviesByGenre(genreSlug, page, 24);
    } else if (type === 'single' || type === 'phim-le') {
      title = 'Phim Lẻ Mới Cập Nhật';
      fetchPromise = api.getMoviesByType('phim-le', page, 24);
    } else if (type === 'series' || type === 'phim-bo') {
      title = 'Phim Bộ Mới Cập Nhật';
      fetchPromise = api.getMoviesByType('phim-bo', page, 24);
    } else if (type === 'hoathinh' || type === 'hoat-hinh') {
      title = 'Phim Hoạt Hình / Anime';
      fetchPromise = api.getMoviesByType('hoat-hinh', page, 24);
    } else {
      title = 'Phim Mới Cập Nhật';
      fetchPromise = api.getNewMovies(page);
    }

    setPageTitle(title);
    document.title = `${title} — Trang ${page} | VitaFlix`;

    fetchPromise
      .then((res) => {
        if (!isMounted) return;
        setMovies(res.items || []);
        setPagination({
          currentPage: page,
          totalPages: res.pagination?.totalPages || 1
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('[CategorizePage] error:', err);
        if (isMounted) {
          setMovies([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [type, countrySlug, genreSlug, page]);

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', newPage.toString());
    setSearchParams(nextParams);
  };

  return (
    <div className="container-fluid px-lg-5 px-3 py-4" style={{ maxWidth: '1600px', margin: '0 auto' }}>
      {/* Category Header */}
      <div className="section-title-wrap border-bottom pb-3 mb-4">
        <h1 className="section-title" style={{ fontSize: '28px' }}>
          <i className="fa-solid fa-layer-group text-cyan me-2" />
          {pageTitle}
        </h1>
        <span className="text-muted fs-6">
          Trang {pagination.currentPage} / {pagination.totalPages}
        </span>
      </div>

      {loading ? (
        <LoadingSpinner text="Đang tải danh sách phim..." />
      ) : movies.length === 0 ? (
        <ErrorState
          title="Không tìm thấy phim"
          message="Không có dữ liệu phim cho thể loại hoặc trang được yêu cầu."
          onRetry={() => handlePageChange(1)}
        />
      ) : (
        <>
          <div className="movie-grid">
            {movies.map((movie) => (
              <MovieCard key={movie.slug || movie._id} movie={movie} />
            ))}
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
