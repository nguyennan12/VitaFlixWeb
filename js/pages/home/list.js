import { catagorMovie, generateAndCacheRandomList, updateMovieCategories } from "../../modules/categorize.js";
import { randomFilm } from "./button.js";
import { randomContinute, randomIDMb } from "./utils-content.js";

// Hàm kiểm tra phim có được yêu thích không
function isMovieFavorited(slug) {
  const favList = JSON.parse(localStorage.getItem("movieFavSlug")) || [];
  return favList.includes(slug);
}

// Hàm cập nhật trạng thái icon yêu thích
function updateFavIcon(icon, isFavorited) {
  if (isFavorited) {
    icon.style.color = '#e0245e';
    icon.classList.add('active');
  } else {
    icon.style.color = '';
    icon.classList.remove('active');
  }
}

// 2 đối số là list movie muốn duyệt, và tên list đó
function renderListMovie(movies, titleList) {
  let listHTML = "";
  const movieLimited =
    titleList === ".js-movie-list-random"
      ? movies.slice(0, 12)
      : movies.slice(0, 30);
  movieLimited.forEach((movie) => {
    const isFav = isMovieFavorited(movie.slug);
    const favClass = isFav ? 'active' : '';
    const favStyle = isFav ? 'color: #e0245e;' : '';
    
    listHTML += `
      <div class="movie-box test">
        <div class="preview-box">
          <div class="thumb-preview-box">
            <img src="https://phimimg.com/${movie.thumb_url}">
            <div class="poster-preview-box">
              <img src="https://phimimg.com/${movie.poster_url}">
            </div>
          </div>
          <div class="content-preview-box">
            <div class="util-preview-1"><p>${movie.name}</p></div>
            <div class="util-preview-2"><p>${movie.origin_name}</p></div>
           
            <div class="util-preview-3">${movie.quality}</div>
            <div class="util-preview-4">${movie.year}</div>
            <div class="util-preview-5">IMDb ${randomIDMb()}</div>
            <div class="util-preview-6">
              <i class="fa-solid fa-heart js-fav-btn ${favClass}" data-slug="${movie.slug}" style="${favStyle}" aria-hidden="true"></i>
            </div>

            <div class="util-preview-7">
              <a href="watch.html?slug=${movie.slug}"><i class="fa-solid fa-play play" aria-hidden="true"></i>Xem ngay</a>
            </div>

            <div class="util-preview-8">
              <a href="movie-info.html?slug=${movie.slug}">Thông tin phim<i class="fa-solid fa-angle-right"></i></a>
            </div>
          </div>
        </div>
      
        <a href="movie-info.html?slug=${movie.slug}">
          <img src="https://phimimg.com/${
            movie.poster_url
          }" alt="" class="pposter movie">
        </a>
        <div class="content-name-movie">
          <p>${movie.name}</p>
          <p>${movie.origin_name}</p>
        </div>
      </div>
    `;
  });

  const element = document.querySelector(titleList);
  if (element) {
    element.innerHTML = listHTML;
  }
}

function renderListMovieSingle(movies, titleList) {
  let html = "";
  const movieLimited = movies.slice(0, 16);
  movieLimited.forEach((movie) => {
    html += `
      <div class="movie-single-box">
        <a href="movie-info.html?slug=${movie.slug}">
          <img src="https://phimimg.com/${movie.poster_url}">
        </a>
        <div class="content-name-movie">
          <p>${movie.name}</p>
          <p>${movie.origin_name}</p>
        </div>
      </div>
    `;
  });
  const element = document.querySelector(titleList);
  if (element) {
    element.innerHTML = html;
  }
}

function renderListMovieContinute(movies, titleList) {
  let html = "";

  // Kiểm tra xem có movies hay không
  if (!movies || !Array.isArray(movies) || movies.length === 0) {
    console.warn("No continute movies available");
    const element = document.querySelector(titleList);
    if (element) {
      element.innerHTML = "<p>Chưa có phim đang xem</p>";
    }
    return;
  }

  const movieLimited = movies.slice(0, 6);
  movieLimited.forEach((movie) => {
    html += `
      <div class="movie-continute-box">
        <a href="movie-info.html?slug=${movie.slug}">
          <img src="https://phimimg.com/${movie.poster_url}">
        </a>
        <p>${randomContinute(movie.type, movie.episode_total)}</p>
      </div>
    `;
  });
  const element = document.querySelector(titleList);
  if (element) {
    element.innerHTML = html;
  }
}

// Hàm render tất cả
function renderAllLists() {
  // Kiểm tra dữ liệu trước khi render
  if (!catagorMovie.korea?.series) {
    console.warn("Korea series not available yet");
    return;
  }

  renderListMovie(catagorMovie.korea.series, ".js-movie-list-korea");
  renderListMovie(catagorMovie.china.series, ".js-movie-list-china");
  renderListMovie(catagorMovie.japan.anime, ".js-movie-list-japan");
  randomFilm(catagorMovie.full, renderListMovie, ".js-movie-list-random");
  renderListMovieSingle(
    catagorMovie.korea.single,
    ".js-movie-list-single-korea"
  );
  renderListMovieSingle(catagorMovie.auMy.single, ".js-movie-list-single-auMy");

  // Kiểm tra continute movies trước khi render
  if (catagorMovie.continute && catagorMovie.continute.length > 0) {
    renderListMovieContinute(
      catagorMovie.continute,
      ".js-movie-list-continute"
    );
  } else {
    console.warn("No continute movies found");
    const element = document.querySelector(".js-movie-list-continute");
    if (element) {
      element.innerHTML = "<p>Không có phim đang xem</p>";
    }
  }
}

// Lưu phim yêu thích
async function toggleFavoriteMovie(slug, iconElement) {
  let favList = JSON.parse(localStorage.getItem("movieFavSlug")) || [];

  if (favList.includes(slug)) {
    favList = favList.filter(item => item !== slug);
    updateFavIcon(iconElement, false);
    
    iconElement.style.transform = 'scale(0.8)';
    setTimeout(() => {
      iconElement.style.transform = 'scale(1)';
    }, 200);
  } 
  // Nếu chưa có 
  else {
    favList.unshift(slug);
    updateFavIcon(iconElement, true);
    
    iconElement.style.transform = 'scale(1.3)';
    setTimeout(() => {
      iconElement.style.transform = 'scale(1)';
    }, 200);
  }

  localStorage.setItem("movieFavSlug", JSON.stringify(favList));
  
  localStorage.removeItem("movieFav");

  await updateMovieCategories();

  renderFavoriteMovies(catagorMovie.favMovie);
}


document.addEventListener("click", function (e) {
  if (e.target.classList.contains("js-fav-btn")) {
    e.preventDefault();
    e.stopPropagation();
    const slug = e.target.dataset.slug;
    
    toggleFavoriteMovie(slug, e.target);
  }
});

// Render danh sách yêu thích
function renderFavoriteMovies(movies) {
  const container = document.querySelector(".js-movie-list-favorites");
  
  if (!container) {
    console.warn("Favorite movies container not found");
    return;
  }

  if (!movies || movies.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #999;">
        <i class="fa-regular fa-heart" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
        <p style="margin: 0; font-size: 16px;">Chưa có phim yêu thích</p>
      
      </div>
    `;
    return;
  }

  const movieLimited = movies.slice(0, 5);
  let html = "";
  
  movieLimited.forEach(movie => {
    const posterUrl = movie.poster_url.startsWith('http') 
      ? movie.poster_url 
      : `https://phimimg.com/${movie.poster_url}`;
      
    html += `
      <div class="movie-favorites-box" style="position: relative;">
        <a href="movie-info.html?slug=${movie.slug}">
          <img src="${posterUrl}" alt="${movie.name}">
        </a>
        <div class="content-name-movie">
          <p>${movie.name}</p>
          <p style="font-size: 12px; opacity: 0.7;">${movie.origin_name}</p>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Khi dữ liệu movies được update từ categorize.js
window.addEventListener("moviesUpdated", (event) => {
  const categories = event.detail;
  renderAllLists();

  // Render favorite movies khi load trang
  renderFavoriteMovies(catagorMovie.favMovie);
});


export { renderFavoriteMovies };