import { catagorMovie, generateAndCacheRandomList} from "../../modules/categorize.js";
import { randomFilm } from "./button.js";
import { randomContinute, randomIDMb } from "./utils-content.js";

// 2 đối số là list movie muốn duyệt, và tên list đó
function renderListMovie(movies, titleList) {
  let listHTML = "";
  const movieLimited =
    titleList === ".js-movie-list-random"
      ? movies.slice(0, 12)
      : movies.slice(0, 30);
  movieLimited.forEach((movie) => {
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
              <i class="fa-solid fa-heart js-fav-btn" data-slug="${movie.slug}" aria-hidden="true"></i>
            </div>


            <div class="util-preview-7">
              <a href="page/watch.html?slug=${movie.slug}"><i class="fa-solid fa-play play" aria-hidden="true"></i>Xem ngay</a>
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
      element.innerHTML = "<p>Không có phim yêu thích</p>";
    }
  }
}


// Lưu phim yêu thích
function toggleFavoriteMovie(slug) {
  let favList = JSON.parse(localStorage.getItem("movieFavSlug")) || [];

  // Nếu đang có → xóa
  if (favList.includes(slug)) {
    favList = favList.filter(item => item !== slug);
  } 
  // Nếu chưa có → thêm vào đầu (FILO: Last added shows first)
  else {
    favList.unshift(slug);
  }

  localStorage.setItem("movieFavSlug", JSON.stringify(favList));
  window.dispatchEvent(new CustomEvent("favoritesUpdated"));
}


// Lắng nghe sự kiện click vào icon ❤️
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("js-fav-btn")) {
    const slug = e.target.dataset.slug;
    toggleFavoriteMovie(slug);
  }
});

// Render danh sách yêu thích
function renderFavoriteMovies(movies) {
  const container = document.querySelector(".js-movie-list-favorites");

  if (!movies || movies.length === 0) {
    container.innerHTML = `<p class="no-favorite-text">Chưa có phim yêu thích 😊</p>`;
    return;
  }

  // FILO: dữ liệu từ categorize đã là theo thứ tự slug -> giữ nguyên
  let html = "";
  movies.forEach(movie => {
    html += `
      <div class="movie-favorites-box">
        <a href="movie-info.html?slug=${movie.slug}">
          <img src="https://phimimg.com/${movie.poster_url}">
        </a>
        <p>${movie.name}</p>
      </div>
    `;
  });

  container.innerHTML = html;
}



window.addEventListener("moviesUpdated", (event) => {
  const categories = event.detail;
  console.log("Movies updated event received", categories);
  renderAllLists();

  renderFavoriteMovies(catagorMovie.favMovie);
});

// Khi bấm thêm yêu thích thì render lại 
window.addEventListener("favoritesUpdated", async () => {
  await updateMovieCategories();
  renderFavoriteMovies(catagorMovie.favMovie);
});
