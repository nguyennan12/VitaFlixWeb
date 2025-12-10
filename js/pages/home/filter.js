// import { catagorMovie, movieListPromise } from "../../modules/categorize.js";
// import {
//   createMovieCardHTML,
//   attachMovieCardClickHandlers,
// } from "../../modules/movieCardHandler.js";

// // Hàm render danh sách phim
// function renderMovieList(movies, containerClass) {
//   const container = document.querySelector(containerClass);
//   if (!container) return;

//   container.innerHTML = "";

//   movies.forEach((movie) => {
//     container.innerHTML += createMovieCardHTML(movie);
//   });

//   // Attach click handlers sau khi render
//   attachMovieCardClickHandlers(container);
// }

// // Hàm xử lý filter
// function handleFilter(filterType) {
//   let filteredMovies = [];

//   switch (filterType) {
//     case "all":
//       filteredMovies = catagorMovie.full || [];
//       break;
//     case "series":
//       filteredMovies = [
//         ...(catagorMovie.korea?.series || []),
//         ...(catagorMovie.china?.series || []),
//         ...(catagorMovie.japan?.series || []),
//         ...(catagorMovie.vietNam?.series || []),
//         ...(catagorMovie.auMy?.series || []),
//       ];
//       break;
//     case "single":
//       filteredMovies = [
//         ...(catagorMovie.korea?.single || []),
//         ...(catagorMovie.china?.single || []),
//         ...(catagorMovie.japan?.single || []),
//         ...(catagorMovie.vietNam?.single || []),
//         ...(catagorMovie.auMy?.single || []),
//       ];
//       break;
//     case "anime":
//       filteredMovies = catagorMovie.japan?.anime || [];
//       break;
//     default:
//       filteredMovies = catagorMovie.full || [];
//   }

//   renderFilteredResults(filteredMovies, filterType);

//   const resultsSection = document.querySelector(".filter-results");
//   if (resultsSection) {
//     resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
//   }
// }

// // Hàm hiển thị kết quả filter
// function renderFilteredResults(movies, filterType) {
//   const defaultSections = document.querySelectorAll(
//     ".container-movie > div:not(.filter-results), .profile-container"
//   );
//   defaultSections.forEach((section) => {
//     section.style.display = "none";
//   });

//   let resultsSection = document.querySelector(".filter-results");
//   if (!resultsSection) {
//     resultsSection = document.createElement("div");
//     resultsSection.className = "filter-results";
//     const containerMovie = document.querySelector(".container-movie");
//     if (containerMovie) {
//       containerMovie.prepend(resultsSection);
//     } else {
//       document.querySelector("main").appendChild(resultsSection);
//     }
//   }

//   const filterNames = {
//     all: "Tất Cả Phim",
//     series: "Phim Bộ",
//     single: "Phim Lẻ",
//     anime: "Anime",
//   };

//   resultsSection.innerHTML = `
//     <div class="filter-results-header">
//       <h2>${filterNames[filterType]}</h2>
//       <p>Tìm thấy ${movies.length} phim</p>
//     </div>
//     <div class="filter-results-grid"></div>
//   `;

//   const grid = resultsSection.querySelector(".filter-results-grid");
//   movies.forEach((movie) => {
//     grid.innerHTML += createMovieCardHTML(movie);
//   });

//   // Attach click handlers cho tất cả movie cards
//   attachMovieCardClickHandlers(grid);

//   resultsSection.style.display = "block";
// }

// // Hàm reset về trang chủ
// function resetToHome() {
//   const resultsSection = document.querySelector(".filter-results");
//   if (resultsSection) {
//     resultsSection.style.display = "none";
//   }

//   const defaultSections = document.querySelectorAll(
//     ".container-movie > div:not(.filter-results), .profile-container"
//   );
//   defaultSections.forEach((section) => {
//     section.style.display = "block";
//   });

//   document.querySelectorAll(".filter-btn").forEach((btn) => {
//     btn.classList.remove("active");
//     if (btn.dataset.filter === "all") {
//       btn.classList.add("active");
//     }
//   });

//   window.scrollTo({ top: 0, behavior: "smooth" });
// }

// // Khởi tạo filter buttons
// function initFilterButtons() {
//   const filterButtons = document.querySelectorAll(".filter-btn");

//   filterButtons.forEach((button) => {
//     button.addEventListener("click", () => {
//       filterButtons.forEach((btn) => btn.classList.remove("active"));
//       button.classList.add("active");

//       const filterType = button.dataset.filter;

//       if (filterType === "all") {
//         resetToHome();
//       } else {
//         handleFilter(filterType);
//       }
//     });
//   });
// }

// // Hàm khởi tạo navigation links
// function initNavigationLinks() {
//   window.addEventListener("navigationClick", (e) => {
//     const page = e.detail.page;

//     switch (page) {
//       case "home":
//         resetToHome();
//         break;
//       case "single":
//         handleFilter("single");
//         updateFilterButtonState("single");
//         break;
//       case "series":
//         handleFilter("series");
//         updateFilterButtonState("series");
//         break;
//       case "category":
//         console.log("Chức năng Chủ đề đang phát triển");
//         break;
//       case "genre":
//         console.log("Chức năng Thể loại đang phát triển");
//         break;
//       case "country":
//         console.log("Chức năng Quốc gia đang phát triển");
//         break;
//       default:
//         resetToHome();
//     }
//   });
// }

// // Hàm cập nhật trạng thái active của filter buttons
// function updateFilterButtonState(filterType) {
//   const filterButtons = document.querySelectorAll(".filter-btn");
//   filterButtons.forEach((btn) => {
//     btn.classList.remove("active");
//     if (btn.dataset.filter === filterType) {
//       btn.classList.add("active");
//     }
//   });
// }

// // Khởi chạy khi DOM ready và movies đã load
// document.addEventListener("DOMContentLoaded", () => {
//   movieListPromise
//     .then(() => {
//       initFilterButtons();
//       initNavigationLinks();
//       console.log("Filter và navigation đã sẵn sàng");
//     })
//     .catch((error) => {
//       console.error("Lỗi khởi tạo filters:", error);
//     });

//   window.addEventListener("moviesUpd ated", () => {
//     console.log("Phim đã được cập nhật");
//   });
// });

// export {
//   renderMovieList,
//   handleFilter,
//   resetToHome,
//   initFilterButtons,
//   initNavigationLinks,
// };
