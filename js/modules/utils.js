import { MovieDetail } from "./model.js";

const DETAIL_BASE_URL = 'https://phimapi.com/phim/';

export const getMovieBySlug = async (slug) => {
    try {
        // Gọi API lấy chi tiết phim
        const response = await axios.get(`${DETAIL_BASE_URL}${slug}`);
        
        if (response.data) {
            
            const movieDetail = new MovieDetail(response.data);
            
            return movieDetail;
        }
        
        return null;
    } catch (error) {
        console.error(`Lỗi khi tải phim với slug "${slug}":`, error);
        return null;
    }
};



// const movie = await getMovieBySlug('nguu-lang-chuc-nu');
// console.log(movie);