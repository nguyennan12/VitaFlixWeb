// comment.js - Xử lý chức năng bình luận

export class CommentManager {
    constructor() {
        this.btnSend = document.querySelector('.js-send-button');
        this.txtComment = document.querySelector('.js-textarea');
        this.boxComment = document.querySelector('.js-comment');
        this.charCounter = document.querySelector('.js-quanity-charater-comment');
        this.statusComment = document.querySelector('.js-status-comment');
        this.avatarViewer = document.getElementById('avatar-viewer-comment');
        this.nameViewer = document.getElementById('name-viewer-comment');
        
        this.isAnonymous = true;
        this.maxLength = 1000;
        
        this.init();
    }

    init() {
        if (!this.txtComment || !this.btnSend || !this.boxComment) {
            console.warn('Comment elements not found');
            return;
        }

        this.setupCharacterCounter();
        this.setupSendButton();
        this.setupAnonymousToggle();
        this.loadComments();
    }

    // Đếm ký tự
    setupCharacterCounter() {
        this.txtComment.addEventListener('input', () => {
            const length = this.txtComment.value.length;
            this.charCounter.textContent = length;
            
            if (length > this.maxLength) {
                this.txtComment.value = this.txtComment.value.substring(0, this.maxLength);
                this.charCounter.textContent = this.maxLength;
            }
        });
        
    }

    formatCommentContent(text) {
        const escapedText = this.escapeHtml(text);
        // Thay thế ký tự xuống dòng (\n) thành thẻ <br> HTML
        return escapedText;
    }

    // Xử lý gửi comment
    setupSendButton() {
        this.btnSend.addEventListener('click', () => {
            this.sendComment();
        });

        // Gửi bằng Ctrl+Enter
        this.txtComment.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.sendComment();
            }
        });
    }

    // Toggle ẩn danh
    setupAnonymousToggle() {
        if (this.statusComment) {
            this.statusComment.addEventListener('click', () => {
                this.isAnonymous = !this.isAnonymous;
                this.updateCommentStatus();
            });
        }
    }

    

    updateCommentStatus() {
        const privacyText = document.getElementById('privacy-text');
        
        if (this.isAnonymous) {
            privacyText.innerHTML = 'Ẩn danh<span><i class="fa-solid fa-rotate"></i></span>';
            this.avatarViewer.src = '/assets/images/VitaFlix.png';
            this.nameViewer.textContent = 'Vô Danh';
        } else {
            privacyText.innerHTML = 'Công khai<span><i class="fa-solid fa-rotate"></i></span>';
            // TODO: Load user avatar và name từ localStorage hoặc API
            this.avatarViewer.src = '/assets/images/user-avatar.png';
            this.nameViewer.textContent = 'Người dùng';
        }
    }

    sendComment() {
        const content = this.txtComment.value.trim();
        
        if (!content) {
            alert('Vui lòng nhập nội dung bình luận!');
            return;
        }

        const comment = {
            id: Date.now(),
            content: content,
            author: this.isAnonymous ? 'Vô Danh' : 'Người dùng',
            avatar: this.isAnonymous ? '/assets/images/VitaFlix.png' : '/assets/images/user-avatar.png',
            timestamp: new Date().toISOString(),
            movieSlug: new URLSearchParams(window.location.search).get('slug')
        };

        this.addCommentToUI(comment);
        this.saveComment(comment);
        
        // Clear input
        this.txtComment.value = '';
        this.charCounter.textContent = '0';
    }

    addCommentToUI(comment, prepend = true) {
        const timeAgo = this.getTimeAgo(comment.timestamp);
        const formattedContent = this.formatCommentContent(comment.content);
        
        const html = `
            

            <div class="viewer-comment" data-comment-id="${comment.id}">
        <div class="avatar-show-comment">
          <div class="avatar">
            <img src="${comment.avatar}" onerror="this.src='/assets/images/avatar-default-3.jpg'">
          </div>
        </div>
        <div class="place-viewer-comment">
          <div class="name-comment">
            <p id="name-comment"><span>${comment.author} </span> &#183; ${timeAgo}</p>
          </div>
          <div class="content-comment">
            <div class="comment-content-text">${formattedContent}</div>
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

        if (prepend) {
            this.boxComment.insertAdjacentHTML('afterbegin', html);
        } else {
            this.boxComment.insertAdjacentHTML('beforeend', html);
        }
    }

    // Lưu comment vào localStorage
    saveComment(comment) {
        try {
            const movieSlug = comment.movieSlug;
            const storageKey = `comments_${movieSlug}`;
            
            let comments = JSON.parse(localStorage.getItem(storageKey) || '[]');
            comments.unshift(comment);
            
            // Giới hạn 100 comments mỗi phim
            if (comments.length > 100) {
                comments = comments.slice(0, 100);
            }
            
            localStorage.setItem(storageKey, JSON.stringify(comments));
        } catch (e) {
            console.error('Không thể lưu comment:', e);
        }
    }

    // Load comments từ localStorage
    loadComments() {
        try {
            const movieSlug = new URLSearchParams(window.location.search).get('slug');
            if (!movieSlug) return;
            
            const storageKey = `comments_${movieSlug}`;
            const comments = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            if (comments.length === 0) {
                this.boxComment.innerHTML = '<div class="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên!</div>';
                return;
            }

            this.boxComment.innerHTML = '';
            comments.forEach(comment => {
                this.addCommentToUI(comment, false);
            });
        } catch (e) {
            console.error('Không thể load comments:', e);
        }
    }

    // Tính thời gian đã đăng
    getTimeAgo(timestamp) {
        const now = new Date();
        const commentTime = new Date(timestamp);
        const diffMs = now - commentTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        
        return commentTime.toLocaleDateString('vi-VN');
    }

    // Escape HTML để tránh XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Like comment (TODO: implement)
    likeComment(commentId) {
        console.log('Like comment:', commentId);
        alert('Tính năng đang phát triển!');
    }

    // Reply comment (TODO: implement)
    replyComment(commentId) {
        console.log('Reply to comment:', commentId);
        alert('Tính năng đang phát triển!');
    }

    // Xóa tất cả comments (admin only)
    clearAllComments() {
        if (confirm('Bạn có chắc muốn xóa tất cả bình luận?')) {
            const movieSlug = new URLSearchParams(window.location.search).get('slug');
            localStorage.removeItem(`comments_${movieSlug}`);
            this.boxComment.innerHTML = '<div class="no-comments">Chưa có bình luận nào.</div>';
        }
    }
}

// Export instance để sử dụng global
export let commentManager = null;

export function initCommentManager() {
    commentManager = new CommentManager();
    window.commentManager = commentManager; // Expose globally cho onclick events
    return commentManager;

    
}