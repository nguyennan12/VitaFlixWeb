// movieCardHandler.js - Module xử lý sự kiện click cho movie card

/**
 * Tạo HTML cho movie card với hover effect và click handler
 * @param {Object} movie - Object chứa thông tin phim
 * @returns {string} HTML string của movie card
 */
export function createMovieCardHTML(movie) {
  return `
    <div class="movie-card" data-slug="${movie.slug}">
      <div class="movie-poster">
        <img src="${movie.poster_url || movie.thumb_url}" 
             alt="${movie.name}"
             loading="lazy"
             onerror="this.src='assets/images/default-poster.jpg'">
        <div class="movie-overlay">
          <div class="movie-quality">${movie.quality || "HD"}</div>
          <div class="movie-episode">${movie.episode_current || "N/A"}</div>
        </div>
      </div>
      <div class="movie-info">
        <h3 class="movie-title">${movie.name}</h3>
        <p class="movie-origin">${movie.origin_name}</p>
      </div>
    </div>
  `;
}

/**
 * Attach click event listeners to all movie cards in a container
 * @param {string|HTMLElement} containerSelector - Container selector hoặc element
 */
export function attachMovieCardClickHandlers(containerSelector) {
  const container =
    typeof containerSelector === "string"
      ? document.querySelector(containerSelector)
      : containerSelector;

  if (!container) {
    console.warn("Container không tồn tại:", containerSelector);
    return;
  }

  // Lấy tất cả movie cards trong container
  const movieCards = container.querySelectorAll(".movie-card");

  movieCards.forEach((card) => {
    // Remove old listeners nếu có
    const newCard = card.cloneNode(true);
    card.parentNode.replaceChild(newCard, card);

    // Add click event
    newCard.addEventListener("click", function (e) {
      e.preventDefault();
      const slug = this.dataset.slug;

      if (slug) {
        // Chuyển hướng đến trang chi tiết phim
        window.location.href = `/movie-info.html?slug=${slug}`;
      } else {
        console.error("Không tìm thấy slug cho phim này");
      }
    });

    // Add hover effect (optional - CSS đã xử lý chủ yếu)
    newCard.addEventListener("mouseenter", function () {
      this.style.zIndex = "10";
    });

    newCard.addEventListener("mouseleave", function () {
      this.style.zIndex = "1";
    });
  });
}

/**
 * Render danh sách phim vào container và attach click handlers
 * @param {Array} movies - Mảng chứa danh sách phim
 * @param {string} containerSelector - Selector của container
 */
export function renderMovieList(movies, containerSelector) {
  const container = document.querySelector(containerSelector);

  if (!container) {
    console.error("Container không tồn tại:", containerSelector);
    return;
  }

  // Clear container
  container.innerHTML = "";

  // Render từng movie card
  movies.forEach((movie) => {
    container.innerHTML += createMovieCardHTML(movie);
  });

  // Attach click handlers
  attachMovieCardClickHandlers(container);
}

/**
 * Initialize all movie cards on page load
 */
export function initMovieCards() {
  // Tìm tất cả containers có movie cards
  const movieContainers = [
    ".js-movie-list-korea",
    ".js-movie-list-china",
    ".js-movie-list-japan",
    ".js-movie-list-single-korea",
    ".js-movie-list-single-auMy",
    ".js-movie-list-random",
    ".js-movie-list-continute",
    ".filter-results-grid",
  ];

  movieContainers.forEach((selector) => {
    attachMovieCardClickHandlers(selector);
  });

  console.log("Movie card handlers đã được khởi tạo");
}

// Auto init when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMovieCards);
} else {
  initMovieCards();
}
