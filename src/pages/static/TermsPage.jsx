import React, { useEffect } from 'react';

export function TermsPage() {
  useEffect(() => {
    document.title = 'Điều Khoản Sử Dụng — VitaFlix';
  }, []);

  return (
    <div className="container py-5" style={{ maxWidth: '900px' }}>
      <div className="text-center mb-5">
        <h1 className="gradient-text fs-2 mb-2">Điều Khoản Sử Dụng</h1>
        <p className="text-muted">Các quy định khi truy cập và trải nghiệm dịch vụ tại VitaFlix</p>
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
        <h3 className="text-white fs-5 mb-3">1. Chấp nhận điều khoản</h3>
        <p className="mb-4">
          Khi truy cập và sử dụng VitaFlix, bạn đồng ý tuân thủ các điều khoản sử dụng này. Nếu không đồng ý, vui lòng ngừng sử dụng trang web.
        </p>

        <h3 className="text-white fs-5 mb-3">2. Trách nhiệm người dùng</h3>
        <p className="mb-4">
          Người dùng cam kết không sử dụng trang web cho các mục đích vi phạm pháp luật, không can thiệp hoặc gây ảnh hưởng đến hệ thống máy chủ và bảo mật.
        </p>

        <h3 className="text-white fs-5 mb-3">3. Miễn trừ trách nhiệm</h3>
        <p className="mb-0">
          Nội dung phim được tổng hợp tự động từ các nguồn chia sẻ công khai trên Internet. VitaFlix không chịu trách nhiệm pháp lý đối với nội dung của bên thứ ba.
        </p>
      </div>
    </div>
  );
}
