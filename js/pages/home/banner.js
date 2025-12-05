import { randomIDMb } from "./utils-content.js";
import { catagorMovie, movieListPromise } from "../../modules/categorize.js";

window.catagorMovie = catagorMovie;
window.movieListPromise = movieListPromise;

document.addEventListener("DOMContentLoaded", function () {
  console.log("🎬 Banner.js loaded - Static Multi-Item Carousel");
  
  movieListPromise
    .then(() => {

      if (!catagorMovie.favMovie || catagorMovie.favMovie.length === 0) {

        useFallbackMovies();
      } else {
  

        // Kiểm tra và filter các movie có đủ data
        const validFavMovies = catagorMovie.favMovie.filter((movie) => {
          const isValid = movie && movie.name && movie.poster_url;
          if (!isValid) {
 
          }
          return isValid;
        });

        if (validFavMovies.length > 0) {
          renderCarousel(validFavMovies);
          changeBanner(validFavMovies[0]);
          attachCarouselEvents();
        } else {

          useFallbackMovies();
        }
      }
    })
    .catch((error) => {

      showBannerError();
    });
});

// Function để sử dụng fallback movies
function useFallbackMovies() {

  
  if (catagorMovie.korea?.series && catagorMovie.korea.series.length > 0) {
    const fallbackMovies = catagorMovie.korea.series.slice(0, 5);

    renderCarousel(fallbackMovies);
    changeBanner(fallbackMovies[0]);
    attachCarouselEvents();
  } else if (catagorMovie.full && catagorMovie.full.length > 0) {
    const fallbackMovies = catagorMovie.full.slice(0, 5);

    renderCarousel(fallbackMovies);
    changeBanner(fallbackMovies[0]);
    attachCarouselEvents();
  } 
}


function attachCarouselEvents() {
  
  const carouselItems = document.querySelectorAll(".js-carousel-item");
  
  carouselItems.forEach((item, index) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      
      try {
        const movie = JSON.parse(decodeURIComponent(item.dataset.movie));
        // Xóa active class từ tất cả items
        carouselItems.forEach(el => el.classList.remove("active"));
        // Thêm active vào item được click
        item.classList.add("active");
        
        changeBanner(movie);
      } catch (error) {
        console.error("Error:", error);
      }
    });
  });
  
}

function renderCarousel(movies) {
  let html = '';
  const movieList = movies;
  movieList.forEach((movie) => {
    // Thẻ <a> là chuẩn hơn cho Materialize carousel
    html += `
      <a class="carousel-item js-carousel-item" href="#!"
      data-movie="${encodeURIComponent(JSON.stringify(movie))}">
        <img src="https://phimimg.com/${movie.poster_url}" alt="${movie.name}">
      </a>  
    `;
  });
  
  const carouselElement = document.querySelector('.js-carousel');
  if (carouselElement) {
    carouselElement.innerHTML = html;
    
    if (typeof M !== 'undefined' && carouselElement.children.length > 0) {
      // Hủy instance cũ nếu có
      if (carouselElement.M_Carousel) {
          carouselElement.M_Carousel.destroy();
      }
      
      const instance = M.Carousel.init(carouselElement, {
          duration: 0,     
          dist: -300,          
          padding: 20,        
          numVisible: 5,      
          indicators: false,
          
          onCycleTo: function(ele) {
              if (ele) {
                  try {
                      const movieData = JSON.parse(decodeURIComponent(ele.dataset.movie));
                      changeBanner(movieData);
                  } catch (error) {
                      console.error("Error data:", error);
                  }
              }
          }
      });
      
    } else {
      console.warn('Materialize JS library not loaded or no items to initialize.');
    }
  }
}

function renderContent(movies) {
  console.log("📝 Rendering content for:", movies.name);
  
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
    const imageUrlSegment = movie.thumb_url || movie.poster_url;

    if (imageUrlSegment) {
      const imageUrl = `https://phimimg.com/${imageUrlSegment}`;

      const img = new Image();
      img.onload = () => {
        banner.style.background = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("${imageUrl}")`;
        banner.style.backgroundSize = "cover";
        banner.style.backgroundPosition = "center";
        banner.style.backgroundRepeat = "no-repeat";
        console.log("✅ Banner updated");
      };
      img.onerror = () => {
        banner.style.background =
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
      };
      img.src = imageUrl;
    }
  } else {
    console.error("Banner element not found");
  }

  renderContent(movie);
  renderGenre(movie);
}