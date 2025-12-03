// js/pages/home/banner.js
import { randomIDMb } from "./utils-content.js";
import { catagorMovie, movieListPromise } from "../../modules/categorize.js";
import { MovieDetail } from "../../modules/model.js";

// Expose to global for debugging
window.catagorMovie = catagorMovie;
window.movieListPromise = movieListPromise;

document.addEventListener("DOMContentLoaded", function () {
  movieListPromise
    .then(() => {
      console.log("🎬 Movies loaded, initializing banner...");

      // Kiểm tra dữ liệu favMovie
      if (!catagorMovie.favMovie || catagorMovie.favMovie.length === 0) {
        console.warn("⚠️ No favMovie data found, using fallback");
        useFallbackMovies();
      } else {
        console.log(
          "✓ Using favMovie data:",
          catagorMovie.favMovie.length,
          "movies"
        );

        // Kiểm tra và filter các movie có đủ data
        const validFavMovies = catagorMovie.favMovie.filter((movie) => {
          const isValid =
            movie &&
            movie.name &&
            movie.category &&
            Array.isArray(movie.category);
          if (!isValid) {
            console.warn("Invalid movie data:", movie?.name || "unnamed movie");
          }
          return isValid;
        });

        if (validFavMovies.length > 0) {
          renderCarousel(validFavMovies);
          changeBanner(validFavMovies[0]);
          renderBanner();
        } else {
          console.warn("⚠️ No valid favMovie data found, using fallback");
          useFallbackMovies();
        }
      }
    })
    .catch((error) => {
      console.error("❌ Error in banner initialization:", error);
      showBannerError();
    });
});

// Function để sử dụng fallback movies
function useFallbackMovies() {
  // Fallback 1: Sử dụng phim từ Korea series
  if (catagorMovie.korea?.series && catagorMovie.korea.series.length > 0) {
    const fallbackMovies = catagorMovie.korea.series
      .slice(0, 5)
      .map((movie) => ({
        ...movie,
        category: movie.category || [
          { name: "Phim hay" },
          { name: "Đáng xem" },
        ],
        content: movie.content || "Đang cập nhật nội dung...",
      }));
    renderCarousel(fallbackMovies);
    changeBanner(fallbackMovies[0]);
    renderBanner();
  }
  // Fallback 2: Sử dụng từ full list
  else if (catagorMovie.full && catagorMovie.full.length > 0) {
    const fallbackMovies = catagorMovie.full.slice(0, 5).map((movie) => ({
      ...movie,
      category: movie.category || [{ name: "Phim hay" }, { name: "Đáng xem" }],
      content: movie.content || "Đang cập nhật nội dung...",
    }));
    console.log(
      "Using full list as fallback:",
      fallbackMovies.length,
      "movies"
    );
    renderCarousel(fallbackMovies);
    changeBanner(fallbackMovies[0]);
    renderBanner();
  } else {
    console.error("No movie data available at all!");
    showBannerError();
    return;
  }
}

// Hiển thị lỗi banner
function showBannerError() {
  const banner = document.querySelector(".js-banner");
  const contentBox = document.querySelector(".js-content-box");

  if (banner) {
    banner.style.background =
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    banner.style.minHeight = "500px";
  }

  if (contentBox) {
    contentBox.innerHTML = `
      <div class="content active js-content">
        <div class="movie-title">
          <h2>VitaFlix</h2>
          <div>Đang tải dữ liệu phim...</div>
        </div>
        <p>Vui lòng chờ trong giây lát...</p>
      </div>
    `;
  }
}

function renderBanner() {
  document.querySelectorAll(".js-carousel-item").forEach((movies) => {
    movies.addEventListener("click", () => {
      const movie = JSON.parse(decodeURIComponent(movies.dataset.movie));
      changeBanner(movie);
    });
  });
}

function renderCarousel(movies) {
  let html = "";
  const movieList = movies;
  movieList.forEach((movie) => {
    html += `
      <div class="carousel-item js-carousel-item"
      data-movie="${encodeURIComponent(JSON.stringify(movie))}">
        <img src="https://phimimg.com/${movie.poster_url}">
      </div>  
    `;
  });

  const carouselElement = document.querySelector(".js-carousel");
  if (carouselElement) {
    carouselElement.innerHTML = html;

    // Khởi tạo carousel với đúng cấu hình
    setTimeout(() => {
      if (typeof $ !== "undefined" && carouselElement.children.length > 0) {
        try {
          // Destroy carousel cũ nếu có
          const $carousel = $(".js-carousel");
          if ($carousel.hasClass("slick-initialized")) {
            $carousel.slick("unslick");
          }

          // Khởi tạo carousel mới
          $carousel.slick({
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 5,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 3000,
            responsive: [
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 3,
                },
              },
              {
                breakpoint: 600,
                settings: {
                  slidesToShow: 2,
                },
              },
            ],
          });

          console.log("Carousel initialized successfully");
        } catch (error) {
          console.error("Carousel initialization failed:", error);
        }
      }
    }, 100);
  }
}

function renderContent(movies) {
  let html = "";
  html += `
      <div class="content active js-content">
        <div class="movie-title">
          <h2>${movies.name || "Tên phim không xác định"}</h2>
          <div>${movies.origin_name || ""}</div>
        </div>
        
        <div class="button-info">
          <div class="IMDb-vote">
            IMDb ${randomIDMb()}
          </div>
          <div class="movie-quality">
            ${movies.quality || "HD"}
          </div>
          <div class="movie-year">${movies.year || "N/A"}</div>
          <div class="movie-duration">Tập ${
            movies.episode_total || movies.episode_current || "N/A"
          }</div>
        </div>
        <div class="button-genre js-button-genre">
            
        </div>
        <p>${movies.content || "Đang cập nhật nội dung..."}</p>
        <div class="button-display">
          <button class="button-play">
              <a href="#"><i class="fa-solid fa-play play" aria-hidden="true"></i></a>
          </button>
          <div class="button-like">
            <a href="#"><i class="fa-solid fa-heart" aria-hidden="true"></i></a>
            <a href="#"><i class="fa-solid fa-circle-info" aria-hidden="true"></i></a>
          </div>
        </div>
      </div>
    `;
  const contentBox = document.querySelector(".js-content-box");
  if (contentBox) {
    contentBox.innerHTML = html;
  }
}

function renderGenre(movies) {
  let html = "";

  // Kiểm tra xem movies.category có tồn tại và là array không
  if (
    movies.category &&
    Array.isArray(movies.category) &&
    movies.category.length > 0
  ) {
    const listGenre = movies.category.slice(0, 4);
    listGenre.forEach((genre) => {
      if (genre && genre.name) {
        html += `<div>${genre.name}</div>`;
      }
    });
  } else {
    // Fallback genres nếu không có category
    html = "<div>Phim hay</div><div>Đáng xem</div>";
  }

  const genreElement = document.querySelector(".js-button-genre");
  if (genreElement) {
    genreElement.innerHTML = html;
  }
}

function changeBanner(movie) {
  if (!movie) {
    console.error("No movie data provided to changeBanner");
    return;
  }

  const banner = document.querySelector(".js-banner");

  if (banner) {
    const imageUrl = `https://phimimg.com/${movie.thumb_url}`;

    banner.style.background = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("${imageUrl}")`;
    banner.style.backgroundSize = "cover";
    banner.style.backgroundPosition = "center";
    banner.style.backgroundRepeat = "no-repeat";
  } else {
    console.error("Banner element not found");
  }

  renderContent(movie);
  renderGenre(movie);
}
