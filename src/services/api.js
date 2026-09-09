import axios from 'axios';
import { API_BASE_URL, IS_PRODUCTION, PROXY_BASE_URL } from '../config/constants';

function formatUrl(endpoint) {
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  if (IS_PRODUCTION) {
    return `${PROXY_BASE_URL}?url=${encodeURIComponent(fullUrl)}`;
  }
  return fullUrl;
}

const apiClient = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const api = {
  /**
   * Get newly updated movies
   */
  async getNewMovies(page = 1) {
    try {
      const url = formatUrl(`/danh-sach/phim-moi-cap-nhat?page=${page}`);
      const res = await apiClient.get(url);
      const data = res.data;
      return {
        items: data.items || [],
        pagination: data.pagination || {
          totalItems: (data.items || []).length,
          totalItemsPerPage: 24,
          currentPage: page,
          totalPages: data.pagination?.totalPages || 50
        }
      };
    } catch (err) {
      console.error('[API] getNewMovies error:', err);
      return { items: [], pagination: { currentPage: page, totalPages: 1 } };
    }
  },

  /**
   * Get movies by Country
   */
  async getMoviesByCountry(countrySlug, page = 1, limit = 24) {
    try {
      const url = formatUrl(`/v1/api/quoc-gia/${countrySlug}?page=${page}&limit=${limit}`);
      const res = await apiClient.get(url);
      const data = res.data?.data || res.data;
      return {
        title: data?.titlePage || 'Danh sách phim',
        items: data?.items || [],
        pagination: data?.params?.pagination || {
          totalItems: (data?.items || []).length,
          totalItemsPerPage: limit,
          currentPage: page,
          totalPages: data?.params?.pagination?.totalPages || 1
        }
      };
    } catch (err) {
      console.error(`[API] getMoviesByCountry (${countrySlug}) error:`, err);
      return { title: 'Danh sách phim', items: [], pagination: { currentPage: page, totalPages: 1 } };
    }
  },

  /**
   * Get movies by Genre
   */
  async getMoviesByGenre(genreSlug, page = 1, limit = 24) {
    try {
      const url = formatUrl(`/v1/api/the-loai/${genreSlug}?page=${page}&limit=${limit}`);
      const res = await apiClient.get(url);
      const data = res.data?.data || res.data;
      return {
        title: data?.titlePage || 'Danh sách phim',
        items: data?.items || [],
        pagination: data?.params?.pagination || {
          totalItems: (data?.items || []).length,
          totalItemsPerPage: limit,
          currentPage: page,
          totalPages: data?.params?.pagination?.totalPages || 1
        }
      };
    } catch (err) {
      console.error(`[API] getMoviesByGenre (${genreSlug}) error:`, err);
      return { title: 'Danh sách phim', items: [], pagination: { currentPage: page, totalPages: 1 } };
    }
  },

  /**
   * Get movies by Type (phim-bo, phim-le, hoat-hinh, tv-shows)
   */
  async getMoviesByType(typeSlug, page = 1, limit = 24) {
    // Convert short types to API endpoint slugs
    const typeMapping = {
      'series': 'phim-bo',
      'phim-bo': 'phim-bo',
      'single': 'phim-le',
      'phim-le': 'phim-le',
      'hoathinh': 'hoat-hinh',
      'hoat-hinh': 'hoat-hinh',
      'tvshows': 'tv-shows',
      'tv-shows': 'tv-shows'
    };
    const apiType = typeMapping[typeSlug] || typeSlug;

    try {
      const url = formatUrl(`/v1/api/danh-sach/${apiType}?page=${page}&limit=${limit}`);
      const res = await apiClient.get(url);
      const data = res.data?.data || res.data;
      return {
        title: data?.titlePage || 'Danh sách phim',
        items: data?.items || [],
        pagination: data?.params?.pagination || {
          totalItems: (data?.items || []).length,
          totalItemsPerPage: limit,
          currentPage: page,
          totalPages: data?.params?.pagination?.totalPages || 1
        }
      };
    } catch (err) {
      console.error(`[API] getMoviesByType (${typeSlug}) error:`, err);
      return { title: 'Danh sách phim', items: [], pagination: { currentPage: page, totalPages: 1 } };
    }
  },

  /**
   * Search movies by keyword with pagination
   */
  async searchMovies(keyword, page = 1, limit = 24) {
    if (!keyword || !keyword.trim()) {
      return { items: [], pagination: { currentPage: 1, totalPages: 0 } };
    }
    try {
      const url = formatUrl(`/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword.trim())}&page=${page}&limit=${limit}`);
      const res = await apiClient.get(url);
      const data = res.data?.data || res.data;
      return {
        title: data?.titlePage || `Kết quả tìm kiếm cho "${keyword}"`,
        items: data?.items || [],
        pagination: data?.params?.pagination || {
          totalItems: (data?.items || []).length,
          totalItemsPerPage: limit,
          currentPage: page,
          totalPages: data?.params?.pagination?.totalPages || 1
        }
      };
    } catch (err) {
      console.error(`[API] searchMovies (${keyword}) error:`, err);
      return { title: `Kết quả tìm kiếm`, items: [], pagination: { currentPage: page, totalPages: 0 } };
    }
  },

  /**
   * Get full movie detail by slug
   */
  async getMovieDetail(slug) {
    try {
      const url = formatUrl(`/phim/${slug}`);
      const res = await apiClient.get(url);
      const data = res.data;
      if (data && data.status) {
        return {
          movie: data.movie,
          episodes: data.episodes || []
        };
      }
      return null;
    } catch (err) {
      console.error(`[API] getMovieDetail (${slug}) error:`, err);
      return null;
    }
  }
};
