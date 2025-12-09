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
        const validFavMovies = catagorMovie.favMovie.filter((movie) => {
          return movie && movie.name && movie.poster_url;
        });

        if (validFavMovies.length > 0) {
          const limitedMovies = validFavMovies.slice(0, 5);
          renderCarousel(limitedMovies);
          changeBanner(limitedMovies[0]);
          attachCarouselEvents();
        } else {
          useFallbackMovies();
        }
      }
    })
    .catch((error) => {
      console.error("Error loading banner:", error);
      showBannerError();
    });
});

function showBannerError() {
  const banner = document.querySelector(".js-banner");
  if (banner) {
    banner.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  }
  const contentBox = document.querySelector(".js-content-box");
  if (contentBox) {
    contentBox.innerHTML = `
      <div class="text-center text-white p-5">
        <h2>Đang tải dữ liệu...</h2>
        <p>Vui lòng chờ trong giây lát</p>
      </div>
    `;
  }
}

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
  } else {
    showBannerError();
  }
}

function attachCarouselEvents() {
  const carouselItems = document.querySelectorAll(".js-carousel-item");
  
  carouselItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      
      try {
        const movie = JSON.parse(decodeURIComponent(item.dataset.movie));
        carouselItems.forEach(el => el.classList.remove("active"));
        item.classList.add("active");
        changeBanner(movie);
      } catch (error) {
        console.error("Error parsing movie data:", error);
      }
    });
  });
}

function renderCarousel(movies) {
  let html = '';
  
  movies.forEach((movie) => {
    // ✅ FIX: Đảm bảo URL đầy đủ cho poster
    const posterUrl = movie.poster_url.startsWith('http') 
      ? movie.poster_url 
      : `https://phimimg.com/${movie.poster_url}`;
      
    html += `
      <a class="carousel-item js-carousel-item" href="#!"
         data-movie="${encodeURIComponent(JSON.stringify(movie))}">
        <img src="${posterUrl}" alt="${movie.name}" 
             onerror="this.src='assets/images/default-poster.jpg'">
      </a>  
    `;
  });
  
  const carouselElement = document.querySelector('.js-carousel');
  if (carouselElement) {
    carouselElement.innerHTML = html;
    
    if (typeof M !== 'undefined' && carouselElement.children.length > 0) {
      if (carouselElement.M_Carousel) {
        carouselElement.M_Carousel.destroy();
      }
      
      M.Carousel.init(carouselElement, {
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
              console.error("Error loading banner data:", error);
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
  let html = `
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
        <div class="movie-duration">Tập ${movies.episode_total || movies.episode_current || "N/A"}</div>
      </div>
      <div class="button-genre js-button-genre"></div>
      <p>${movies.content || "Đang cập nhật nội dung..."}</p>
      <div class="button-display">
        <button class="button-play">
          <a href="page/watch.html?slug=${movies.slug}">
            <i class="fa-solid fa-play play" aria-hidden="true"></i>
          </a>
        </button>
        <div class="button-like">
          <a href="#"><i class="fa-solid fa-heart" aria-hidden="true"></i></a>
          <a href="movie-info.html?slug=${movies.slug}">
            <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
          </a>
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

  if (movies.category && Array.isArray(movies.category) && movies.category.length > 0) {
    const listGenre = movies.category.slice(0, 4);
    listGenre.forEach((genre) => {
      if (genre && genre.name) {
        html += `<div><a class="genre-link" href="categorize-movie.html?type=genre&genre=${genre.slug}">${genre.name}</a></div>`;
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
    // ✅ FIX: Đảm bảo URL đầy đủ cho background
    let imageUrlSegment = movie.thumb_url || movie.poster_url;
    
    // Kiểm tra xem URL đã có domain chưa
    let imageUrl;
    if (imageUrlSegment.startsWith('http')) {
      imageUrl = imageUrlSegment;
    } else {
      imageUrl = `${imageUrlSegment}`;
    }

    const img = new Image();
    img.onload = () => {
      banner.style.background = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("${imageUrl}")`;
      banner.style.backgroundSize = "cover";
      banner.style.backgroundPosition = "center";
      banner.style.backgroundRepeat = "no-repeat";
      console.log("✅ Banner updated successfully");
    };
    img.onerror = () => {
      console.warn("Banner image failed to load, using gradient fallback");
      banner.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    };
    img.src = imageUrl;
  } else {
    console.error("Banner element not found");
  }

  renderContent(movie);
  renderGenre(movie);
}