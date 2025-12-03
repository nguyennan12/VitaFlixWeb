import { catagorMovie, movieListPromise } from "../../modules/categorize.js";

// Hàm render danh sách phim
function renderMovieList(movies, containerClass) {
  const container = document.querySelector(containerClass);
  if (!container) return;

  container.innerHTML = "";

  movies.forEach((movie) => {
    const movieCard = `
      <div class="movie-card" data-slug="${movie.slug}">
        <div class="movie-poster">
          <img src="${movie.poster_url || movie.thumb_url}" 
               alt="${movie.name}"
               loading="lazy"
               onerror="this.src='assets/images/default-poster.jpg'">
          <div class="movie-overlay">
            <div class="movie-quality">${movie.quality}</div>
            <div class="movie-episode">${movie.episode_current}</div>
          </div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${movie.name}</h3>
          <p class="movie-origin">${movie.origin_name}</p>
        </div>
      </div>
    `;
    container.innerHTML += movieCard;
  });

  // Thêm sự kiện click cho các card
  container.querySelectorAll(".movie-card").forEach((card) => {
    card.addEventListener("click", () => {
      const slug = card.dataset.slug;
      window.location.href = `/page/movie-info.html?slug=${slug}`;
    });
  });
}

// Hàm xử lý filter
function handleFilter(filterType) {
  let filteredMovies = [];

  switch (filterType) {
    case "all":
      filteredMovies = catagorMovie.full || [];
      break;
    case "series":
      // Lấy tất cả phim bộ từ các quốc gia
      filteredMovies = [
        ...(catagorMovie.korea?.series || []),
        ...(catagorMovie.china?.series || []),
        ...(catagorMovie.japan?.series || []),
        ...(catagorMovie.vietNam?.series || []),
        ...(catagorMovie.auMy?.series || []),
      ];
      break;
    case "single":
      // Lấy tất cả phim lẻ
      filteredMovies = [
        ...(catagorMovie.korea?.single || []),
        ...(catagorMovie.china?.single || []),
        ...(catagorMovie.japan?.single || []),
        ...(catagorMovie.vietNam?.single || []),
        ...(catagorMovie.auMy?.single || []),
      ];
      break;
    case "anime":
      filteredMovies = catagorMovie.japan?.anime || [];
      break;
    default:
      filteredMovies = catagorMovie.full || [];
  }

  // Render kết quả
  renderFilteredResults(filteredMovies, filterType);

  // Scroll to results
  const resultsSection = document.querySelector(".filter-results");
  if (resultsSection) {
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Hàm hiển thị kết quả filter
function renderFilteredResults(movies, filterType) {
  // Ẩn các section mặc định
  const defaultSections = document.querySelectorAll(
    ".container-movie > div:not(.filter-results), .profile-container"
  );
  defaultSections.forEach((section) => {
    section.style.display = "none";
  });

  // Tạo hoặc lấy section kết quả filter
  let resultsSection = document.querySelector(".filter-results");
  if (!resultsSection) {
    resultsSection = document.createElement("div");
    resultsSection.className = "filter-results";
    const containerMovie = document.querySelector(".container-movie");
    if (containerMovie) {
      containerMovie.prepend(resultsSection);
    } else {
      document.querySelector("main").appendChild(resultsSection);
    }
  }

  // Tên filter
  const filterNames = {
    all: "Tất Cả Phim",
    series: "Phim Bộ",
    single: "Phim Lẻ",
    anime: "Anime",
  };

  resultsSection.innerHTML = `
    <div class="filter-results-header">
      <h2>${filterNames[filterType]}</h2>
      <p>Tìm thấy ${movies.length} phim</p>
    </div>
    <div class="filter-results-grid"></div>
  `;

  // Render danh sách phim
  const grid = resultsSection.querySelector(".filter-results-grid");
  movies.forEach((movie) => {
    const movieCard = `
      <div class="movie-card" data-slug="${movie.slug}">
        <div class="movie-poster">
          <img src="${movie.poster_url || movie.thumb_url}" 
               alt="${movie.name}"
               loading="lazy"
               onerror="this.src='/assets/images/default-poster.jpg'">
          <div class="movie-overlay">
            <div class="movie-quality">${movie.quality}</div>
            <div class="movie-episode">${movie.episode_current}</div>
          </div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${movie.name}</h3>
          <p class="movie-origin">${movie.origin_name}</p>
        </div>
      </div>
    `;
    grid.innerHTML += movieCard;
  });

  // Thêm sự kiện click
  grid.querySelectorAll(".movie-card").forEach((card) => {
    card.addEventListener("click", () => {
      const slug = card.dataset.slug;
      window.location.href = `/page/movie-info.html?slug=${slug}`;
    });
  });

  resultsSection.style.display = "block";
}

// Hàm reset về trang chủ
function resetToHome() {
  const resultsSection = document.querySelector(".filter-results");
  if (resultsSection) {
    resultsSection.style.display = "none";
  }

  const defaultSections = document.querySelectorAll(
    ".container-movie > div:not(.filter-results), .profile-container"
  );
  defaultSections.forEach((section) => {
    section.style.display = "block";
  });

  // Reset active state của filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.filter === "all") {
      btn.classList.add("active");
    }
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Khởi tạo filter buttons
function initFilterButtons() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class từ tất cả buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class cho button được click
      button.classList.add("active");

      // Lấy filter type
      const filterType = button.dataset.filter;

      // Xử lý filter
      if (filterType === "all") {
        resetToHome();
      } else {
        handleFilter(filterType);
      }
    });
  });
}

// Hàm khởi tạo navigation links
function initNavigationLinks() {
  // Lắng nghe event từ header
  window.addEventListener("navigationClick", (e) => {
    const page = e.detail.page;

    switch (page) {
      case "home":
        resetToHome();
        break;
      case "single":
        handleFilter("single");
        updateFilterButtonState("single");
        break;
      case "series":
        handleFilter("series");
        updateFilterButtonState("series");
        break;
      case "category":
        // TODO: Implement category page
        console.log("Chức năng Chủ đề đang phát triển");
        break;
      case "genre":
        // TODO: Implement genre page
        console.log("Chức năng Thể loại đang phát triển");
        break;
      case "country":
        // TODO: Implement country page
        console.log("Chức năng Quốc gia đang phát triển");
        break;
      default:
        resetToHome();
    }
  });
}

// Hàm cập nhật trạng thái active của filter buttons
function updateFilterButtonState(filterType) {
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.filter === filterType) {
      btn.classList.add("active");
    }
  });
}

// Khởi chạy khi DOM ready và movies đã load
document.addEventListener("DOMContentLoaded", () => {
  movieListPromise
    .then(() => {
      initFilterButtons();
      initNavigationLinks();
      console.log("Filter và navigation đã sẵn sàng");
    })
    .catch((error) => {
      console.error("Lỗi khởi tạo filters:", error);
    });

  // Lắng nghe event cập nhật phim
  window.addEventListener("moviesUpdated", () => {
    console.log("Phim đã được cập nhật");
  });
});

// Export các hàm để có thể sử dụng ở nơi khác
export { handleFilter, resetToHome, initFilterButtons, initNavigationLinks };
