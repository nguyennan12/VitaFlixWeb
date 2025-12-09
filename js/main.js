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

