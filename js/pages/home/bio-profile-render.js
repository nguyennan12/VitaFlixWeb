  const USER_KEY = "vitaflix_current_user";

    function renderBioProfile() {
        let user = null;
        try {
            user = JSON.parse(localStorage.getItem(USER_KEY));
        } catch (e) {
            console.error("Lỗi khi đọc user data từ localStorage:", e);
            user = null;
        }

        const avatarImg = document.getElementById('userBioAvatar');
        const usernameSpan = document.getElementById('userBioUsername');
        const bioTextDiv = document.getElementById('userBioText');

        if (!user || !user.username) {
            if (usernameSpan) usernameSpan.textContent = "Khách";
            if (bioTextDiv) bioTextDiv.textContent = "Đăng nhập để xem thông tin";
            if (avatarImg) avatarImg.src = "/assets/images/default-avatar.jpg";
            return;
        }

        if (avatarImg) {
            // Sử dụng avatar đã lưu, nếu không có thì dùng avatar mặc định
            const avatarUrl = user.avatar && user.avatar.trim() !== "" 
                              ? user.avatar 
                              : "/assets/images/default-avatar.jpg"; 
            avatarImg.src = avatarUrl;
        }

        if (usernameSpan) {
            usernameSpan.textContent = user.username;
        }

        if (bioTextDiv) {
            bioTextDiv.textContent = user.bio && user.bio.trim() !== "" 
                                     ? user.bio 
                                     : "Chưa có tiểu sử.";
        }
    }

    document.addEventListener('DOMContentLoaded', renderBioProfile);

    window.addEventListener("storage", function (e) {
      if (e.key === USER_KEY) renderBioProfile();
    });