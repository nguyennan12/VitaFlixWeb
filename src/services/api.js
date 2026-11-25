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

// ---------------------------------------------------------------------------
// In-Memory Cache & Request Deduplication
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const responseCache = new Map();
const inflightRequests = new Map();

function getCached(key) {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data, ttlMs = CACHE_TTL_MS) {
  responseCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs
  });
}

async function cachedGet(endpoint, { ttlMs = CACHE_TTL_MS, skipCache = false } = {}) {
  const cacheKey = endpoint;

  if (!skipCache) {
    const cached = getCached(cacheKey);
    if (cached) return cached;

    if (inflightRequests.has(cacheKey)) {
      return inflightRequests.get(cacheKey);
    }
  }

  const requestPromise = apiClient
    .get(formatUrl(endpoint))
    .then((res) => {
      if (!skipCache) {
        setCache(cacheKey, res.data, ttlMs);
      }
      return res.data;
    })
    .finally(() => {
      inflightRequests.delete(cacheKey);
    });

  if (!skipCache) {
    inflightRequests.set(cacheKey, requestPromise);
  }

  return requestPromise;
}

// ---------------------------------------------------------------------------
// Query String & Response Normalizers (KKPhim API v1)
// ---------------------------------------------------------------------------
const LIST_TYPE_MAPPING = {
  series: 'phim-bo',
  'phim-bo': 'phim-bo',
  single: 'phim-le',
  'phim-le': 'phim-le',
  hoathinh: 'hoat-hinh',
  'hoat-hinh': 'hoat-hinh',
  tvshows: 'tv-shows',
  'tv-shows': 'tv-shows',
  'long-tieng': 'phim-long-tieng',
  'phim-long-tieng': 'phim-long-tieng',
  'thuyet-minh': 'phim-thuyet-minh',
  'phim-thuyet-minh': 'phim-thuyet-minh',
  vietsub: 'phim-vietsub',
  'phim-vietsub': 'phim-vietsub',
  'chieu-rap': 'phim-chieu-rap',
  'phim-chieu-rap': 'phim-chieu-rap'
};

export function buildFilterQuery(filters = {}) {
  const params = new URLSearchParams();
  const {
    page = 1,
    limit = 24,
    category,
    country,
    year,
    sort_field,
    sort_type,
    sort_lang,
    keyword
  } = filters;

  if (keyword && keyword.trim()) params.set('keyword', keyword.trim());
  if (page) params.set('page', String(page));
  if (limit) params.set('limit', String(Math.min(Math.max(1, Number(limit) || 24), 64)));
  if (category) params.set('category', category);
  if (country) params.set('country', country);
  if (year) params.set('year', String(year));
  if (sort_field) params.set('sort_field', sort_field);
  if (sort_type) params.set('sort_type', sort_type);
  if (sort_lang) params.set('sort_lang', sort_lang);

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function normalizeListResponse(raw, filters = {}, fallbackTitle = 'Danh sách phim') {
  const data = raw?.data || raw || {};
  const items = data?.items || [];
  const rawPagination = data?.params?.pagination || data?.pagination || {};
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 24;
  const totalItems = rawPagination.totalItems ?? items.length;
  const totalItemsPerPage = rawPagination.totalItemsPerPage ?? limit;
  const totalPages =
    rawPagination.totalPages ??
    (totalItemsPerPage > 0 ? Math.max(1, Math.ceil(totalItems / totalItemsPerPage)) : 1);

  return {
    title: data?.titlePage || fallbackTitle,
    items,
    params: data?.params || {},
    pagination: {
      totalItems,
      totalItemsPerPage,
      currentPage: rawPagination.currentPage ?? page,
      totalPages
    }
  };
}

async function fetchListEndpoint(basePath, filters = {}, options = {}) {
  const { fallbackTitle = 'Danh sách phim', signal } = options;
  try {
    const endpoint = `${basePath}${buildFilterQuery(filters)}`;
    const raw = await cachedGet(endpoint, { signal });
    return normalizeListResponse(raw, filters, fallbackTitle);
  } catch (err) {
    if (axios.isCancel(err) || err.name === 'CanceledError') {
      throw err;
    }
    console.error(`[API] ${basePath} error:`, err);
    return {
      title: fallbackTitle,
      items: [],
      params: {},
      pagination: { currentPage: Number(filters.page) || 1, totalPages: 1, totalItems: 0 }
    };
  }
}

// ---------------------------------------------------------------------------
// Public API Service (KKPhim / PhimAPI)
// ---------------------------------------------------------------------------
export const api = {
  // Home & Newly Updated
  async getHome(signal) {
    return fetchListEndpoint('/v1/api/home', {}, { fallbackTitle: 'Trang chủ', signal });
  },

  async getNewMovies(page = 1, version = 'v3', signal) {
    const suffix = version === 'v1' ? '' : `-${version}`;
    return fetchListEndpoint(
      `/danh-sach/phim-moi-cap-nhat${suffix}`,
      { page },
      { fallbackTitle: 'Phim Mới Cập Nhật', signal }
    );
  },

  // Lists with full filter support (category, country, year, sort_field, sort_type, sort_lang)
  async getMoviesByList(listSlug, filters = {}, signal) {
    const mappedSlug = LIST_TYPE_MAPPING[listSlug] || listSlug;
    return fetchListEndpoint(`/v1/api/danh-sach/${mappedSlug}`, filters, { signal });
  },

  async getMoviesByGenre(genreSlug, filtersOrPage = 1, limit = 24, signal) {
    const filters =
      typeof filtersOrPage === 'object' ? filtersOrPage : { page: filtersOrPage, limit };
    return fetchListEndpoint(`/v1/api/the-loai/${genreSlug}`, filters, { signal });
  },

  async getMoviesByCountry(countrySlug, filtersOrPage = 1, limit = 24, signal) {
    const filters =
      typeof filtersOrPage === 'object' ? filtersOrPage : { page: filtersOrPage, limit };
    return fetchListEndpoint(`/v1/api/quoc-gia/${countrySlug}`, filters, { signal });
  },

  async getMoviesByYear(year, filters = {}, signal) {
    return fetchListEndpoint(`/v1/api/nam/${year}`, filters, {
      fallbackTitle: `Phim Năm ${year}`,
      signal
    });
  },

  async getMoviesByType(typeSlug, filtersOrPage = 1, limit = 24, signal) {
    const filters =
      typeof filtersOrPage === 'object' ? filtersOrPage : { page: filtersOrPage, limit };
    return api.getMoviesByList(typeSlug, filters, signal);
  },

  async searchMovies(keyword, filtersOrPage = 1, limit = 24, signal) {
    if (!keyword || !keyword.trim()) {
      return { title: 'Tìm kiếm', items: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0 } };
    }
    const filters =
      typeof filtersOrPage === 'object'
        ? { ...filtersOrPage, keyword }
        : { keyword, page: filtersOrPage, limit };

    return fetchListEndpoint('/v1/api/tim-kiem', filters, {
      fallbackTitle: `Kết quả tìm kiếm cho "${keyword}"`,
      signal
    });
  },

  // Metadata dictionaries (cached 30 minutes)
  async getGenres() {
    try {
      const data = await cachedGet('/the-loai', { ttlMs: 30 * 60 * 1000 });
      return Array.isArray(data) ? data : data?.items || [];
    } catch (err) {
      console.error('[API] getGenres error:', err);
      return [];
    }
  },

  async getCountries() {
    try {
      const data = await cachedGet('/quoc-gia', { ttlMs: 30 * 60 * 1000 });
      return Array.isArray(data) ? data : data?.items || [];
    } catch (err) {
      console.error('[API] getCountries error:', err);
      return [];
    }
  },

  async getYears() {
    try {
      const data = await cachedGet('/nam-phat-hanh', { ttlMs: 30 * 60 * 1000 });
      return Array.isArray(data) ? data : data?.items || [];
    } catch (err) {
      console.error('[API] getYears error:', err);
      return [];
    }
  },

  // Movie Details & Extras
  async getMovieDetail(slug, signal) {
    if (!slug) return null;
    try {
      const data = await cachedGet(`/phim/${slug}`, { signal });
      if (data && data.status) {
        return {
          movie: data.movie,
          episodes: data.episodes || []
        };
      }
      return null;
    } catch (err) {
      if (axios.isCancel(err) || err.name === 'CanceledError') throw err;
      console.error(`[API] getMovieDetail (${slug}) error:`, err);
      return null;
    }
  },

  async getMovieById(id, signal) {
    if (!id) return null;
    try {
      const data = await cachedGet(`/phim/id/${id}`, { signal });
      if (data && data.status) {
        return {
          movie: data.movie,
          episodes: data.episodes || []
        };
      }
      return null;
    } catch (err) {
      if (axios.isCancel(err) || err.name === 'CanceledError') throw err;
      console.error(`[API] getMovieById (${id}) error:`, err);
      return null;
    }
  },

  async getMovieByTmdb(type, tmdbId, signal) {
    if (!type || !tmdbId) return null;
    try {
      const data = await cachedGet(`/tmdb/${type}/${tmdbId}`, { signal });
      return data || null;
    } catch (err) {
      if (axios.isCancel(err) || err.name === 'CanceledError') throw err;
      console.error(`[API] getMovieByTmdb (${type}/${tmdbId}) error:`, err);
      return null;
    }
  },

  async getMovieByImdb(imdbId, signal) {
    if (!imdbId) return null;
    try {
      const data = await cachedGet(`/imdb/title/${imdbId}`, { signal });
      return data || null;
    } catch (err) {
      if (axios.isCancel(err) || err.name === 'CanceledError') throw err;
      console.error(`[API] getMovieByImdb (${imdbId}) error:`, err);
      return null;
    }
  },

  async getMovieImages(slug) {
    try {
      return await cachedGet(`/v1/api/phim/${slug}/images`);
    } catch {
      return null;
    }
  },

  async getMoviePeoples(slug) {
    try {
      return await cachedGet(`/v1/api/phim/${slug}/peoples`);
    } catch {
      return null;
    }
  },

  async getMovieKeywords(slug) {
    try {
      return await cachedGet(`/v1/api/phim/${slug}/keywords`);
    } catch {
      return null;
    }
  },

  /**
   * Get newly updated live-action movies (Korea, US-UK, China, Single movies) with high TMDB ratings for Hero Banner
   */
  async getTopRatedMovies(limit = 8) {
    try {
      const [korRes, usRes, chnRes, singleRes] = await Promise.all([
        api.getMoviesByCountry('han-quoc', { page: 1, limit: 16 }),
        api.getMoviesByCountry('au-my', { page: 1, limit: 16 }),
        api.getMoviesByCountry('trung-quoc', { page: 1, limit: 16 }),
        api.getMoviesByList('phim-le', { page: 1, limit: 16 })
      ]);

      const isAnimation = (m) =>
        m?.type === 'hoathinh' ||
        (Array.isArray(m?.category) && m.category.some((c) => c.slug === 'hoat-hinh'));

      const sortByRating = (items = []) =>
        items
          .filter((m) => m?.slug && !isAnimation(m))
          .sort((a, b) => {
            const scoreA = Number(a.tmdb?.vote_average) || 0;
            const scoreB = Number(b.tmdb?.vote_average) || 0;
            const countA = Number(a.tmdb?.vote_count) || 0;
            const countB = Number(b.tmdb?.vote_count) || 0;
            const relA = countA >= 10 ? 1 : 0;
            const relB = countB >= 10 ? 1 : 0;
            if (relA !== relB) return relB - relA;
            if (scoreB !== scoreA) return scoreB - scoreA;
            return countB - countA;
          });

      const buckets = [
        sortByRating(korRes.items),
        sortByRating(usRes.items),
        sortByRating(chnRes.items),
        sortByRating(singleRes.items)
      ];

      // Interleave top-rated movies across countries for variety on the banner
      const picked = [];
      const seen = new Set();
      let round = 0;

      while (picked.length < limit && round < 10) {
        let addedInRound = false;
        for (const bucket of buckets) {
          const candidate = bucket[round];
          if (candidate && !seen.has(candidate.slug)) {
            seen.add(candidate.slug);
            picked.push(candidate);
            addedInRound = true;
            if (picked.length >= limit) break;
          }
        }
        if (!addedInRound) break;
        round++;
      }

      return picked;
    } catch (err) {
      console.error('[API] getTopRatedMovies error:', err);
      return [];
    }
  }
};
