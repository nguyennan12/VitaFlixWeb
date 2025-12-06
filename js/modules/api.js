import { Movie, MovieDetail } from "./model.js";

// 1. BASE URL CHO JSON CỤC BỘ
const LOCAL_DATA_URL = '../../data/movie.json';

// 2. BASE URL CHO API QUỐC GIA
const COUNTRY_API_BASE = 'https://phimapi.com/v1/api/quoc-gia';

// Số trang tối đa cần quét để lấy phim mới
const MAX_PAGES_TO_FETCH = 5; 

// Danh sách các quốc gia muốn tự động cập nhật
const COUNTRIES_TO_FETCH = [
    'han-quoc',
    'trung-quoc',
    'au-my',
    'viet-nam',
    'nhat-ban'
];

// --- HÀM 1: Load phim từ JSON cục bộ (giữ nguyên) ---
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

// --- HÀM 2: Lấy chi tiết phim (giữ nguyên) ---
const DETAIL_BASE_URL = 'https://phimapi.com/phim/';
export const fetchMovieDetail = (slug) => {
    return axios.get(`${DETAIL_BASE_URL}${slug}`)
        .then(response => {
            return response.data; 
        })
        .catch(error => {
            console.error(`Lỗi tải chi tiết ${slug}:`, error);
            return null;
        });
};

// --- HÀM 3: Fetch phim theo từng quốc gia (Cập nhật limit) ---
const fetchMoviesByCountry = (countrySlug, page = 1) => {
    // Thêm limit=24 để lấy được 24 phim/trang
    return axios.get(`${COUNTRY_API_BASE}/${countrySlug}?limit=24&page=${page}`) 
        .then(response => {
            const responseData = response.data;
            if (responseData && responseData.data && Array.isArray(responseData.data.items)) {
                
                return responseData.data.items.map(item => {
                    const movie = new Movie(item);
                    // QUAN TRỌNG: Tự động gán country_slug
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



// --- HÀM 4: Cập nhật phim mới (LOGIC QUÉT 10 TRANG MỚI) ---
export const updateNewMovies = async () => {
    console.log(`Đang quét ${MAX_PAGES_TO_FETCH} trang phim mới cho ${COUNTRIES_TO_FETCH.length} quốc gia...`);

    // Tạo mảng lớn chứa tất cả promises (5 quốc gia * 10 trang = 50 promises)
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

// --- HÀM 5: Polling định kỳ (giữ nguyên) ---
export const startNewMoviesPolling = (intervalMs = 30 * 60 * 1000) => {
    const intervalId = setInterval(updateNewMovies, intervalMs);
    return intervalId;
};

// --- BIẾN TOÀN CỤC: Danh sách phim đầy đủ (giữ nguyên) ---
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

// Hàm 6: API TÌM KIẾM PHIM
const SEARCH_API_BASE = 'https://phimapi.com/v1/api/tim-kiem';

export const searchMovies = (keyword, limit = 20) => {
    return axios.get(`${SEARCH_API_BASE}?keyword=${encodeURIComponent(keyword)}&limit=${limit}`)
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