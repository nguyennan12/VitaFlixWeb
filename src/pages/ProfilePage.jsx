import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ASSETS } from '../config/constants';

export function ProfilePage() {
  const { user, isLoggedIn, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (user) {
      setFullname(user.fullname || '');
      setEmail(user.email || '');
      setPassword(user.password || '');
      setAvatar(user.avatar || '');
      setBio(user.bio || '');
    }
  }, [user, isLoggedIn, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    const res = updateProfile({
      fullname: fullname.trim(),
      email: email.trim(),
      password: password,
      avatar: avatar.trim() || ASSETS.DEFAULT_AVATAR,
      bio: bio.trim()
    });

    if (res.success) {
      setMsg({ type: 'success', text: 'Cập nhật thông tin tài khoản thành công!' });
    } else {
      setMsg({ type: 'danger', text: res.message || 'Cập nhật thất bại.' });
    }
  };

  if (!isLoggedIn || !user) return null;

  return (
    <div className="container py-5" style={{ maxWidth: '600px' }}>
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary">
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-white)', margin: 0 }}>
            <i className="fa-solid fa-user-gear text-cyan me-2" />
            Quản Lý Tài Khoản
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="text-secondary fs-6 border-0 bg-transparent"
          >
            ← Quay lại
          </button>
        </div>

        {msg.text && (
          <div className={`alert alert-${msg.type} py-2 fs-6 mb-4`}>
            {msg.text}
          </div>
        )}

        {/* Avatar Preview */}
        <div className="text-center mb-4">
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              margin: '0 auto 16px auto',
              border: '3px solid var(--accent-cyan)',
              boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)'
            }}
          >
            <img
              src={avatar || ASSETS.DEFAULT_AVATAR}
              alt="Avatar preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.src = ASSETS.DEFAULT_AVATAR; }}
            />
          </div>
          <div className="text-muted small">Tên đăng nhập: <strong className="text-white">@{user.username}</strong></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary small">Link ảnh đại diện (Avatar URL)</label>
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary"
              placeholder="Dán link ảnh avatar mới..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small">Họ và tên</label>
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small">Email</label>
            <input
              type="email"
              className="form-control bg-dark text-white border-secondary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small">Mật khẩu</label>
            <div className="input-group">
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control bg-dark text-white border-secondary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPass(!showPass)}
              >
                <i className={`fa-solid fa-eye${showPass ? '-slash' : ''}`} />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary small">Tiểu sử (Bio)</label>
            <textarea
              className="form-control bg-dark text-white border-secondary"
              rows={3}
              placeholder="Chia sẻ một chút về bản thân..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn w-100 py-2 mb-3"
            style={{
              background: 'var(--gradient-brand)',
              color: '#fff',
              fontWeight: '700',
              borderRadius: 'var(--radius-md)'
            }}
          >
            Lưu Thay Đổi
          </button>

          <button
            type="button"
            className="btn btn-outline-danger w-100 py-2"
            onClick={() => {
              if (window.confirm('Bạn có muốn đăng xuất không?')) {
                logout();
                navigate('/');
              }
            }}
          >
            <i className="fa-solid fa-right-from-bracket me-2" /> Đăng Xuất
          </button>
        </form>
      </div>
    </div>
  );
}
