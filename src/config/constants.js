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
  { slug: 'phim-bo', name: 'Phim Bộ' },
  { slug: 'phim-le', name: 'Phim Lẻ' },
  { slug: 'hoat-hinh', name: 'Anime / Hoạt Hình' },
  { slug: 'tv-shows', name: 'TV Shows' },
  { slug: 'phim-long-tieng', name: 'Phim Lồng Tiếng' },
  { slug: 'phim-thuyet-minh', name: 'Phim Thuyết Minh' },
  { slug: 'phim-vietsub', name: 'Phim Vietsub' },
  { slug: 'phim-chieu-rap', name: 'Phim Chiếu Rạp' },
  { slug: 'phim-bo-dang-chieu', name: 'Phim Bộ Đang Chiếu' },
  { slug: 'phim-bo-hoan-thanh', name: 'Phim Bộ Hoàn Thành' },
  { slug: 'subteam', name: 'Subteam' }
];

export const LANG_OPTIONS = [
  { value: '', name: 'Tất cả ngôn ngữ' },
  { value: 'long-tieng', name: 'Lồng Tiếng' },
  { value: 'thuyet-minh', name: 'Thuyết Minh' },
  { value: 'vietsub', name: 'Vietsub' }
];

export const SORT_OPTIONS = [
  { value: 'modified.time', name: 'Mới cập nhật' },
  { value: 'year', name: 'Năm phát hành' },
  { value: '_id', name: 'Mặc định' }
];
