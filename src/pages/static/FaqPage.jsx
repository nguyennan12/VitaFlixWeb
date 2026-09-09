import React, { useEffect } from 'react';

const FAQ_LIST = [
  { q: '1. VitaFlix là gì và có những đặc điểm nổi bật nào?', a: 'VitaFlix là một trang web xem phim online miễn phí tại Việt Nam, cung cấp kho phim chất lượng HD và 4K, tốc độ tải mượt mà. Trang web có giao diện thân thiện và thường xuyên cập nhật phim mới nhất từ nhiều quốc gia.' },
  { q: '2. VitaFlix có miễn phí hoàn toàn không?', a: 'VitaFlix hoàn toàn miễn phí. Người dùng không cần trả phí hay đăng ký tài khoản để xem phim, giúp khán giả thoải mái lựa chọn và trải nghiệm hàng ngàn bộ phim chất lượng cao.' },
  { q: '3. VitaFlix có bao gồm các bộ phim chiếu rạp không?', a: 'VitaFlix cung cấp nhiều bộ phim chiếu rạp đình đám từ Việt Nam và quốc tế được cập nhật nhanh chóng.' },
  { q: '4. Tốc độ tải phim trên VitaFlix như thế nào?', a: 'VitaFlix có tốc độ tải nhanh, ổn định nhờ hệ thống máy chủ hiện đại, giúp người xem trải nghiệm phim online không bị gián đoạn hay giật lag.' },
  { q: '5. Chất lượng phim trên VitaFlix có tốt không?', a: 'VitaFlix cung cấp chất lượng phim từ HD, Full HD đến 4K với hình ảnh sắc nét và âm thanh sống động.' },
  { q: '6. Có thể xem VitaFlix trên các thiết bị nào?', a: 'VitaFlix hỗ trợ máy tính để bàn, laptop, điện thoại di động và máy tính bảng mọi lúc mọi nơi.' }
];

export function FaqPage() {
  useEffect(() => {
    document.title = 'Hỏi Đáp (FAQ) — VitaFlix';
  }, []);

  return (
    <div className="container py-5" style={{ maxWidth: '900px' }}>
      <div className="text-center mb-5">
        <h1 className="gradient-text fs-2 mb-2">Câu Hỏi Thường Gặp</h1>
        <p className="text-muted">Các thắc mắc phổ biến của người dùng tại VitaFlix</p>
      </div>

      <div className="d-flex flex-column gap-3">
        {FAQ_LIST.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '24px'
            }}
          >
            <h3 style={{ fontSize: '17px', color: 'var(--text-white)', marginBottom: '8px' }}>
              {item.q}
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, fontSize: '14px' }}>
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
