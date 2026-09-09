import React from 'react';

export function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  // Generate visible page numbers (sliding window around current page)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return { pages, start, end };
  };

  const { pages, start, end } = getPageNumbers();

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="pagination-wrap">
      {/* First Page */}
      <button
        className="page-btn"
        disabled={currentPage === 1}
        onClick={() => handlePageClick(1)}
        title="Trang đầu"
      >
        <i className="fa-solid fa-angles-left" />
      </button>

      {/* Prev Page */}
      <button
        className="page-btn"
        disabled={currentPage === 1}
        onClick={() => handlePageClick(currentPage - 1)}
        title="Trang trước"
      >
        <i className="fa-solid fa-angle-left" />
      </button>

      {/* Leading ellipsis */}
      {start > 1 && (
        <>
          <button className="page-btn" onClick={() => handlePageClick(1)}>1</button>
          {start > 2 && <span style={{ color: 'var(--text-muted)' }}>...</span>}
        </>
      )}

      {/* Page Numbers */}
      {pages.map((p) => (
        <button
          key={p}
          className={`page-btn ${p === currentPage ? 'active' : ''}`}
          onClick={() => handlePageClick(p)}
        >
          {p}
        </button>
      ))}

      {/* Trailing ellipsis */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ color: 'var(--text-muted)' }}>...</span>}
          <button className="page-btn" onClick={() => handlePageClick(totalPages)}>{totalPages}</button>
        </>
      )}

      {/* Next Page */}
      <button
        className="page-btn"
        disabled={currentPage === totalPages}
        onClick={() => handlePageClick(currentPage + 1)}
        title="Trang sau"
      >
        <i className="fa-solid fa-angle-right" />
      </button>

      {/* Last Page */}
      <button
        className="page-btn"
        disabled={currentPage === totalPages}
        onClick={() => handlePageClick(totalPages)}
        title="Trang cuối"
      >
        <i className="fa-solid fa-angles-right" />
      </button>
    </div>
  );
}
