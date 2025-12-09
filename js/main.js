// js/main.js - Fixed với đường dẫn tương đối

$(function () {
  // Xác định đường dẫn tương đối dựa trên vị trí hiện tại
  const currentPath = window.location.pathname;
  let basePath = '';
  
  // Nếu đang ở trong thư mục con (như page/, auth/), cần quay lại thư mục gốc
  if (currentPath.includes('/page/') || currentPath.includes('/auth/')) {
    basePath = '../';
  }
  
  // Load header với fallback
  $("#header").load(basePath + "components/header.html", function(response, status) {
    if (status === "error") {
      console.warn("Header không tải được:", status);
      // Tạo header đơn giản nếu load thất bại
      $("#header").html(createFallbackHeader());
    } else {
      console.log("✅ Header loaded successfully");
    }
  });

  // Load footer với fallback
  $("#footer").load(basePath + "components/footer.html", function(response, status) {
    if (status === "error") {
      console.warn("Footer không tải được:", status);
      $("#footer").html(createFallbackFooter());
    } else {
      console.log("✅ Footer loaded successfully");
    }
  });
});

// Fallback header khi load thất bại
function createFallbackHeader() {
  return `
    <header class="home-header fixed-top d-flex align-items-center" style="background: #17191d; padding: 1rem;">
      <div class="container-fluid px-4 d-flex justify-content-between align-items-center">
        <a href="index.html" style="color: #fff; font-size: 1.5rem; font-weight: bold; text-decoration: none;">
          VitaFlix
        </a>
        <nav>
          <a href="index.html" style="color: #fff; text-decoration: none; margin: 0 1rem;">Trang chủ</a>
          <a href="categorize-movie.html" style="color: #fff; text-decoration: none; margin: 0 1rem;">Thể loại</a>
        </nav>
      </div>
    </header>
  `;
}

// Fallback footer khi load thất bại
function createFallbackFooter() {
  return `
    <footer style="background: #17191d; color: #fff; padding: 2rem; text-align: center; margin-top: 3rem;">
      <p>&copy; 2025 VitaFlix. All rights reserved.</p>
    </footer>
  `;
}