import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHistory } from '../context/HistoryContext';
import { useFavorites } from '../context/FavoritesContext';
import { ASSETS } from '../config/constants';
import { getImageUrl, handleImageError } from '../utils/image';

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function ProfilePage() {
  const { user, isLoggedIn, authLoading, logout } = useAuth();
  const { history, removeHistoryItem, clearHistory } = useHistory();
  const { favorites, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [authLoading, isLoggedIn, navigate]);

  if (authLoading || !isLoggedIn || !user) return null;

  return (
    <div className="container py-5" style={{ maxWidth: '1000px' }}>
      {/* User Header Card */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '28px'
        }}
      >
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid var(--accent-cyan)',
                flexShrink: 0
              }}
            >
              <img
                src={user.avatar || ASSETS.DEFAULT_AVATAR}
                alt={user.fullname}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.src = ASSETS.DEFAULT_AVATAR; }}
              />
            </div>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-white)', margin: '0 0 4px 0' }}>
                {user.fullname}
              </h2>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                {user.email}
                <span
                  className="ms-2 badge"
                  style={{ background: 'rgba(0, 212, 255, 0.15)', color: 'var(--accent-cyan)', fontWeight: '600' }}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-danger btn-sm px-3 py-2"
            onClick={async () => {
              if (window.confirm('Bạn có muốn đăng xuất không?')) {
                await logout();
                navigate('/');
              }
            }}
          >
            <i className="fa-solid fa-right-from-bracket me-2" /> Đăng xuất
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div className="d-flex gap-2">
          <button
            type="button"
            className={`btn btn-sm px-3 py-2 ${activeTab === 'history' ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary text-white'}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="fa-solid fa-clock-rotate-left me-2" />
            Lịch sử xem ({history.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm px-3 py-2 ${activeTab === 'favorites' ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary text-white'}`}
            onClick={() => setActiveTab('favorites')}
          >
            <i className="fa-solid fa-heart me-2 text-danger" />
            Phim yêu thích ({favorites.length})
          </button>
        </div>

        {activeTab === 'history' && history.length > 0 && (
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => {
              if (window.confirm('Xóa toàn bộ lịch sử xem phim?')) {
                clearHistory();
              }
            }}
          >
            <i className="fa-solid fa-trash me-1" /> Xóa tất cả lịch sử
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'history' ? (
        history.length === 0 ? (
          <div className="text-center py-5 text-muted" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
            <i className="fa-solid fa-film fa-2x mb-3 opacity-50" />
            <p className="m-0">Bạn chưa xem bộ phim nào gần đây.</p>
          </div>
        ) : (
          <div className="row g-3">
            {history.map((item) => {
              const duration = item.duration_seconds || 0;
              const current = item.current_time_seconds || 0;
              const percent = duration > 0 ? Math.min(100, Math.round((current / duration) * 100)) : 0;

              return (
                <div key={item.movie_slug} className="col-12 col-md-6">
                  <div
                    style={{
                      display: 'flex',
                      gap: '14px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      position: 'relative'
                    }}
                  >
                    <Link to={`/watch/${item.movie_slug}?ep=${item.episode_index || 0}`} style={{ flexShrink: 0 }}>
                      <img
                        src={getImageUrl(item.poster_url || item.thumb_url)}
                        alt={item.movie_name}
                        style={{ width: '80px', height: '112px', objectFit: 'cover', borderRadius: '6px' }}
                        onError={handleImageError}
                      />
                    </Link>
                    <div className="flex-grow-1 d-flex flex-column justify-content-between" style={{ minWidth: 0 }}>
                      <div>
                        <Link
                          to={`/watch/${item.movie_slug}?ep=${item.episode_index || 0}`}
                          className="text-white fw-bold d-block text-truncate"
                          style={{ fontSize: '15px' }}
                        >
                          {item.movie_name}
                        </Link>
                        {item.origin_name && (
                          <div className="text-muted small text-truncate">{item.origin_name}</div>
                        )}
                        <div className="text-cyan small mt-1">
                          {item.episode_name || `Tập ${(item.episode_index || 0) + 1}`}
                          {current > 0 && ` • ${formatTime(current)}`}
                          {duration > 0 && ` / ${formatTime(duration)}`}
                        </div>
                      </div>

                      <div>
                        {duration > 0 && (
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.12)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                            <div style={{ width: `${percent}%`, height: '100%', background: 'var(--accent-cyan)' }} />
                          </div>
                        )}
                        <div className="d-flex align-items-center justify-content-between">
                          <Link
                            to={`/watch/${item.movie_slug}?ep=${item.episode_index || 0}`}
                            className="btn btn-sm btn-primary py-1 px-2"
                            style={{ fontSize: '12px' }}
                          >
                            <i className="fa-solid fa-play me-1" /> Tiếp tục xem
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary border-0 text-muted"
                            title="Xóa khỏi lịch sử"
                            onClick={() => removeHistoryItem(item.movie_slug)}
                          >
                            <i className="fa-solid fa-xmark" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : favorites.length === 0 ? (
        <div className="text-center py-5 text-muted" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
          <i className="fa-regular fa-heart fa-2x mb-3 opacity-50" />
          <p className="m-0">Bạn chưa lưu phim nào vào danh sách yêu thích.</p>
        </div>
      ) : (
        <div className="row g-3">
          {favorites.map((fav) => (
            <div key={fav.slug} className="col-6 col-sm-4 col-md-3">
              <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <Link to={`/movie/${fav.slug}`}>
                  <img
                    src={getImageUrl(fav.poster_url || fav.thumb_url)}
                    alt={fav.name}
                    style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }}
                    onError={handleImageError}
                  />
                </Link>
                <div className="p-2 d-flex align-items-center justify-content-between gap-2">
                  <Link to={`/movie/${fav.slug}`} className="text-white small fw-semibold text-truncate">
                    {fav.name}
                  </Link>
                  <button
                    type="button"
                    className="btn btn-sm border-0 text-danger p-1"
                    title="Bỏ yêu thích"
                    onClick={() => toggleFavorite(fav)}
                  >
                    <i className="fa-solid fa-heart" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
