import React from 'react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../../config/constants';
import { handleImageError } from '../../utils/image';

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        {/* Brand & Social */}
        <div>
          <div className="footer-brand">
            <img src={ASSETS.LOGO} alt="VitaFlix Logo" onError={handleImageError} />
            <h3 className="gradient-brand-text">VitaFlix</h3>
          </div>
          <p className="footer-desc">
            VitaFlix là website xem phim trực tuyến miễn phí chất lượng cao. Giao diện thân thiện,
            cập nhật phim mới liên tục, tối ưu trải nghiệm người dùng trên mọi thiết bị.
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-link" aria-label="Facebook">
              <i className="fa-brands fa-facebook-f" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link" aria-label="Instagram">
              <i className="fa-brands fa-instagram" />
            </a>
            <a href="https://github.com/nguyennan12" target="_blank" rel="noreferrer" className="social-link" aria-label="GitHub">
              <i className="fa-brands fa-github" />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="social-link" aria-label="TikTok">
              <i className="fa-brands fa-tiktok" />
            </a>
          </div>
        </div>

        {/* Khám phá */}
        <div className="footer-col">
          <h4>Khám Phá</h4>
          <ul className="footer-links">
            <li><Link to="/category?type=series">Phim Bộ Mới</Link></li>
            <li><Link to="/category?type=single">Phim Lẻ Hot</Link></li>
            <li><Link to="/category?type=country&country=han-quoc">Phim Hàn Quốc</Link></li>
            <li><Link to="/category?type=country&country=trung-quoc">Phim Trung Quốc</Link></li>
            <li><Link to="/category?type=country&country=nhat-ban">Anime Nhật Bản</Link></li>
          </ul>
        </div>

        {/* Thông tin */}
        <div className="footer-col">
          <h4>Thông Tin</h4>
          <ul className="footer-links">
            <li><Link to="/faq">Hỏi đáp (FAQ)</Link></li>
            <li><Link to="/policy">Chính sách bảo mật</Link></li>
            <li><Link to="/terms">Điều khoản sử dụng</Link></li>
          </ul>
        </div>

        {/* Đăng ký nhận tin */}
        <div className="footer-col">
          <h4>Đăng Ký Nhận Tin</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Nhập email của bạn để nhận thông báo về những bộ phim bom tấn mới nhất.
          </p>
          <form className="subscribe-form" onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn đã đăng ký nhận tin!'); }}>
            <input type="email" placeholder="Email của bạn..." required />
            <button type="submit">Gửi</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} VitaFlix. All rights reserved. Developed with React & Vite.</div>
        <div className="d-flex gap-3">
          <Link to="/policy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/faq">FAQ</Link>
        </div>
      </div>
    </footer>
  );
}
