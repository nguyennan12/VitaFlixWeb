import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ASSETS } from '../config/constants';

export function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register fields
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!loginId.trim() || !loginPass) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập/email và mật khẩu.');
      return;
    }

    const res = login(loginId, loginPass);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Đăng nhập không thành công.');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regUsername.trim() || !regEmail.trim() || !regPass || !regConfirmPass) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    if (regPass !== regConfirmPass) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp.');
      return;
    }

    if (regPass.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    const res = register({
      username: regUsername.trim(),
      email: regEmail.trim(),
      password: regPass,
      firstName: regFirstName.trim(),
      lastName: regLastName.trim()
    });

    if (res.success) {
      setSuccessMsg('Đăng ký thành công! Đang chuyển về trang chủ...');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } else {
      setError(res.message || 'Đăng ký không thành công.');
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(28, 30, 36, 0.95)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px',
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Logo */}
        <div className="text-center mb-4">
          <img src={ASSETS.LOGO} alt="VitaFlix" style={{ height: '48px', marginBottom: '8px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-white)' }}>
            {isRegister ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập VitaFlix'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {isRegister ? 'Tạo tài khoản để lưu phim và bình luận' : 'Xem phim không giới hạn và hoàn toàn miễn phí'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger py-2 fs-6 mb-3" role="alert">
            <i className="fa-solid fa-circle-exclamation me-2" />
            {error}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="alert alert-success py-2 fs-6 mb-3" role="alert">
            <i className="fa-solid fa-circle-check me-2" />
            {successMsg}
          </div>
        )}

        {/* Form Content */}
        {!isRegister ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit}>
            <div className="mb-3">
              <label className="form-label text-secondary small">Tên người dùng hoặc Email</label>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                placeholder="Nhập username hoặc email..."
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-secondary small">Mật khẩu</label>
              <input
                type="password"
                className="form-control bg-dark text-white border-secondary"
                placeholder="Nhập mật khẩu..."
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn w-100 mb-3 py-2"
              style={{
                background: 'var(--gradient-brand)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '15px',
                borderRadius: 'var(--radius-md)'
              }}
            >
              Đăng Nhập
            </button>

            <div className="text-center text-secondary small mt-3">
              Bạn chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(''); }}
                className="text-cyan fw-bold border-0 bg-transparent p-0"
              >
                Đăng ký ngay
              </button>
            </div>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit}>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label text-secondary small">Họ</label>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Nguyễn"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="form-label text-secondary small">Tên</label>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="Văn An"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label text-secondary small">Tên người dùng *</label>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                placeholder="Chọn username..."
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-secondary small">Địa chỉ Email *</label>
              <input
                type="email"
                className="form-control bg-dark text-white border-secondary"
                placeholder="email@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-secondary small">Mật khẩu *</label>
              <input
                type="password"
                className="form-control bg-dark text-white border-secondary"
                placeholder="Ít nhất 6 ký tự..."
                value={regPass}
                onChange={(e) => setRegPass(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-secondary small">Xác nhận mật khẩu *</label>
              <input
                type="password"
                className="form-control bg-dark text-white border-secondary"
                placeholder="Nhập lại mật khẩu..."
                value={regConfirmPass}
                onChange={(e) => setRegConfirmPass(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn w-100 mb-3 py-2"
              style={{
                background: 'var(--gradient-brand)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '15px',
                borderRadius: 'var(--radius-md)'
              }}
            >
              Tạo Tài Khoản
            </button>

            <div className="text-center text-secondary small mt-3">
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                className="text-cyan fw-bold border-0 bg-transparent p-0"
              >
                Đăng nhập
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
