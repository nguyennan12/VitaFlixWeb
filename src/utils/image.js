import { ASSETS } from '../config/constants';

/**
 * Resolves full poster / thumb URL with proper CDN domain & safe SVG fallback.
 */
export function getImageUrl(path) {
  if (!path) return ASSETS.POSTER_PLACEHOLDER;
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Format with phimimg CDN
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `https://phimimg.com/${cleanPath}`;
}

/**
 * Image error event handler for JSX <img onerror={...} />
 */
export function handleImageError(e) {
  e.currentTarget.onerror = null; // Prevent infinite loop
  e.currentTarget.src = ASSETS.POSTER_PLACEHOLDER;
}
