const textarea = document.querySelector('.js-textarea');
const sendBtn = document.querySelector('.js-send-button');
let quanity;
let currentMovieSlug = null; // Biến lưu slug của phim hiện tại

// === Khởi tạo comment cho phim cụ thể ===
export function initCommentForMovie(movieSlug) {
  currentMovieSlug = movieSlug;
  loadCommentsForMovie(movieSlug);
  handleComment();
}

export function handleComment() {
  // --- Clone để reset event listeners cũ ---
  const newTextarea = textarea.cloneNode(true);
  const newSendBtn = sendBtn.cloneNode(true);
  const privacyStatus = document.querySelector('.js-status-comment');
  const privacyText = document.getElementById('privacy-text');
  const newPrivacyStatus = privacyStatus ? privacyStatus.cloneNode(true) : null;
  const newPrivacyText = privacyText ? privacyText.cloneNode(true) : null;

  textarea.parentNode.replaceChild(newTextarea, textarea);
  sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
  if (privacyStatus && newPrivacyStatus) {
    privacyStatus.parentNode.replaceChild(newPrivacyStatus, privacyStatus);
  }
  if (privacyText && newPrivacyText) {
    privacyText.parentNode.replaceChild(newPrivacyText, privacyText);
  }

  // --- Gán lại references ---
  const currentTextarea = document.querySelector('.js-textarea');
  const currentSendBtn = document.querySelector('.js-send-button');
  const currentPrivacyStatus = document.querySelector('.js-status-comment');
  const currentPrivacyText = document.getElementById('privacy-text');

  // --- Đếm ký tự ---
  currentTextarea.addEventListener('input', (e) => {
    const countCharater = e.target.value.length;
    const quanity = document.querySelector('.js-quanity-charater-comment');
    if (quanity) quanity.innerHTML = countCharater;
  });

  // --- Gửi comment ---
  currentSendBtn.addEventListener('click', () => {
    if (currentMovieSlug) addComment(currentMovieSlug);
  });

  // --- Enter để gửi ---
  currentTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentMovieSlug) addComment(currentMovieSlug);
    }
  });

  // --- Click Ẩn danh / Hiện danh ---
  if (currentPrivacyStatus && currentPrivacyText) {
    currentPrivacyStatus.addEventListener('click', () => {
      const isAnonymous = currentPrivacyText.textContent.trim().startsWith('Ẩn danh');

      if (isAnonymous) {
        // Hiện danh tính
        currentPrivacyText.innerHTML = 'Hiện danh tính<span><i class="fa-solid fa-rotate"></i></span>';
        document.getElementById('name-viewer-comment').textContent = 'Nguyen An';
        document.getElementById('avatar-viewer-comment').src = '/assets/images/avatar-nan.jpg';
      } else {
        // Ẩn danh
        currentPrivacyText.innerHTML = 'Ẩn danh<span><i class="fa-solid fa-rotate"></i></span>';
        document.getElementById('name-viewer-comment').textContent = 'Ẩn danh';
        document.getElementById('avatar-viewer-comment').src = '/assets/images/VitaFlix.png';
      }
    });
  }
}


// === Load comments cho phim cụ thể ===
function loadCommentsForMovie(movieSlug) {
  const comments = getCommentsForMovie(movieSlug);
  renderComments(comments);
}

// === Lấy comments của phim cụ thể từ localStorage ===
function getCommentsForMovie(movieSlug) {
  const allComments = JSON.parse(localStorage.getItem('movieComments')) || {};
  return allComments[movieSlug] || [];
}

// === Lưu comment cho phim cụ thể ===
function saveCommentForMovie(movieSlug, comment) {
  const allComments = JSON.parse(localStorage.getItem('movieComments')) || {};
  
  if (!allComments[movieSlug]) {
    allComments[movieSlug] = [];
  }
  
  // Tạo object comment với thông tin chi tiết
  const commentData = {
    id: Date.now(),
    content: comment,
    timestamp: new Date().toISOString(),
    author: getCurrentUserInfo()
  };
  
  allComments[movieSlug].unshift(commentData);
  
  // Giới hạn số comment tối đa cho mỗi phim (100 comments)
  if (allComments[movieSlug].length > 100) {
    allComments[movieSlug] = allComments[movieSlug].slice(0, 50);
  }
  
  localStorage.setItem('movieComments', JSON.stringify(allComments));
  return commentData;
}

// === Lấy thông tin user hiện tại (ẩn danh / hiện danh) ===
function getCurrentUserInfo() {
  const isPrivate = document.getElementById("privacy-text")?.textContent?.includes('Ẩn danh');
  
  if (isPrivate) {
    return {
      name: 'Vô Danh',
      avatar: '/assets/images/avatar-default-3.jpg',
      isPrivate: true
    };
  } else {
    return {
      name: 'Nguyen An',
      avatar: '/assets/images/avatar-nan.jpg',
      isPrivate: false
    };
  }
}

// === Định dạng thời gian hiển thị ===
function formatTimeAgo(timestamp) {
  const now = new Date();
  const commentTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Vừa xong';
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} tuần trước`;
}

// === Thêm comment mới ===
function addComment(movieSlug) {
  const currentTextarea = document.querySelector('.js-textarea');
  const content = currentTextarea.value.trim();
  
  if (!content) {
    alert('Vui lòng nhập nội dung bình luận!');
    return;
  }
  
  if (content.length > 1000) {
    alert('Bình luận không được vượt quá 1000 ký tự!');
    return;
  }

  // Lưu comment
  const commentData = saveCommentForMovie(movieSlug, content);
  
  // Reset textarea
  currentTextarea.value = '';
  const quantityElement = document.querySelector('.js-quanity-charater-comment');
  if (quantityElement) quantityElement.innerHTML = '0';

  // Reload comments
  loadCommentsForMovie(movieSlug);
  
  // Cuộn lên trên cùng
  setTimeout(() => {
    const commentSection = document.querySelector('.js-comment');
    if (commentSection) commentSection.scrollTop = 0;
  }, 100);
}

// === Hiển thị comment ===
function renderComments(comments) {
  const commentContainer = document.querySelector('.js-comment');
  if (!commentContainer) return;

  if (comments.length === 0) {
    commentContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #666; font-style: italic;">
        <i class="fa-regular fa-comment" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
        <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận về bộ phim này!</p>
      </div>
    `;
    return;
  }

  let commentHtml = '';
  const commentLimited = comments.slice(0, 10);

  commentLimited.forEach((comment) => {
    const isOldFormat = typeof comment === 'string';
    const commentContent = isOldFormat ? comment : comment.content;
    const commentAuthor = isOldFormat ? { name: 'Nguyen An', avatar: '/assets/images/avatar-nan.jpg' } : comment.author;
    const commentTime = isOldFormat ? '1 giờ trước' : formatTimeAgo(comment.timestamp);
    
    commentHtml += `
      <div class="viewer-comment" data-comment-id="${isOldFormat ? Date.now() + Math.random() : comment.id}">
        <div class="avatar-show-comment">
          <div class="avatar">
            <img src="${commentAuthor.avatar}" onerror="this.src='/assets/images/avatar-default-3.jpg'">
          </div>
        </div>
        <div class="place-viewer-comment">
          <div class="name-comment">
            <p><span>${commentAuthor.name} </span> &#183; ${commentTime}</p>
          </div>
          <div class="content-comment">
            <div>${escapeHtml(commentContent)}</div>
          </div>
          <div class="react-comment">
            <p class="like-btn" onclick="toggleLike(this)">
              <i class="fa-regular fa-thumbs-up"></i><span>0</span>
            </p>
            <p class="dislike-btn" onclick="toggleDislike(this)">
              <i class="fa-regular fa-thumbs-down"></i><span>0</span>
            </p>
            <p class="reply-btn">
              <i class="fa-solid fa-reply"></i><span>Trả lời</span>
            </p>
            <p class="more-btn">
              <i class="fa-solid fa-ellipsis"></i><span>Thêm</span>
            </p>
          </div> 
        </div>
      </div>
    `;
  });
  
  commentContainer.innerHTML = commentHtml;
}

// === Escape HTML để tránh XSS ===
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// === Like / Dislike ===
window.toggleLike = function(element) {
  const countSpan = element.querySelector('span');
  const icon = element.querySelector('i');
  const currentCount = parseInt(countSpan.textContent) || 0;
  
  if (icon.classList.contains('fa-regular')) {
    icon.classList.replace('fa-regular', 'fa-solid');
    countSpan.textContent = currentCount + 1;
    element.style.color = 'rgb(3, 171, 3)';
  } else {
    icon.classList.replace('fa-solid', 'fa-regular');
    countSpan.textContent = Math.max(0, currentCount - 1);
    element.style.color = '';
  }
};

window.toggleDislike = function(element) {
  const countSpan = element.querySelector('span');
  const icon = element.querySelector('i');
  const currentCount = parseInt(countSpan.textContent) || 0;
  
  if (icon.classList.contains('fa-regular')) {
    icon.classList.replace('fa-regular', 'fa-solid');
    countSpan.textContent = currentCount + 1;
    element.style.color = 'rgb(230, 2, 2)';
  } else {
    icon.classList.replace('fa-solid', 'fa-regular');
    countSpan.textContent = Math.max(0, currentCount - 1);
    element.style.color = '';
  }
};

// === Migration dữ liệu cũ (tùy chọn) ===
function migrateOldComments() {
  const oldComments = JSON.parse(localStorage.getItem('saveTextComment'));
  if (oldComments && oldComments.length > 0) {
    console.log('Found old comments, consider migration:', oldComments.length);
    // localStorage.removeItem('saveTextComment');
  }
}
