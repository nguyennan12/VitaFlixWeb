import React from 'react';

export function LoadingSpinner({ text = 'Đang tải dữ liệu...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 20px',
      color: 'var(--text-secondary)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: 'var(--accent-cyan)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: '16px'
      }} />
      <p style={{ fontSize: '14px', margin: 0 }}>{text}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="movie-grid">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} style={{
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          aspectRatio: '2/3',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
