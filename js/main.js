

$(function () {
  const currentPath = window.location.pathname;
  let basePath = '';
  
  if (currentPath.includes('/page/') || currentPath.includes('/auth/')) {
    basePath = '../';
  }
  
  $("#header").load(basePath + "components/header.html", function(response, status) {
    if (status === "error") {
      console.warn("Header không tải được:", status);

      $("#header").html(createFallbackHeader());
    } else {
      console.log("Header loaded successfully");
    }
  });

  $("#footer").load(basePath + "components/footer.html", function(response, status) {
    if (status === "error") {
      console.warn("Footer không tải được:", status);
      $("#footer").html(createFallbackFooter());
    } else {
      console.log("Footer loaded successfully");
    }
  });
});

