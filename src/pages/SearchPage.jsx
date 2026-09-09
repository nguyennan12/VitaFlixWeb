import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { MovieCard } from '../components/common/MovieCard';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/Loading';
import { ErrorState } from '../components/common/ErrorState';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [inputVal, setInputVal] = useState(query);
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  useEffect(() => {
    setInputVal(query);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setMovies([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    document.title = `Tìm kiếm: "${query}" — Trang ${page} | VitaFlix`;

    api.searchMovies(query, page, 24)
      .then((res) => {
        if (!isMounted) return;
        setMovies(res.items || []);
        setPagination({
          currentPage: page,
          totalPages: res.pagination?.totalPages || 1,
          totalItems: res.pagination?.totalItems || (res.items || []).length
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('[SearchPage] error:', err);
        if (isMounted) {
          setMovies([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [query, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim(), page: '1' });
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ q: query, page: newPage.toString() });
  };

  return (
    <div className="container-fluid px-lg-5 px-3 py-4" style={{ maxWidth: '1600px', margin: '0 auto' }}>
      {/* Search Header & Input */}
      <div className="text-center py-4">
        <h1 className="gradient-text fs-2 mb-3">
          <i className="fa-solid fa-magnifying-glass me-2" />
          Tìm Kiếm Phim
        </h1>

        <form
          onSubmit={handleSearchSubmit}
          style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '8px' }}
        >
          <input
            type="text"
            className="form-control form-control-lg bg-dark text-white border-secondary"
            placeholder="Nhập tên phim, diễn viên..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-lg"
            style={{
              background: 'var(--gradient-primary)',
              color: '#121316',
              fontWeight: '700',
              padding: '0 24px'
            }}
          >
            Tìm
          </button>
        </form>

        {query && (
          <p className="text-muted mt-3 mb-0 fs-6">
            Kết quả tìm kiếm cho từ khóa: <strong className="text-white">"{query}"</strong>
            {pagination.totalItems > 0 && ` (${pagination.totalItems} phim)`}
          </p>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text={`Đang tìm phim cho "${query}"...`} />
      ) : !query.trim() ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-clapperboard" style={{ fontSize: '48px', opacity: 0.3, marginBottom: '16px' }} />
          <p style={{ fontSize: '16px' }}>Nhập từ khóa phía trên để bắt đầu tìm kiếm phim.</p>
        </div>
      ) : movies.length === 0 ? (
        <ErrorState
          title="Không tìm thấy phim phù hợp"
          message={`Không tìm thấy kết quả nào cho "${query}". Bạn hãy thử tìm với từ khóa khác.`}
          onRetry={() => {}}
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
