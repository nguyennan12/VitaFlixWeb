import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { GENRES, COUNTRIES, TYPES, LANG_OPTIONS, SORT_OPTIONS } from '../config/constants';
import { MovieCard } from '../components/common/MovieCard';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/Loading';
import { ErrorState } from '../components/common/ErrorState';

const CURRENT_YEAR = new Date().getFullYear();
const FALLBACK_YEARS = Array.from({ length: 18 }, (_, i) => CURRENT_YEAR - i);

export function CategorizePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const type = searchParams.get('type') || 'phim-bo';
  const countrySlug = searchParams.get('country') || '';
  const genreSlug = searchParams.get('genre') || '';
  const sortLang = searchParams.get('sort_lang') || '';
  const yearParam = searchParams.get('year') || '';
  const sortField = searchParams.get('sort_field') || 'modified.time';
  const sortType = searchParams.get('sort_type') || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [genresList, setGenresList] = useState(GENRES);
  const [countriesList, setCountriesList] = useState(COUNTRIES);
  const [yearsList, setYearsList] = useState(FALLBACK_YEARS);

  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [pageTitle, setPageTitle] = useState('Danh Sách Phim');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  // Load dynamic filter dictionaries from API (cached)
  useEffect(() => {
    api.getGenres().then((list) => {
      if (list && list.length > 0) setGenresList(list);
    });
    api.getCountries().then((list) => {
      if (list && list.length > 0) setCountriesList(list);
    });
    api.getYears().then((list) => {
      if (list && list.length > 0) {
        const normalized = list
          .map((y) => (typeof y === 'object' ? y.year || y.slug || y.name : y))
          .filter(Boolean);
        if (normalized.length > 0) setYearsList(normalized);
      }
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const filters = {
      page,
      limit: 24,
      category: type !== 'genre' ? genreSlug : undefined,
      country: type !== 'country' ? countrySlug : undefined,
      year: yearParam || undefined,
      sort_lang: sortLang || undefined,
      sort_field: sortField,
      sort_type: sortType
    };

    let fetchPromise;
    let title = 'Danh Sách Phim';

    if (type === 'country' && countrySlug) {
      const found = countriesList.find((c) => c.slug === countrySlug);
      title = found ? `Phim ${found.name}` : `Phim Quốc Gia: ${countrySlug}`;
      fetchPromise = api.getMoviesByCountry(countrySlug, filters, 24);
    } else if (type === 'genre' && genreSlug) {
      const found = genresList.find((g) => g.slug === genreSlug);
      title = found ? `Thể Loại: ${found.name}` : `Thể Loại: ${genreSlug}`;
      fetchPromise = api.getMoviesByGenre(genreSlug, filters, 24);
    } else if (type === 'year' && yearParam) {
      title = `Phim Năm ${yearParam}`;
      fetchPromise = api.getMoviesByYear(yearParam, filters);
    } else if (type === 'new') {
      title = 'Phim Mới Cập Nhật';
      fetchPromise = api.getNewMovies(page, 'v3');
    } else {
      const foundType = TYPES.find((t) => t.slug === type);
      if (type === 'single') title = 'Phim Lẻ Mới Cập Nhật';
      else if (type === 'series') title = 'Phim Bộ Mới Cập Nhật';
      else if (type === 'hoathinh') title = 'Phim Hoạt Hình / Anime';
      else title = foundType ? foundType.name : 'Danh Sách Phim';

      fetchPromise = api.getMoviesByList(type, filters);
    }

    if (sortLang === 'long-tieng' && !title.includes('Lồng Tiếng')) {
      title = `${title} (Lồng Tiếng)`;
    } else if (sortLang === 'thuyet-minh' && !title.includes('Thuyết Minh')) {
      title = `${title} (Thuyết Minh)`;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, countrySlug, genreSlug, sortLang, yearParam, sortField, sortType, page]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const resetFilters = () => {
    setSearchParams({ type: 'phim-bo', page: '1' });
  };

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', newPage.toString());
    setSearchParams(nextParams);
  };

  return (
    <div className="container-fluid px-lg-5 px-3 py-4" style={{ maxWidth: '1600px', margin: '0 auto' }}>
      {/* Category Header */}
      <div className="section-title-wrap border-bottom pb-3 mb-3">
        <h1 className="section-title" style={{ fontSize: '28px' }}>
          <i className="fa-solid fa-layer-group text-cyan me-2" />
          {pageTitle}
        </h1>
        <span className="text-muted fs-6">
          Trang {pagination.currentPage} / {pagination.totalPages}
        </span>
      </div>

      {/* Filter Bar (KKPhim #bo-loc) */}
      <div
        className="mb-4 p-3"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div className="row g-2 align-items-end">
          {/* Ngôn ngữ / Lồng tiếng */}
          <div className="col-6 col-md-4 col-lg-2">
            <label className="form-label text-secondary small mb-1">Ngôn ngữ</label>
            <select
              className="form-select form-select-sm bg-dark text-white border-secondary"
              value={sortLang}
              onChange={(e) => updateFilter('sort_lang', e.target.value)}
            >
              {LANG_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.name}</option>
              ))}
            </select>
          </div>

          {/* Danh mục / Loại */}
          <div className="col-6 col-md-4 col-lg-2">
            <label className="form-label text-secondary small mb-1">Danh sách</label>
            <select
              className="form-select form-select-sm bg-dark text-white border-secondary"
              value={type}
              onChange={(e) => updateFilter('type', e.target.value)}
            >
              {TYPES.map((t) => (
                <option key={t.slug} value={t.slug}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Thể loại */}
          <div className="col-6 col-md-4 col-lg-2">
            <label className="form-label text-secondary small mb-1">Thể loại</label>
            <select
              className="form-select form-select-sm bg-dark text-white border-secondary"
              value={genreSlug}
              onChange={(e) => updateFilter('genre', e.target.value)}
            >
              <option value="">Tất cả thể loại</option>
              {genresList.map((g) => (
                <option key={g.slug} value={g.slug}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Quốc gia */}
          <div className="col-6 col-md-4 col-lg-2">
            <label className="form-label text-secondary small mb-1">Quốc gia</label>
            <select
              className="form-select form-select-sm bg-dark text-white border-secondary"
              value={countrySlug}
              onChange={(e) => updateFilter('country', e.target.value)}
            >
              <option value="">Tất cả quốc gia</option>
              {countriesList.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Năm */}
          <div className="col-6 col-md-4 col-lg-1">
            <label className="form-label text-secondary small mb-1">Năm</label>
            <select
              className="form-select form-select-sm bg-dark text-white border-secondary"
              value={yearParam}
              onChange={(e) => updateFilter('year', e.target.value)}
            >
              <option value="">Tất cả</option>
              {yearsList.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Sắp xếp */}
          <div className="col-6 col-md-4 col-lg-2">
            <label className="form-label text-secondary small mb-1">Sắp xếp</label>
            <select
              className="form-select form-select-sm bg-dark text-white border-secondary"
              value={`${sortField}:${sortType}`}
              onChange={(e) => {
                const [sf, st] = e.target.value.split(':');
                const next = new URLSearchParams(searchParams);
                next.set('sort_field', sf);
                next.set('sort_type', st);
                next.set('page', '1');
                setSearchParams(next);
              }}
            >
              {SORT_OPTIONS.map((s) => (
                <React.Fragment key={s.value}>
                  <option value={`${s.value}:desc`}>{s.name} (Mới → Cũ)</option>
                  <option value={`${s.value}:asc`}>{s.name} (Cũ → Mới)</option>
                </React.Fragment>
              ))}
            </select>
          </div>

          {/* Reset */}
          <div className="col-12 col-lg-1 d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary w-100"
              onClick={resetFilters}
              title="Đặt lại bộ lọc"
            >
              <i className="fa-solid fa-rotate-left" /> Đặt lại
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Đang tải danh sách phim..." />
      ) : movies.length === 0 ? (
        <ErrorState
          title="Không có dữ liệu phim"
          message="Không tìm thấy bộ phim nào phù hợp với bộ lọc hiện tại."
          onRetry={resetFilters}
        />
      ) : (
        <>
          <div className="movie-grid-wrap">
            {movies.map((movie) => (
              <MovieCard key={movie._id || movie.slug} movie={movie} />
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
