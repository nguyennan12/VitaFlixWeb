
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

export function attachMovieCardClickHandlers(containerSelector) {
  const container =
    typeof containerSelector === "string"
      ? document.querySelector(containerSelector)
      : containerSelector;

  if (!container) {
    console.warn("Container không tồn tại:", containerSelector);
    return;
  }

  const movieCards = container.querySelectorAll(".movie-card");

  movieCards.forEach((card) => {
    const newCard = card.cloneNode(true);
    card.parentNode.replaceChild(newCard, card);

    newCard.addEventListener("click", function (e) {
      e.preventDefault();
      const slug = this.dataset.slug;

      if (slug) {
        window.location.href = `/movie-info.html?slug=${slug}`;
      } else {
        console.error("Không tìm thấy slug cho phim này");
      }
    });

    newCard.addEventListener("mouseenter", function () {
      this.style.zIndex = "10";
    });

    newCard.addEventListener("mouseleave", function () {
      this.style.zIndex = "1";
    });
  });
}


export function renderMovieList(movies, containerSelector) {
  const container = document.querySelector(containerSelector);

  if (!container) {
    console.error("Container không tồn tại:", containerSelector);
    return;
  }


  container.innerHTML = "";

  movies.forEach((movie) => {
    container.innerHTML += createMovieCardHTML(movie);
  });

  attachMovieCardClickHandlers(container);
}


export function initMovieCards() {

  const movieContainers = [
    ".js-movie-list-korea",
    ".js-movie-list-china",
    ".js-movie-list-japan",
    ".js-movie-list-single-korea",
    ".js-movie-list-single-auMy",
    ".js-movie-list-random",
  ];

  movieContainers.forEach((selector) => {
    attachMovieCardClickHandlers(selector);
  });

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMovieCards);
} else {
  initMovieCards();
}
