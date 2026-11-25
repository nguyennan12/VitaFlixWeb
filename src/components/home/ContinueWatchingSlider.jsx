import React from 'react';
import { Link } from 'react-router-dom';
import { useHistory } from '../../context/HistoryContext';
import { getImageUrl, handleImageError } from '../../utils/image';

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

export function ContinueWatchingSlider() {
  const { history, removeHistoryItem } = useHistory();

  if (!history || history.length === 0) return null;

  return (
    <section className="mb-5">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-white)', margin: 0 }}>
          <i className="fa-solid fa-clock-rotate-left text-cyan me-2" />
          Tiếp Tục Xem
        </h2>
        <Link to="/profile" className="see-more-link">
          Xem tất cả <i className="fa-solid fa-angle-right ms-1" />
        </Link>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '12px',
          scrollbarWidth: 'thin'
        }}
      >
        {history.slice(0, 12).map((item) => {
          const duration = item.duration_seconds || 0;
          const current = item.current_time_seconds || 0;
          const percent = duration > 0 ? Math.min(100, Math.round((current / duration) * 100)) : 0;

          return (
            <div
              key={item.movie_slug}
              style={{
                width: '220px',
                flexShrink: 0,
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                position: 'relative'
              }}
            >
              <button
                type="button"
                title="Xóa khỏi lịch sử"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeHistoryItem(item.movie_slug);
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  zIndex: 5,
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>

              <Link to={`/watch/${item.movie_slug}?ep=${item.episode_index || 0}`} style={{ display: 'block', position: 'relative' }}>
                <img
                  src={getImageUrl(item.thumb_url || item.poster_url)}
                  alt={item.movie_name}
                  style={{ width: '100%', height: '126px', objectFit: 'cover', display: 'block' }}
                  onError={handleImageError}
                />
                {duration > 0 && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.2)' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: 'var(--accent-cyan)' }} />
                  </div>
                )}
              </Link>

              <div style={{ padding: '10px 12px' }}>
                <Link
                  to={`/watch/${item.movie_slug}?ep=${item.episode_index || 0}`}
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-white)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {item.movie_name}
                </Link>
                <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                  {item.episode_name || `Tập ${(item.episode_index || 0) + 1}`}
                  {current > 0 ? ` • ${formatTime(current)}` : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
