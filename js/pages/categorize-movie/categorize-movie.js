import {
  catagorMovie
} from "../../modules/categorize.js";
import { randomIDMb } from "../home/utils-content.js";

const dictionary = {
  // QUỐC GIA 
  'han-quoc':   { key: 'korea', name: 'Phim Hàn Quốc' },
  'trung-quoc': { key: 'china', name: 'Phim Trung Quốc' },
  'thai-lan':   { key: 'thai',  name: 'Phim Thái Lan' },
  'my':         { key: 'auMy',  name: 'Phim Mỹ - Âu' }, 
  'au-my':      { key: 'auMy',  name: 'Phim Mỹ - Âu' },
  'nhat-ban':   { key: 'japan', name: 'Phim Nhật Bản' }, 
  'viet-nam':   { key: 'vietNam', name: 'Phim Việt Nam' }, 
  'an-do':      { key: 'other', name: 'Phim Ấn Độ', filterKeyword: 'ấn độ' }, 
  'khac':       { key: 'other', name: 'Quốc Gia Khác' }, 
  
  // THỂ LOẠI 
  'hanh-dong':           { name: 'Hành Động' },
  'kinh-di':             { name: 'Kinh Dị' },
  'hai-huoc':            { name: 'Hài Hước' },
  'tinh-cam':            { name: 'Tình Cảm' },
  'khoa-hoc-vien-tuong': { name: 'Khoa Học' }, 
  'phieu-luu':           { name: 'Phiêu Lưu' },
  'than-thoai':          { name: 'Thần Thoại' },
  'tai-lieu':            { name: 'Tài Liệu' },
};

function getAllMovies() {
  const sources = Object.keys(catagorMovie).filter(key => ['korea', 'china', 'japan', 'vietNam', 'auMy', 'other'].includes(key));
  return sources.reduce((acc, source) => {
    if (catagorMovie[source]) {
      return acc.concat(
        catagorMovie[source].series || [], 
        catagorMovie[source].single || [], 
        catagorMovie[source].anime || []
      );
    }
    return acc;
  }, []);
}

function isMovieMatch(movie, searchKeyword) {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();

    if (movie.category) {
        const catStr = JSON.stringify(movie.category || []).toLowerCase();
        if (catStr.includes(keyword)) return true;
    }
    
    return false;
}

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

function handleRender() {
  if (!catagorMovie || !catagorMovie.korea) return;

  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type");
  const slug = urlParams.get("country") || urlParams.get("genre");

  let resultMovies = [];
  let displayTitle = "";

  if (type === 'series' || type === 'single') {
    const countryKeys = ['korea', 'china', 'japan', 'vietNam', 'auMy'];
    
    countryKeys.forEach(key => {
      if (catagorMovie[key] && catagorMovie[key][type]) {
        resultMovies.push(...catagorMovie[key][type]);
      }
    });
    if (type === 'series' && catagorMovie.japan?.anime) {
      resultMovies.push(...catagorMovie.japan.anime);
    }
    
    displayTitle = type === 'series' ? "Phim Bộ Mới Cập Nhật" : "Phim Lẻ Mới Cập Nhật";
  } 
  
  else if (slug && dictionary[slug]) {
    const config = dictionary[slug]; 
    displayTitle = config.name;

    if (type === 'country') {
      const dataKey = config.key; 
      
      if (catagorMovie[dataKey]) {
        resultMovies = [
          ...(catagorMovie[dataKey].series || []),
          ...(catagorMovie[dataKey].single || []),
          ...(catagorMovie[dataKey].anime || [])
        ];
        if (config.filterKeyword) {
          resultMovies = resultMovies.filter(m => 
            (m.origin_name && m.origin_name.toLowerCase().includes(config.filterKeyword)) ||
            (m.country_slug === slug) 
          );
        }
      }
    } 
    else if (type === 'genre') {
      const keyword = config.name.toLowerCase(); 
      const allMovies = getAllMovies();
      
      resultMovies = allMovies.filter(movie => isMovieMatch(movie, keyword));
      displayTitle = `Thể Loại: ${config.name}`;
    }
  } 
  
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


window.addEventListener("moviesUpdated", handleRender);

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(handleRender, 300);
});