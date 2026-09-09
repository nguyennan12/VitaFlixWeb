import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { api } from '../../services/api';
import { GENRES, COUNTRIES, ASSETS } from '../../config/constants';
import { getImageUrl, handleImageError } from '../../utils/image';

export function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Search State
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const debouncedKeyword = useDebounce(keyword, 350);

  // UI States
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileGenreOpen, setMobileGenreOpen] = useState(false);
  const [mobileCountryOpen, setMobileCountryOpen] = useState(false);

  const searchBoxRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setShowSearchDropdown(false);
    setShowUserDropdown(false);
    setMobileDrawerOpen(false);
  }, [location.pathname, location.search]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Search Effect
  useEffect(() => {
    if (!debouncedKeyword.trim() || debouncedKeyword.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);

    api.searchMovies(debouncedKeyword.trim(), 1, 6)
      .then((res) => {
        if (isMounted) {
          setSearchResults(res.items || []);
          setIsSearching(false);
          setShowSearchDropdown(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSearchResults([]);
          setIsSearching(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedKeyword]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      setShowSearchDropdown(false);
      navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleUserIconClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      setShowUserDropdown(!showUserDropdown);
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Mobile menu button */}
        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileDrawerOpen(true)}
          aria-label="Mở menu"
        >
          <i className="fa-solid fa-bars" />
        </button>

        {/* Logo */}
        <Link to="/" className="header-logo">
          <img src={ASSETS.LOGO} alt="VitaFlix Logo" onError={handleImageError} />
          <h1 className="header-logo-text">VitaFlix</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="d-none d-lg-block">
          <ul className="header-nav">
            <li className="nav-item">
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                Trang chủ
              </Link>
            </li>

            {/* Dropdown Thể loại */}
            <li className="nav-item">
              <span className="nav-link" style={{ cursor: 'pointer' }}>
                Thể loại <i className="fa-solid fa-caret-down fs-xs" />
              </span>
              <div className="nav-dropdown dropdown-grid">
                {GENRES.map((g) => (
                  <Link key={g.slug} to={`/category?type=genre&genre=${g.slug}`} className="dropdown-item">
                    {g.name}
                  </Link>
                ))}
              </div>
            </li>

            {/* Phim Bộ */}
            <li className="nav-item">
              <Link to="/category?type=series" className="nav-link">
                Phim Bộ
              </Link>
            </li>

            {/* Phim Lẻ */}
            <li className="nav-item">
              <Link to="/category?type=single" className="nav-link">
                Phim Lẻ
              </Link>
            </li>

            {/* Dropdown Quốc gia */}
            <li className="nav-item">
              <span className="nav-link" style={{ cursor: 'pointer' }}>
                Quốc gia <i className="fa-solid fa-caret-down fs-xs" />
              </span>
              <div className="nav-dropdown dropdown-grid">
                {COUNTRIES.map((c) => (
                  <Link key={c.slug} to={`/category?type=country&country=${c.slug}`} className="dropdown-item">
                    {c.name}
                  </Link>
                ))}
              </div>
            </li>
          </ul>
        </nav>

        {/* Search & User Profile Section */}
        <div className="d-flex align-items-center gap-3">
          {/* Search Box */}
          <div className="header-search-wrap" ref={searchBoxRef}>
            <form onSubmit={handleSearchSubmit} className="search-input-box">
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  if (e.target.value.trim().length >= 2) setShowSearchDropdown(true);
                }}
                onFocus={() => {
                  if (keyword.trim().length >= 2) setShowSearchDropdown(true);
                }}
              />
              <button type="submit" className="search-icon-btn" aria-label="Tìm kiếm">
                {isSearching ? (
                  <i className="fa-solid fa-spinner fa-spin" />
                ) : (
                  <i className="fa-solid fa-magnifying-glass" />
                )}
              </button>
            </form>

            {/* Live Search Dropdown */}
            {showSearchDropdown && keyword.trim().length >= 2 && (
              <div className="search-results-dropdown">
                {isSearching ? (
                  <div className="text-center p-3 text-muted">
                    <i className="fa-solid fa-spinner fa-spin me-2" /> Đang tìm kiếm...
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((item) => (
                      <Link
                        key={item.slug}
                        to={`/movie/${item.slug}`}
                        className="search-result-item"
                        onClick={() => setShowSearchDropdown(false)}
                      >
                        <img
                          src={getImageUrl(item.thumb_url || item.poster_url)}
                          alt={item.name}
                          className="search-result-thumb"
                          onError={handleImageError}
                        />
                        <div className="search-result-info">
                          <span className="search-result-title">{item.name}</span>
                          <span className="search-result-meta">
                            {item.year || '2024'} • {item.type === 'series' ? 'Phim bộ' : 'Phim lẻ'}
                          </span>
                        </div>
                      </Link>
                    ))}
                    <Link
                      to={`/search?q=${encodeURIComponent(keyword.trim())}`}
                      className="search-view-all"
                      onClick={() => setShowSearchDropdown(false)}
                    >
                      Xem tất cả kết quả cho "{keyword}" <i className="fa-solid fa-arrow-right ms-1" />
                    </Link>
                  </>
                ) : (
                  <div className="text-center p-3 text-muted">
                    Không tìm thấy phim phù hợp
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="user-menu-wrap" ref={userMenuRef}>
            <button
              className="user-avatar-btn"
              onClick={handleUserIconClick}
              title={isLoggedIn ? user.fullname || user.username : 'Đăng nhập'}
              aria-label="Tài khoản"
            >
              {isLoggedIn && user.avatar ? (
                <img src={user.avatar} alt="Avatar" onError={(e) => { e.currentTarget.src = ASSETS.DEFAULT_AVATAR; }} />
              ) : (
                <i className="fa-solid fa-user text-white" />
              )}
            </button>

            {/* User Dropdown */}
            {showUserDropdown && isLoggedIn && (
              <div className="user-dropdown-menu">
                <div className="user-dropdown-header">
                  <div className="user-greeting">Xin chào,</div>
                  <div className="user-name">{user.fullname || user.username}</div>
                </div>
                <Link to="/profile" className="user-dropdown-link">
                  <i className="fa-solid fa-gear text-cyan" /> Quản lý tài khoản
                </Link>
                <button
                  className="user-dropdown-link logout"
                  onClick={() => {
                    logout();
                    setShowUserDropdown(false);
                  }}
                >
                  <i className="fa-solid fa-right-from-bracket" /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileDrawerOpen ? 'open' : ''}`}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="header-logo-text m-0">VitaFlix</h3>
          <button
            className="text-white fs-4"
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Đóng menu"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <ul className="footer-links">
          <li>
            <Link to="/" className="text-white fs-6 py-2 d-block">
              <i className="fa-solid fa-house me-2" /> Trang chủ
            </Link>
          </li>
          
          {/* Accordion Genre */}
          <li>
            <div
              className="d-flex justify-content-between align-items-center py-2 text-secondary cursor-pointer"
              onClick={() => setMobileGenreOpen(!mobileGenreOpen)}
            >
              <span><i className="fa-solid fa-film me-2" /> Thể loại</span>
              <i className={`fa-solid fa-chevron-${mobileGenreOpen ? 'up' : 'down'} fs-xs`} />
            </div>
            {mobileGenreOpen && (
              <div className="ps-3 py-2 d-flex flex-column gap-2">
                {GENRES.map(g => (
                  <Link key={g.slug} to={`/category?type=genre&genre=${g.slug}`} className="text-muted small">
                    {g.name}
                  </Link>
                ))}
              </div>
            )}
          </li>

          <li>
            <Link to="/category?type=series" className="text-secondary py-2 d-block">
              <i className="fa-solid fa-tv me-2" /> Phim bộ
            </Link>
          </li>
          <li>
            <Link to="/category?type=single" className="text-secondary py-2 d-block">
              <i className="fa-solid fa-clapperboard me-2" /> Phim lẻ
            </Link>
          </li>

          {/* Accordion Country */}
          <li>
            <div
              className="d-flex justify-content-between align-items-center py-2 text-secondary cursor-pointer"
              onClick={() => setMobileCountryOpen(!mobileCountryOpen)}
            >
              <span><i className="fa-solid fa-globe me-2" /> Quốc gia</span>
              <i className={`fa-solid fa-chevron-${mobileCountryOpen ? 'up' : 'down'} fs-xs`} />
            </div>
            {mobileCountryOpen && (
              <div className="ps-3 py-2 d-flex flex-column gap-2">
                {COUNTRIES.map(c => (
                  <Link key={c.slug} to={`/category?type=country&country=${c.slug}`} className="text-muted small">
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </li>
        </ul>
      </div>

      {/* Backdrop */}
      {mobileDrawerOpen && (
        <div className="mobile-backdrop" onClick={() => setMobileDrawerOpen(false)} />
      )}
    </header>
  );
}
