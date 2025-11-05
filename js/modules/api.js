import {Movie, MovieDetail} from "./model.js";
const BASE_URL = './data/movie.json';

export const loadMoviesFetch = () => {
    return axios({
        url: BASE_URL,
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
        console.error("Lỗi khi tải danh sách phim:", err);
        return []; 
    });
};

const DETAIL_BASE_URL = 'https://phimapi.com/phim/';

export const fetchMovieDetail = (slug) => {
    return axios.get(`${DETAIL_BASE_URL}${slug}`)
        .then(response => {
            // Trả về toàn bộ object preview API bạn đã thấy
            return response.data; 
        })
        .catch(error => {
            console.error(`Lỗi khi tải chi tiết phim ${slug}:`, error);
            return null;
        });
};

const NEW_MOVIES_BASE_URL = 'https://phimapi.com/danh-sach/phim-moi-cap-nhat';

export const fetchNewMovies = (page = 1) => {
    return axios.get(`${NEW_MOVIES_BASE_URL}?page=${page}`)
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

export const updateNewMovies = async () => {

    const newMoviesRaw = await fetchNewMovies(1); //page 1
    
    if (newMoviesRaw.length > 0) {
        const newMoviesMapped = newMoviesRaw.map(movie => new Movie(movie));

        // check trùng
        const existingSlugs = new Set(fullMovieList.map(m => m.slug));
        
        const uniqueNewMovies = [];
        newMoviesMapped.forEach(newMovie => {
            if (!existingSlugs.has(newMovie.slug)) {
                uniqueNewMovies.push(newMovie);
            }
        });

        if (uniqueNewMovies.length > 0) {
            fullMovieList = [...uniqueNewMovies, ...fullMovieList];
            console.log(`Đã thêm ${uniqueNewMovies.length} phim mới.`);
        } else {
            console.log("Không có phim mới.");
        }
        try {
            // Lưu toàn bộ phim vào localStorage
            localStorage.setItem('cachedFullMovieList', JSON.stringify(fullMovieList)); 
            
        } catch (e) {
            console.error("Không thể lưu fullMovieList vào localStorage:", e);
        }
    }
};

export const startNewMoviesPolling = (intervalMs = 30 * 60 * 1000) => {
    
    const intervalId = setInterval(updateNewMovies, intervalMs);
    return intervalId;
};


//load full movie vào mảng
export let fullMovieList = [];
export const moviePromise = loadMoviesFetch().then(async (movies) => {
    const cached = localStorage.getItem('cachedFullMovieList');
    let loadedFromCache = false;

    // tải từ CACHE 
    if (cached) {
        try {
            const parsedCache = JSON.parse(cached);
            if (Array.isArray(parsedCache) && parsedCache.length > 0) {
               
                fullMovieList = parsedCache.map(movie => new Movie(movie));
                loadedFromCache = true;
                console.log(`Đã load ${fullMovieList.length} phim từ Cache.`);
                return fullMovieList; 
            }
        } catch (e) {
            localStorage.removeItem('cachedFullMovieList');
        }
    }
    
    if (Array.isArray(movies) && movies.length > 0) {
        fullMovieList = movies.map(movie => new Movie(movie));

    } 

    // Nếu không có cache, tải từ API và lưu vào cache
    if (!loadedFromCache) {
        await updateNewMovies(); 

    }
    
    return fullMovieList;
});
