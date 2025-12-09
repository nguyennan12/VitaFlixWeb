import { MovieDetail } from "./model.js";
import { fetchMovieDetail, fullMovieList, moviePromise, searchMovies } from "./api.js"; 
import { updateNewMovies, startNewMoviesPolling } from "./api.js";

//Các hằng số
const RANDOM_LIST_CACHE_KEY = 'cachedRandomMovieList'; // Tên lưu trữ list phim random
const RANDOM_MOVIE_COUNT = 10; // Số lượng random

//class lọc phim
class movieFilter {
  //lọc theo quốc gia và loại phim (2 dk)
  static filterByCountry(movies, countrySlug, typeSlug) {
    return movies.filter((movie) => {
      if (movie.country_slug === countrySlug && movie.type === typeSlug) {
        return movie;
      }
    });
  }

  //lọc theo loại phim lẻ, bộ, hoat hình (1 điều kiện)
  static filterByType(movies, typeSlug) {
    return movies.filter((movie) => {
      if (movie.type === typeSlug) {
        return movie;
      }
    });
  }

  

  //Lọc phim yêu thích
  static async filterFavMovie() {
    try {
      const cached = localStorage.getItem("movieFav");
      if (cached) {
        const parsedCache = JSON.parse(cached);
        if (
          parsedCache &&
          Array.isArray(parsedCache) &&
          parsedCache.length > 0
        ) {
          return parsedCache.map((m) => new MovieDetail(m));
        }
      }
      const favMovieSlug = JSON.parse(localStorage.getItem("movieFavSlug")) || [];

      const favPromises = favMovieSlug.map((slug) => fetchMovieDetail(slug));
      const favListDetails = await Promise.all(favPromises);

      const validDetails = favListDetails.filter((detail) => detail !== null);

      if (favListDetails && favListDetails.length > 0) {
  
        const favList = validDetails.map((detail) => new MovieDetail(detail));
        return favList;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error in filterFavMovie:", error);
      localStorage.removeItem("movieFav");
      return [];
    }
  }

  //lọc phim dang xem
  static async filterContinuteMovie() {
    try {
      // lấy phim đã xem đã lưu từ trước trong cache localStorage
      const cached = localStorage.getItem("movieContinute");
      if (cached) {
        const parsedCache = JSON.parse(cached);
        if (
          parsedCache &&
          Array.isArray(parsedCache) &&
          parsedCache.length > 0
        ) {
          // Map lại sang Class MovieDetail
          return parsedCache.map((m) => new MovieDetail(m));
        }
      }

      const continuteMovieSlug = [
        "tinh-yeu-cua-mu-bi",
        "dua-hau-lap-lanh",
        "doona",
        "thanh-xuan-182-lu-trinh-huong-ve-em",
        "suyt-quoc-vuong-dang-ngu-dong",
      ];

      const continutePromises = continuteMovieSlug.map((slug) =>
        fetchMovieDetail(slug)
      );
      const continuteListDetails = await Promise.all(continutePromises);

      const validContinuteDetails = continuteListDetails.filter(
        (detail) => detail !== null
      );

      if (continuteListDetails && continuteListDetails.length > 0) {
        const continuteList = validContinuteDetails.map(
          (detail) => new MovieDetail(detail)
        );
        localStorage.setItem("movieContinute", JSON.stringify(continuteList));
        return continuteList;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error in filterContinuteMovie:", error);
      localStorage.removeItem("movieContinute");
      return [];
    }
  }

  //random phim
  static filterRandomMovies(movies, count) {
    if (!Array.isArray(movies) || movies.length === 0) {
      return [];
    }

    const shuffled = [...movies];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }
}

export const catagorMovie = {
    searchResults: [], 
};
window.catagorMovie = catagorMovie;


function renderHeaderDropdown(movies, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const listElement = container.querySelector(".dropdown-list");
  if (!listElement) return;


  listElement.innerHTML = "";

  let html = "";
  // Chỉ lấy tối đa 5 phim
  const limitedMovies = movies.slice(0, 5);

  limitedMovies.forEach((movie) => {
    const imageUrl = movie.thumb_url
      ? `https://phimimg.com/${movie.thumb_url}`
      : "assets/images/default-poster.jpg";

    html += `
            <a href="/movie-info.html?slug=${movie.slug}" class="dropdown-movie">
                <img src="${imageUrl}" alt="${movie.name}">
                <div class="movie-meta">
                    <span class="movie-name">${movie.name}</span>
                    <span class="movie-year">(${movie.year})</span>
                </div>
            </a>
        `;
  });

  if (limitedMovies.length === 0) {
    listElement.innerHTML =
      '<p class="text-center text-muted m-0 p-2">Không tìm thấy phim.</p>';
  } else {
    listElement.innerHTML = html;
  }
}
export async function updateMovieCategories() {
  try {
    // Phân loại theo quốc gia
    catagorMovie.korea = {
      series: movieFilter.filterByCountry(fullMovieList, "han-quoc", "series"),
      single: movieFilter.filterByCountry(fullMovieList, "han-quoc", "single"),
    };
    catagorMovie.china = {
      series: movieFilter.filterByCountry(
        fullMovieList,
        "trung-quoc",
        "series"
      ),
      single: movieFilter.filterByCountry(
        fullMovieList,
        "trung-quoc",
        "single"
      ),
    };
    catagorMovie.japan = {
      series: movieFilter.filterByCountry(fullMovieList, "nhat-ban", "series"),
      single: movieFilter.filterByCountry(fullMovieList, "nhat-ban", "single"),
      anime: movieFilter.filterByCountry(fullMovieList, "nhat-ban", "hoathinh"),
    };

    catagorMovie.vietNam = {
      series: movieFilter.filterByCountry(fullMovieList, "viet-nam", "series"),
      single: movieFilter.filterByCountry(fullMovieList, "viet-nam", "single"),
    };
    catagorMovie.auMy = {
      series: movieFilter.filterByCountry(fullMovieList, "au-my", "series"),
      single: movieFilter.filterByCountry(fullMovieList, "au-my", "single"),
    };

    // Phân loại khác
    catagorMovie.full = fullMovieList;
    catagorMovie.single = movieFilter.filterByType(fullMovieList, "single");
    
    // Phân loại theo cá nhân (yêu thích, đang xem)
    catagorMovie.favMovie = await movieFilter.filterFavMovie();
    catagorMovie.continute = await movieFilter.filterContinuteMovie();

    // PHÂN LOẠI MỚI CHO HEADER DROPDOWN
    const seriesList = [
      ...(catagorMovie.korea?.series || []),
      ...(catagorMovie.china?.series || []),
      ...(catagorMovie.auMy?.series || []),
    ];
    const singleList = [
      ...(catagorMovie.korea?.single || []),
      ...(catagorMovie.china?.single || []),
      ...(catagorMovie.auMy?.single || []),
    ];

    catagorMovie.headerSeries = movieFilter.filterRandomMovies(seriesList, 5);
    catagorMovie.headerSingle = movieFilter.filterRandomMovies(singleList, 5);

    console.log(catagorMovie.favMovie);

  
    let randomMovies = [];
    const cachedRandom = localStorage.getItem(RANDOM_LIST_CACHE_KEY);
    
    if (cachedRandom) {
      // Tải từ cache nếu có
      try {
        const parsedCache = JSON.parse(cachedRandom);
        if (Array.isArray(parsedCache) && parsedCache.length > 0) {
          randomMovies = parsedCache; 
          console.log("Đã tải list Random từ Cache.");
        }
      } catch (e) {
        localStorage.removeItem(RANDOM_LIST_CACHE_KEY);
      }
    }

    if (randomMovies.length === 0) {
      // Nếu không có cache, tạo list mới và lưu cache
      const allMoviesForRandom = fullMovieList; 

      randomMovies = movieFilter.filterRandomMovies(allMoviesForRandom, RANDOM_MOVIE_COUNT); 
      
      // Lưu danh sách ngẫu nhiên vừa tạo vào cache
      localStorage.setItem(RANDOM_LIST_CACHE_KEY, JSON.stringify(randomMovies));
      console.log("Đã tạo và lưu list Random mới vào Cache.");
    }
    
    // Cập nhật vào catagorMovie để render
    catagorMovie.randomMovies = randomMovies 
    
    const event = new CustomEvent("moviesUpdated", { detail: catagorMovie });
    window.dispatchEvent(event);
  } catch (error) {
    console.error(" Error updating categories:", error);
    throw error;
  }
}

// Hàm này được gọi khi nhấn nút Random
export function generateAndCacheRandomList() {
    localStorage.removeItem(RANDOM_LIST_CACHE_KEY);

    const allMoviesForRandom = fullMovieList;
    const newRandomMovies = movieFilter.filterRandomMovies(allMoviesForRandom, RANDOM_MOVIE_COUNT);
    
    localStorage.setItem(RANDOM_LIST_CACHE_KEY, JSON.stringify(newRandomMovies));

    catagorMovie.randomMovies = newRandomMovies; // <== ĐỒNG BỘ: Sử dụng randomMovies
    const event = new CustomEvent("moviesUpdated", { detail: catagorMovie });
    window.dispatchEvent(event);
    
    console.log("Đã tạo lại list Random mới và lưu cache.");
    return newRandomMovies;
}

export const movieListPromise = moviePromise
  .then(async () => {

    await updateMovieCategories();
    
    renderHeaderDropdown(catagorMovie.headerSeries, ".js-series-dropdown");
    renderHeaderDropdown(catagorMovie.headerSingle, ".js-single-dropdown");
    
    updateNewMovies()
        .then(() => {
             updateMovieCategories(); 
        })
        .catch(error => {
            console.error("Lỗi khi cập nhật phim mới từ API:", error);
        });
  
    startNewMoviesPolling();
    const POLLING_INTERVAL = 30 * 60 * 1000;
    setInterval(updateMovieCategories, POLLING_INTERVAL);
  })
  .catch((error) => {
    console.error("Movie categories initialization failed:", error);
    throw error;
  });