// API Endpoints
export const API_BASE_URL = 'https://phimapi.com';
export const PROXY_BASE_URL = '/api/proxy';

// Determine if we need to route through Vercel serverless proxy or direct
export const IS_PRODUCTION = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';

// Storage Keys
export const STORAGE_KEYS = {
  CURRENT_USER: 'vitaflix_current_user',
  USERS: 'vitaflix_users',
  FAVORITES: 'vitaflix_favorites',
  FAV_SLUGS: 'movieFavSlug',
  WATCH_HISTORY: 'vitaflix_watch_history',
  COMMENTS_PREFIX: 'comments_'
};

// Fallback Asset Paths
export const ASSETS = {
  LOGO: '/assets/images/VitaFlix.png',
  DEFAULT_AVATAR: '/assets/images/avatar-default.jpg',
  DEFAULT_AVATAR_3: '/assets/images/avatar-default-3.jpg',
  POSTER_PLACEHOLDER: '/assets/images/poster-placeholder.svg'
};

// Categories & Filters Dictionary
export const GENRES = [
  { slug: 'hanh-dong', name: 'Hành Động' },
  { slug: 'kinh-di', name: 'Kinh Dị' },
  { slug: 'hai-huoc', name: 'Hài Hước' },
  { slug: 'tinh-cam', name: 'Tình Cảm' },
  { slug: 'khoa-hoc-vien-tuong', name: 'Khoa Học Viễn Tưởng' },
  { slug: 'phieu-luu', name: 'Phiêu Lưu' },
  { slug: 'than-thoai', name: 'Thần Thoại' },
  { slug: 'tai-lieu', name: 'Tài Liệu' },
  { slug: 'vo-thuat', name: 'Võ Thuật' },
  { slug: 'tam-ly', name: 'Tâm Lý' },
  { slug: 'co-trang', name: 'Cổ Trang' },
  { slug: 'hoat-hinh', name: 'Hoạt Hình' }
];

export const COUNTRIES = [
  { slug: 'han-quoc', name: 'Hàn Quốc' },
  { slug: 'trung-quoc', name: 'Trung Quốc' },
  { slug: 'thai-lan', name: 'Thái Lan' },
  { slug: 'au-my', name: 'Âu Mỹ' },
  { slug: 'nhat-ban', name: 'Nhật Bản' },
  { slug: 'viet-nam', name: 'Việt Nam' },
  { slug: 'an-do', name: 'Ấn Độ' },
  { slug: 'dai-loan', name: 'Đài Loan' },
  { slug: 'hong-kong', name: 'Hồng Kông' }
];

export const TYPES = [
  { slug: 'series', name: 'Phim Bộ' },
  { slug: 'single', name: 'Phim Lẻ' },
  { slug: 'hoathinh', name: 'Anime / Hoạt Hình' },
  { slug: 'tvshows', name: 'TV Shows' }
];
