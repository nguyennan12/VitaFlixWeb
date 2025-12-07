  const USER_KEY = "vitaflix_current_user";

    function renderBioProfile() {
        // 1. Lấy dữ liệu người dùng
        let user = null;
        try {
            user = JSON.parse(localStorage.getItem(USER_KEY));
        } catch (e) {
            console.error("Lỗi khi đọc user data từ localStorage:", e);
            user = null;
        }

        // 2. Tham chiếu đến các phần tử HTML
        const avatarImg = document.getElementById('userBioAvatar');
        const usernameSpan = document.getElementById('userBioUsername');
        const bioTextDiv = document.getElementById('userBioText');

        if (!user || !user.username) {
            // Trường hợp chưa đăng nhập, dùng giá trị mặc định hoặc ẩn đi
            if (usernameSpan) usernameSpan.textContent = "Khách";
            if (bioTextDiv) bioTextDiv.textContent = "Đăng nhập để xem thông tin";
            if (avatarImg) avatarImg.src = "/assets/images/default-avatar.jpg";
            return;
        }

        // 3. Cập nhật dữ liệu từ user object
        if (avatarImg) {
            // Sử dụng avatar đã lưu, nếu không có thì dùng avatar mặc định
            const avatarUrl = user.avatar && user.avatar.trim() !== "" 
                              ? user.avatar 
                              : "/assets/images/default-avatar.jpg"; 
            avatarImg.src = avatarUrl;
        }

        if (usernameSpan) {
            // Render Tên người dùng
            usernameSpan.textContent = user.username;
        }

        if (bioTextDiv) {
            // Render Tiểu sử, nếu không có thì hiển thị thông báo mặc định
            bioTextDiv.textContent = user.bio && user.bio.trim() !== "" 
                                     ? user.bio 
                                     : "Chưa có tiểu sử.";
        }
    }

    // Chạy hàm khi DOM đã tải xong
    document.addEventListener('DOMContentLoaded', renderBioProfile);

    // Lắng nghe sự kiện storage (nếu user cập nhật profile ở tab khác)
    window.addEventListener("storage", function (e) {
      if (e.key === USER_KEY) renderBioProfile();
    });