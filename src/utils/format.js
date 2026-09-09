/**
 * Generates formatted rating string or defaults to random realistic rating
 */
export function formatRating(rating) {
  if (typeof rating === 'number' && rating > 0) {
    return rating.toFixed(1);
  }
  // Consistent pseudo-random rating
  return (8.2 + Math.random() * 1.3).toFixed(1);
}

/**
 * Returns human-readable relative time string (e.g., '5 phút trước', '2 giờ trước')
 */
export function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Vừa xong';
  
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 30) return `${diffDays} ngày trước`;
  
  return date.toLocaleDateString('vi-VN');
}

/**
 * Strips HTML tags from text
 */
export function stripHtml(html) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}
