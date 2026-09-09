import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { ASSETS } from '../../config/constants';
import { MovieCard } from '../common/MovieCard';

export function ProfileBox() {
  const { user, isLoggedIn } = useAuth();
  const { favorites } = useFavorites();

  const avatar = isLoggedIn && user?.avatar ? user.avatar : ASSETS.DEFAULT_AVATAR_3;
  const username = isLoggedIn ? user?.fullname || user?.username : 'Khách';
  const bio = isLoggedIn ? user?.bio || 'Love faded, peace stayed.' : 'Đăng nhập để lưu danh sách phim yêu thích của bạn.';

  return (
    <section
      style={{
        background: 'rgba(28, 30, 36, 0.6)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        margin: '40px 0',
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: '30px',
        alignItems: 'center'
      }}
      className="profile-section-home"
    >
      {/* User Info Highlight */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          borderRight: '1px solid var(--border-subtle)',
          paddingRight: '20px'
        }}
        className="profile-info-col"
      >
        <div
          style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid var(--accent-cyan)',
            boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)',
            marginBottom: '14px'
          }}
        >
          <img
            src={avatar}
            alt={username}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.src = ASSETS.DEFAULT_AVATAR; }}
          />
        </div>
        <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-white)', margin: '0 0 4px 0' }}>
          {username}
        </h4>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '14px' }}>
          {bio}
        </p>
        {!isLoggedIn ? (
          <Link
            to="/login"
            style={{
              background: 'var(--gradient-primary)',
              color: '#121316',
              fontSize: '13px',
              fontWeight: '700',
              padding: '6px 18px',
              borderRadius: 'var(--radius-full)'
            }}
          >
            Đăng nhập ngay
          </Link>
        ) : (
          <Link
            to="/profile"
            style={{
              border: '1px solid var(--border-cyan)',
              color: 'var(--accent-cyan)',
              fontSize: '13px',
              fontWeight: '600',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)'
            }}
          >
            Quản lý tài khoản
          </Link>
        )}
      </div>

      {/* Favorites Movies List */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-white)', margin: 0 }}>
            <i className="fa-solid fa-heart text-danger me-2" />
            Danh Sách Phim Yêu Thích ({favorites.length})
          </h3>
        </div>

        {favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
            <i className="fa-regular fa-heart" style={{ fontSize: '32px', opacity: 0.4, marginBottom: '8px' }} />
            <p style={{ margin: 0, fontSize: '14px' }}>Bạn chưa lưu phim nào vào danh sách yêu thích.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: '14px',
              overflowX: 'auto',
              paddingBottom: '8px'
            }}
            className="favorites-horizontal-list"
          >
            {favorites.slice(0, 8).map((movie) => (
              <div key={movie.slug} style={{ width: '150px', flexShrink: 0 }}>
                <MovieCard movie={movie} showHeart={true} />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 992px) {
          .profile-section-home {
            grid-template-columns: 1fr !important;
          }
          .profile-info-col {
            border-right: none !important;
            border-bottom: 1px solid var(--border-subtle);
            padding-right: 0 !important;
            padding-bottom: 20px;
          }
        }
      `}</style>
    </section>
  );
}
