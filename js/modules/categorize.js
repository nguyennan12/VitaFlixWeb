import { MovieDetail } from "./model.js";
import { fetchMovieDetail, fullMovieList, moviePromise } from "./api.js";
import { updateNewMovies, startNewMoviesPolling } from "./api.js";

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

  //lọc theo loại phim lẻ, bộ, hoat hình,... (1 dk)
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
      // lấy phim yêu thích đã lưu từ trước trong cache localStorage
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

      //này đang nhập thủ công
      const favMovieSlug = [
        "nguu-lang-chuc-nu",
        "nguoi-hung-yeu-duoi-2",
        "khi-cuoc-doi-cho-ban-qua-quyt",
        "rung-khong-tieng",
        "the-gioi-ma-quai-phan-3",
        "kho-do-danh",
      ];

      //lấy chi tiết phim từ api
      const favPromises = favMovieSlug.map((slug) => fetchMovieDetail(slug));
      const favListDetails = await Promise.all(favPromises);

      //kiem tra co fetch dc ko
      const validDetails = favListDetails.filter((detail) => detail !== null);

      if (favListDetails && favListDetails.length > 0) {
        //lưu vào mảng favList kiểu class MovieDetail
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

export const catagorMovie = {};
window.catagorMovie = catagorMovie;
function renderHeaderDropdown(movies, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const listElement = container.querySelector(".dropdown-list");
  if (!listElement) return;

  // Xóa loading placeholder
  listElement.innerHTML = "";

  let html = "";
  // Chỉ lấy tối đa 5 phim
  const limitedMovies = movies.slice(0, 5);

  limitedMovies.forEach((movie) => {
    // Sử dụng thumb_url cho ảnh nhỏ trong dropdown
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
    catagorMovie.randomMovies = movieFilter.filterRandomMovies(
      fullMovieList,
      10
    );

    // Phân loại Async (cac phim can thao tac)
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

    // Lấy 5 phim ngẫu nhiên/nổi bật cho mỗi loại để hiển thị trong dropdown
    catagorMovie.headerSeries = movieFilter.filterRandomMovies(seriesList, 5);
    catagorMovie.headerSingle = movieFilter.filterRandomMovies(singleList, 5);

    console.log(catagorMovie.favMovie);

    const event = new CustomEvent("moviesUpdated", { detail: catagorMovie });
    window.dispatchEvent(event);
  } catch (error) {
    console.error(" Error updating categories:", error);
    throw error;
  }
}

export const movieListPromise = moviePromise
  .then(async () => {
    //update phim moi
    //await updateNewMovies();

    // phan loai lai phim
    await updateMovieCategories();

    // cap nhat phim
    startNewMoviesPolling();
    // RENDER DROPDOWN SAU KHI PHÂN LOẠI
    renderHeaderDropdown(catagorMovie.headerSeries, ".js-series-dropdown");
    renderHeaderDropdown(catagorMovie.headerSingle, ".js-single-dropdown");
    //phan loai lai khi co phim moi
    const POLLING_INTERVAL = 30 * 60 * 1000;
    setInterval(updateMovieCategories, POLLING_INTERVAL);
  })
  .catch((error) => {
    console.error("Movie categories initialization failed:", error);
    throw error;
  });
