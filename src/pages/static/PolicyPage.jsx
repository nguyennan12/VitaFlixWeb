import React, { useEffect } from 'react';

export function PolicyPage() {
  useEffect(() => {
    document.title = 'Chính Sách Bảo Mật — VitaFlix';
  }, []);

  return (
    <div className="container py-5" style={{ maxWidth: '900px' }}>
      <div className="text-center mb-5">
        <h1 className="gradient-text fs-2 mb-2">Chính Sách Bảo Mật</h1>
        <p className="text-muted">Cam kết bảo vệ quyền riêng tư và thông tin cá nhân</p>
      </div>

      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '36px',
          lineHeight: '1.7',
          color: 'var(--text-secondary)'
        }}
      >
        <h3 className="text-white fs-5 mb-3">1. Thu thập thông tin</h3>
        <p className="mb-4">
          Tại VitaFlix, chúng tôi tôn trọng quyền riêng tư của bạn. Khi bạn đăng ký tài khoản hoặc sử dụng dịch vụ,
          chúng tôi chỉ lưu trữ các thông tin cơ bản cần thiết như email, username để cá nhân hóa trải nghiệm xem phim.
        </p>

        <h3 className="text-white fs-5 mb-3">2. Mục đích sử dụng</h3>
        <p className="mb-4">
          Thông tin được sử dụng để cung cấp và duy trì dịch vụ, lưu trữ danh sách phim yêu thích, lịch sử bình luận
          và cải thiện tốc độ tải trang. Chúng tôi cam kết không bán hoặc chia sẻ thông tin cho bên thứ ba.
        </p>

        <h3 className="text-white fs-5 mb-3">3. Bảo mật thông tin</h3>
        <p className="mb-4">
          Chúng tôi áp dụng các tiêu chuẩn mã hóa và bảo mật hiện đại để bảo vệ dữ liệu người dùng khỏi việc truy cập trái phép.
        </p>

        <h3 className="text-white fs-5 mb-3">4. Quyền của người dùng</h3>
        <p className="mb-0">
          Người dùng có toàn quyền xem, chỉnh sửa hoặc xóa thông tin cá nhân của mình bất kỳ lúc nào thông qua trang Quản lý tài khoản.
        </p>
      </div>
    </div>
  );
}
