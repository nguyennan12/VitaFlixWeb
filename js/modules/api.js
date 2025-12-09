import { Movie, MovieDetail } from "./model.js";


const IS_PRODUCTION = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1';


function getProxyUrl(apiUrl) {
  if (IS_PRODUCTION) {
    return `/api/proxy?url=${encodeURIComponent(apiUrl)}`;
  } else {
    return apiUrl;
  }
}

// BASE URL JSON Cục Bộ
const LOCAL_DATA_URL = '/data/movie.json';

// BASE URL API QUỐC GIA
const COUNTRY_API_BASE = 'https://phimapi.com/v1/api/quoc-gia';

// BASE URL API danh sách phim mới
const NEW_MOVIES_BASE_URL = 'https://phimapi.com/danh-sach/phim-moi-cap-nhat';

// Số trang tối đa cần quét để lấy phim mới
const MAX_PAGES_TO_FETCH = 5; 

// Các quốc gia fetch api
const COUNTRIES_TO_FETCH = [
    'han-quoc',
    'trung-quoc',
    'au-my',
    'viet-nam',
    'nhat-ban'
];

// Fetch từ file json
export const loadMoviesFetch = () => {
    return axios({
        url: LOCAL_DATA_URL,
        method: "GET",
    })
    .then((res) => {
        if (res.data && Array.isArray(res.data.movies)) {
            return res.data.movies; 
        } else {
            return [];
        }
    })
    .catch((err) => {
        console.error("Lỗi khi tải danh sách phim cục bộ:", err);
        return []; 
    });
};

// fetch từ link chi tiết
const DETAIL_BASE_URL = 'https://phimapi.com/phim/';
export const fetchMovieDetail = (slug) => {
    const apiUrl = `${DETAIL_BASE_URL}${slug}`;
    const url = getProxyUrl(apiUrl);
    
    return axios.get(url)
        .then(response => {
            return response.data; 
        })
        .catch(error => {
            console.error(`Lỗi tải chi tiết ${slug}:`, error);
            return null;
        });
};

export const fetchNewMovies = (page = 1) => {
    const apiUrl = `${NEW_MOVIES_BASE_URL}?page=${page}`;
    const url = getProxyUrl(apiUrl);
    
    return axios.get(url)
        .then(response => {
            if (response.data && Array.isArray(response.data.items)) {
                return response.data.items;
            }
            return [];
        })
        .catch(error => {
            console.error(`Lỗi khi tải phim mới (Trang ${page}):`, error);
            return [];
        });
};

// Fetch phim theo từng quốc gia
const fetchMoviesByCountry = (countrySlug, page = 1) => {
    const apiUrl = `${COUNTRY_API_BASE}/${countrySlug}?limit=24&page=${page}`;
    const url = getProxyUrl(apiUrl);
    
    return axios.get(url) 
        .then(response => {
            const responseData = response.data;
            if (responseData && responseData.data && Array.isArray(responseData.data.items)) {
                return responseData.data.items.map(item => {
                    const movie = new Movie(item);
                    movie.country_slug = countrySlug; 
                    return movie;
                });
            }
            return [];
        })
        .catch(error => {
            console.error(`Lỗi khi tải phim ${countrySlug} trang ${page}:`, error);
            return [];
        });
};

// Cập nhật phim mới 
export const updateNewMovies = async () => {
    console.log(`Đang quét ${MAX_PAGES_TO_FETCH} trang phim mới cho ${COUNTRIES_TO_FETCH.length} quốc gia...`);

    // Tạo mảng lớn chứa tất cả promises (5 quốc gia * 5 trang = 25 promises)
    const allPromises = [];

    COUNTRIES_TO_FETCH.forEach(slug => {
        for (let page = 1; page <= MAX_PAGES_TO_FETCH; page++) {
            // Thêm promise cho từng trang của từng quốc gia
            allPromises.push(fetchMoviesByCountry(slug, page));
        }
    });
    
    // Chờ tất cả API trả về
    const results = await Promise.all(allPromises);
    
    // Gộp tất cả phim từ các kết quả (flat: làm phẳng mảng lồng nhau)
    const allNewMovies = results.flat(); 

    if (allNewMovies.length > 0) {
        // Lọc trùng lặp so với danh sách hiện có (fullMovieList)
        const existingSlugs = new Set(fullMovieList.map(m => m.slug));
        const uniqueNewMovies = [];
        const processedNewSlugs = new Set();

        allNewMovies.forEach(newMovie => {
            // Chỉ lấy phim chưa có trong fullList VÀ chưa được xử lý trong mảng mới
            if (!existingSlugs.has(newMovie.slug) && !processedNewSlugs.has(newMovie.slug)) {
                uniqueNewMovies.push(newMovie);
                processedNewSlugs.add(newMovie.slug);
            }
        });

        if (uniqueNewMovies.length > 0) {
            // Thêm phim mới vào ĐẦU danh sách
            fullMovieList = [...uniqueNewMovies, ...fullMovieList];
            console.log(`Đã cập nhật thêm ${uniqueNewMovies.length} phim mới từ ${MAX_PAGES_TO_FETCH} trang.`);
            
            // Lưu cache
            try {
                localStorage.setItem('cachedFullMovieList', JSON.stringify(fullMovieList)); 
            } catch (e) {
                console.error("Lỗi lưu cache:", e);
            }
        } else {
            console.log("Không có phim mới nào khác so với dữ liệu hiện tại.");
        }
    }
};

// Polling định kỳ
export const startNewMoviesPolling = (intervalMs = 30 * 60 * 1000) => {
    const intervalId = setInterval(updateNewMovies, intervalMs);
    return intervalId;
};

// BIẾN TOÀN CỤC: Danh sách phim đầy đủ
export let fullMovieList = [];

// Khởi tạo
export const moviePromise = loadMoviesFetch().then(async (movies) => {
    const cached = localStorage.getItem('cachedFullMovieList');
    let loadedFromCache = false;

    // 1. Ưu tiên tải từ Cache
    if (cached) {
        try {
            const parsedCache = JSON.parse(cached);
            if (Array.isArray(parsedCache) && parsedCache.length > 0) {
                fullMovieList = parsedCache.map(movie => new Movie(movie));
                loadedFromCache = true;
                console.log(`Đã load ${fullMovieList.length} phim từ Cache.`);
            }
        } catch (e) {
            localStorage.removeItem('cachedFullMovieList');
        }
    }
    
    // 2. Nếu Cache lỗi hoặc trống, dùng dữ liệu từ JSON file
    if (!loadedFromCache && Array.isArray(movies) && movies.length > 0) {
        fullMovieList = movies.map(movie => new Movie(movie));
    } 
    
    return fullMovieList;
});

// API TÌMKIẾM PHIM
const SEARCH_API_BASE = 'https://phimapi.com/v1/api/tim-kiem';

export const searchMovies = (keyword, limit = 20) => {
    const apiUrl = `${SEARCH_API_BASE}?keyword=${encodeURIComponent(keyword)}&limit=${limit}`;
    const url = getProxyUrl(apiUrl);
    
    return axios.get(url)
        .then(response => {
            const responseData = response.data;
            if (responseData && responseData.data && Array.isArray(responseData.data.items)) {
                return responseData.data.items.map(item => new Movie(item));
            }
            return [];
        })
        .catch(error => {
            console.error('Lỗi khi tìm kiếm phim:', error);
            return [];
        });
};