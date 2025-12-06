import {
  catagorMovie
} from "../../modules/categorize.js";
import { randomIDMb } from "../home/utils-content.js";

// --- 1. CẤU HÌNH "TỪ ĐIỂN" (MAPPING) ---
// Dùng để dịch từ URL (slug) sang Key trong data và Tên hiển thị
// Cấu trúc: 'slug-tren-url': { key: 'key_trong_catagorMovie', name: 'Tên Hiển Thị', [filterKeyword: 'từ khóa lọc thêm'] }
const dictionary = {
  // QUỐC GIA (Key phải khớp với catagorMovie trong categorize.js)
  'han-quoc':   { key: 'korea', name: 'Phim Hàn Quốc' },
  'trung-quoc': { key: 'china', name: 'Phim Trung Quốc' },
  'thai-lan':   { key: 'thai',  name: 'Phim Thái Lan' },
  'my':         { key: 'auMy',  name: 'Phim Mỹ - Âu' }, // Mapped tới key 'auMy'
  'au-my':      { key: 'auMy',  name: 'Phim Mỹ - Âu' },
  'nhat-ban':   { key: 'japan', name: 'Phim Nhật Bản' }, // Mapped tới key 'japan'
  'viet-nam':   { key: 'vietNam', name: 'Phim Việt Nam' }, // Mapped tới key 'vietNam'
  'an-do':      { key: 'other', name: 'Phim Ấn Độ', filterKeyword: 'ấn độ' }, 
  'khac':       { key: 'other', name: 'Quốc Gia Khác' }, 
  
  // THỂ LOẠI (Key là null/undefined, dùng name để filter)
  'hanh-dong':           { name: 'Hành Động' },
  'kinh-di':             { name: 'Kinh Dị' },
  'hai-huoc':            { name: 'Hài Hước' },
  'tinh-cam':            { name: 'Tình Cảm' },
  'khoa-hoc-vien-tuong': { name: 'Khoa Học' }, 
  'phieu-luu':           { name: 'Phiêu Lưu' },
  'than-thoai':          { name: 'Thần Thoại' },
  'tai-lieu':            { name: 'Tài Liệu' },
};

// --- 2. CÁC HÀM XỬ LÝ DỮ LIỆU ---

// Gộp tất cả phim lại (dùng cho Thể loại)
function getAllMovies() {
  const sources = Object.keys(catagorMovie).filter(key => ['korea', 'china', 'japan', 'vietNam', 'auMy', 'other'].includes(key));
  return sources.reduce((acc, source) => {
    if (catagorMovie[source]) {
      // Gộp series, single và anime (nếu có)
      return acc.concat(
        catagorMovie[source].series || [], 
        catagorMovie[source].single || [], 
        catagorMovie[source].anime || []
      );
    }
    return acc;
  }, []);
}

// Kiểm tra xem phim có khớp với từ khóa (dùng cho Thể loại)
function isMovieMatch(movie, searchKeyword) {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();

    // Lọc theo trường category (chuyển sang chuỗi JSON để tìm kiếm sâu)
    if (movie.category) {
        const catStr = JSON.stringify(movie.category || []).toLowerCase();
        if (catStr.includes(keyword)) return true;
    }
    
    return false;
}

// Hàm render giao diện (Giữ nguyên logic HTML)
function renderListMovie(movies, categoryTitle) {
  const titleElement = document.querySelector(".title-list.more h2");
  const listElement = document.querySelector(".js-movie-list-korea"); 

  if (titleElement) titleElement.textContent = categoryTitle || "Danh sách phim";
  if (!listElement) return;

  if (!movies || movies.length === 0) {
    movies = catagorMovie.full;
    movies.sort(() => Math.random() - 0.5);
  }

  let listHTML = "";
  const movieLimited = movies.slice(0, 42); 
  movieLimited.forEach((movie) => {
    const posterUrl = movie.poster_url.startsWith('http') ? movie.poster_url : `https://phimimg.com/${movie.poster_url}`;
    const thumbUrl = movie.thumb_url.startsWith('http') ? movie.thumb_url : `https://phimimg.com/${movie.thumb_url}`;

    listHTML += `
      <div class="movie-box test">
        <div class="preview-box">
          <div class="thumb-preview-box">
            <img src="${thumbUrl}" loading="lazy">
            <div class="poster-preview-box">
              <img src="${posterUrl}" loading="lazy">
            </div>
          </div>
          <div class="content-preview-box">
            <div class="util-preview-1"><p>${movie.name}</p></div>
            <div class="util-preview-2"><p>${movie.origin_name || ''}</p></div>
            <div class="util-preview-3">${movie.quality || 'HD'}</div>
            <div class="util-preview-4">${movie.year || '2024'}</div>
            <div class="util-preview-5">IMDb ${randomIDMb()}</div>
            <dov class="util-preview-6"><i class="fa-solid fa-heart" aria-hidden="true"></i></dov>
            <div class="util-preview-7">
              <a href="movie-info.html?slug=${movie.slug}"><i class="fa-solid fa-play play" aria-hidden="true"></i>Xem ngay</a>
            </div>
            <div class="util-preview-8">
              <a href="movie-info.html?slug=${movie.slug}">Thông tin phim<i class="fa-solid fa-angle-right"></i></a>
            </div>
          </div>
        </div>
        <a href="movie-info.html?slug=${movie.slug}">
          <img src="${posterUrl}" alt="${movie.name}" class="poster movie" loading="lazy">
        </a>
        <div class="content-name-movie">
          <p>${movie.name}</p>
          <p>${movie.origin_name || ''}</p>
        </div>
      </div>
    `;
  });

  listElement.innerHTML = listHTML;
}

// --- 3. LOGIC CHÍNH: PHÂN LOẠI DYNAMIC ---
function handleRender() {
  // Kiểm tra dữ liệu
  if (!catagorMovie || !catagorMovie.korea) return;

  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type");
  const slug = urlParams.get("country") || urlParams.get("genre");

  let resultMovies = [];
  let displayTitle = "";

  // 1. XỬ LÝ THEO TYPE CHUNG (Phim Bộ / Phim Lẻ)
  if (type === 'series' || type === 'single') {
    // Duyệt qua tất cả các key quốc gia đã được phân loại trong categorize.js
    const countryKeys = ['korea', 'china', 'japan', 'vietNam', 'auMy'];
    
    countryKeys.forEach(key => {
      // Truy cập động: catagorMovie['korea']['series']
      if (catagorMovie[key] && catagorMovie[key][type]) {
        resultMovies.push(...catagorMovie[key][type]);
      }
    });

    // Thêm các phim hoạt hình (anime) vào list phim bộ nếu có
    if (type === 'series' && catagorMovie.japan?.anime) {
      resultMovies.push(...catagorMovie.japan.anime);
    }
    
    displayTitle = type === 'series' ? "Phim Bộ Mới Cập Nhật" : "Phim Lẻ Mới Cập Nhật";
  } 
  
  // 2. XỬ LÝ DYNAMIC: QUỐC GIA HOẶC THỂ LOẠI
  else if (slug && dictionary[slug]) {
    const config = dictionary[slug]; 
    displayTitle = config.name;

    if (type === 'country') {
      // ==> LOGIC QUỐC GIA: Truy cập trực tiếp catagorMovie[key]
      const dataKey = config.key; 
      
      if (catagorMovie[dataKey]) {
        // Gộp series, single và anime (nếu có)
        resultMovies = [
          ...(catagorMovie[dataKey].series || []),
          ...(catagorMovie[dataKey].single || []),
          ...(catagorMovie[dataKey].anime || [])
        ];

        // Lọc thêm theo từ khóa (Chủ yếu cho các nước chưa phân loại riêng, vd: Ấn Độ)
        if (config.filterKeyword) {
          resultMovies = resultMovies.filter(m => 
            (m.origin_name && m.origin_name.toLowerCase().includes(config.filterKeyword)) ||
            (m.country_slug === slug) 
          );
        }
      }
    } 
    else if (type === 'genre') {
      // ==> LOGIC THỂ LOẠI: Quét tất cả và lọc
      const keyword = config.name.toLowerCase(); 
      const allMovies = getAllMovies();
      
      resultMovies = allMovies.filter(movie => isMovieMatch(movie, keyword));
      displayTitle = `Thể Loại: ${config.name}`;
    }
  } 
  
  // 3. MẶC ĐỊNH
  else {
    resultMovies = catagorMovie.korea?.series || [];
    displayTitle = "Hàn Xẻng Nay Có Gì Hot ?";
  }

  

  // Random phim
  if (resultMovies.length > 0) {
    resultMovies.sort(() => Math.random() - 0.5);
  }
  
  

  renderListMovie(resultMovies, displayTitle);
}


// --- 4. KHỞI TẠO & SỰ KIỆN ---
window.addEventListener("moviesUpdated", handleRender);

document.addEventListener("DOMContentLoaded", () => {
  // Đợi một chút để module categorize.js load xong data lần đầu
  setTimeout(handleRender, 300);
});