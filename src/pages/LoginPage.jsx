import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { ASSETS } from '../config/constants';

export function LoginPage() {
  const { isLoggedIn, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    if (!credentialResponse?.credential) {
      setError('Không nhận được mã xác thực từ Google.');
      return;
    }

    setSubmitting(true);
    const res = await loginWithGoogle(credentialResponse.credential);
    setSubmitting(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Đăng nhập không thành công.');
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(28, 30, 36, 0.95)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 32px',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center'
        }}
      >
        <img
          src={ASSETS.LOGO}
          alt="VitaFlix"
          style={{ height: '48px', marginBottom: '16px', objectFit: 'contain' }}
        />

        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-white)', marginBottom: '8px' }}>
          Chào mừng đến với VitaFlix
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: '1.5' }}>
          Đăng nhập bằng tài khoản Google để đồng bộ lịch sử xem, tiếp tục xem đúng đoạn đang dở và lưu danh sách phim yêu thích.
        </p>

        {error && (
          <div className="alert alert-danger py-2 fs-6 mb-4 text-start">
            <i className="fa-solid fa-triangle-exclamation me-2" />
            {error}
          </div>
        )}

        <div className="d-flex justify-content-center mb-4">
          {submitting ? (
            <div className="text-cyan py-2">
              <i className="fa-solid fa-spinner fa-spin me-2" />
              Đang xác thực tài khoản...
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Đăng nhập Google thất bại hoặc đã bị hủy.')}
              theme="filled_black"
              size="large"
              shape="pill"
              text="signin_with"
              locale="vi"
            />
          )}
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '18px',
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}
        >
          Phiên đăng nhập được bảo vệ bằng Access/Refresh Token qua httpOnly Cookie.
        </div>
      </div>
    </div>
  );
}
