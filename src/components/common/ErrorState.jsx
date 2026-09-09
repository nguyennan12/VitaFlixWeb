import React from 'react';

export function ErrorState({ title = 'Không tìm thấy dữ liệu', message = 'Vui lòng thử lại sau hoặc chọn thể loại khác.', onRetry }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      color: 'var(--text-muted)'
    }}>
      <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '48px', color: 'var(--accent-cyan)', opacity: 0.8, marginBottom: '16px' }} />
      <h3 style={{ color: 'var(--text-white)', fontSize: '20px', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px auto' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: 'var(--gradient-primary)',
            color: '#121316',
            fontWeight: '600',
            padding: '8px 20px',
            borderRadius: 'var(--radius-full)'
          }}
        >
          <i className="fa-solid fa-rotate-right me-2" /> Thử lại
        </button>
      )}
    </div>
  );
}
