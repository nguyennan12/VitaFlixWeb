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
            return;
        }

        this.setupCharacterCounter();
        this.setupSendButton();
        this.setupAnonymousToggle();
        this.setupCommentActions();
        this.loadComments();
    }

    setupCommentActions() {
        this.boxComment.addEventListener('click', (e) => {
            
            const likeBtn = e.target.closest('.btn-like');
            if (likeBtn) {
                const countSpan = likeBtn.querySelector('.count');
                let currentCount = parseInt(countSpan.innerText) || 0;
                likeBtn.classList.toggle('active');
                if (likeBtn.classList.contains('active')) {
                    countSpan.innerText = currentCount + 1;
                } else {
                    countSpan.innerText = currentCount > 0 ? currentCount - 1 : 0;
                }
                return;
            }

            const replyBtn = e.target.closest('.btn-reply');
            if (replyBtn) {
                const commentItem = replyBtn.closest('.viewer-comment');
                const replyBox = commentItem.querySelector('.reply-box');
                const inputField = replyBox.querySelector('input');

                replyBox.classList.toggle('hidden');
                if (!replyBox.classList.contains('hidden')) {
                    inputField.focus();
                }
                return;
            }

            const deleteBtn = e.target.closest('.btn-delete');
            if (deleteBtn) {
                if (confirm('Bạn có chắc chắn muốn xóa?')) {
                    const commentItem = deleteBtn.closest('.viewer-comment, .reply-item');
                    
                    const isReply = commentItem.classList.contains('reply-item');
                    const id = commentItem.getAttribute(isReply ? 'data-reply-id' : 'data-comment-id');
                    
                    commentItem.style.opacity = '0';
                    setTimeout(() => {
                        commentItem.remove();
                        if (isReply) {
                            const parentId = commentItem.closest('.viewer-comment').getAttribute('data-comment-id');
                            this.deleteReplyFromStorage(parentId, id);
                        } else {
                            this.deleteCommentFromStorage(id);
                        }
                    }, 300);
                }
                return;
            }

            const sendReplyBtn = e.target.closest('.btn-confirm-reply');
            if (sendReplyBtn) {
                const replyBox = sendReplyBtn.closest('.reply-box');
                const parentCommentItem = replyBox.closest('.viewer-comment');
                const parentId = parentCommentItem.getAttribute('data-comment-id');
                
                const input = replyBox.querySelector('input');
                const content = input.value.trim();

                if (content) {
                    const reply = {
                        id: Date.now(),
                        parentId: parentId,
                        content: content,
                        author: this.isAnonymous ? 'Vô Danh' : 'Người dùng',
                        avatar: this.isAnonymous ? '/assets/images/VitaFlix.png' : '/assets/images/user-avatar.png',
                        timestamp: new Date().toISOString()
                    };

                    this.addReplyToUI(parentCommentItem, reply);
                    this.saveReply(parentId, reply);

                    input.value = '';
                    replyBox.classList.add('hidden');
                } else {
                    alert('Vui lòng nhập nội dung trả lời');
                }
            }
        });
    }

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

    setupSendButton() {
        this.btnSend.addEventListener('click', () => { this.sendComment(); });
        this.txtComment.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') { this.sendComment(); }
        });
    }

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
            this.avatarViewer.src = '/assets/images/user-avatar.png';
            this.nameViewer.textContent = 'Người dùng';
        }
    }

    sendComment() {
        const content = this.txtComment.value.trim();
        if (!content) { alert('Vui lòng nhập nội dung bình luận!'); return; }

        const comment = {
            id: Date.now(),
            content: content,
            author: this.isAnonymous ? 'Vô Danh' : 'Người dùng',
            avatar: this.isAnonymous ? '/assets/images/VitaFlix.png' : '/assets/images/user-avatar.png',
            timestamp: new Date().toISOString(),
            movieSlug: new URLSearchParams(window.location.search).get('slug'),
            likes: 0,
            replies: []
        };

        this.addCommentToUI(comment);
        this.saveComment(comment);
        this.txtComment.value = '';
        this.charCounter.textContent = '0';
    }

    addCommentToUI(comment, prepend = true) {
        const timeAgo = this.getTimeAgo(comment.timestamp);
        
        const html = `
            <div class="viewer-comment" data-comment-id="${comment.id}">
                <div class="avatar-show-comment">
                    <div class="avatar"><img src="${comment.avatar}" alt="${comment.author}"></div>
                </div>

                <div class="place-viewer-comment">
                    <div class="name-comment">
                        <span>${comment.author}</span>
                        <p>${timeAgo}</p>
                    </div>
                    <div class="content-comment">${this.escapeHtml(comment.content)}</div>
                    
                    <div class="react-comment">
                        <p class="btn-like">
                            <i class="fa-solid fa-heart"></i> <span>Thích</span> <span class="count">${comment.likes || 0}</span>
                        </p>
                        <p class="btn-reply">
                            <i class="fa-solid fa-reply"></i> <span>Trả lời</span>
                        </p>
                        <p class="btn-delete">
                            <i class="fa-solid fa-trash"></i> <span>Xóa</span>
                        </p>
                    </div>

                    <div class="reply-box hidden">
                        <div class="reply-input-container">
                            <input type="text" placeholder="Viết câu trả lời...">
                            <button class="btn-confirm-reply">Gửi</button>
                        </div>
                    </div>

                    <div class="list-replies">
                        </div>
                </div>
            </div>
        `;

        if (prepend) {
            this.boxComment.insertAdjacentHTML('afterbegin', html);
        } else {
            this.boxComment.insertAdjacentHTML('beforeend', html);
        }

        if (comment.replies && comment.replies.length > 0) {
            const insertedComment = this.boxComment.querySelector(`.viewer-comment[data-comment-id="${comment.id}"]`);
            if (insertedComment) {
                comment.replies.forEach(reply => {
                    this.addReplyToUI(insertedComment, reply);
                });
            }
        }
    }

    addReplyToUI(parentCommentElement, reply) {
        const repliesContainer = parentCommentElement.querySelector('.list-replies');
        const timeAgo = this.getTimeAgo(reply.timestamp);

        const replyHtml = `
            <div class="reply-item" data-reply-id="${reply.id}">
                <div class="reply-avatar">
                    <img src="${reply.avatar}" alt="${reply.author}">
                </div>
                
                <div class="reply-content-block">
                    <div class="reply-header">
                        <span class="reply-author">${reply.author}</span>
                        <span class="reply-time">${timeAgo}</span>
                    </div>
                    
                    <div class="reply-text">${this.escapeHtml(reply.content)}</div>
                    
                    <div class="reply-actions">
                        <span class="action-btn btn-like">
                            <i class="fa-solid fa-heart"></i> <span class="count">${reply.likes || 0}</span>
                        </span>
                        <span class="action-btn btn-delete">
                            <i class="fa-solid fa-trash"></i> Xóa
                        </span>
                    </div>
                </div>
            </div>
        `;
        
        repliesContainer.insertAdjacentHTML('beforeend', replyHtml);
    }

    saveComment(comment) {
        try {
            const movieSlug = comment.movieSlug;
            const storageKey = `comments_${movieSlug}`;
            let comments = JSON.parse(localStorage.getItem(storageKey) || '[]');
            comments.unshift(comment);
            if (comments.length > 100) comments = comments.slice(0, 100);
            localStorage.setItem(storageKey, JSON.stringify(comments));
        } catch (e) { console.error(e); }
    }

    saveReply(parentId, reply) {
        try {
            const movieSlug = new URLSearchParams(window.location.search).get('slug');
            const storageKey = `comments_${movieSlug}`;
            let comments = JSON.parse(localStorage.getItem(storageKey) || '[]');

            const parentIndex = comments.findIndex(c => c.id.toString() === parentId.toString());
            if (parentIndex !== -1) {
                if (!comments[parentIndex].replies) {
                    comments[parentIndex].replies = [];
                }
                comments[parentIndex].replies.push(reply);
                localStorage.setItem(storageKey, JSON.stringify(comments));
            }
        } catch (e) { console.error(e); }
    }

    deleteCommentFromStorage(commentId) {
        try {
            const movieSlug = new URLSearchParams(window.location.search).get('slug');
            const storageKey = `comments_${movieSlug}`;
            let comments = JSON.parse(localStorage.getItem(storageKey) || '[]');
            comments = comments.filter(c => c.id.toString() !== commentId.toString());
            localStorage.setItem(storageKey, JSON.stringify(comments));
        } catch (e) { console.error(e); }
    }

    deleteReplyFromStorage(parentId, replyId) {
        try {
            const movieSlug = new URLSearchParams(window.location.search).get('slug');
            const storageKey = `comments_${movieSlug}`;
            let comments = JSON.parse(localStorage.getItem(storageKey) || '[]');

            const parentIndex = comments.findIndex(c => c.id.toString() === parentId.toString());
            if (parentIndex !== -1 && comments[parentIndex].replies) {
                comments[parentIndex].replies = comments[parentIndex].replies.filter(r => r.id.toString() !== replyId.toString());
                localStorage.setItem(storageKey, JSON.stringify(comments));
            }
        } catch (e) { console.error(e); }
    }

    loadComments() {
        try {
            const movieSlug = new URLSearchParams(window.location.search).get('slug');
            if (!movieSlug) return;
            const storageKey = `comments_${movieSlug}`;
            const comments = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            if (comments.length === 0) {
                this.boxComment.innerHTML = '<div class="text-white-50 text-center py-3">Chưa có bình luận nào.</div>';
                return;
            }

            this.boxComment.innerHTML = '';
            comments.forEach(comment => {
                this.addCommentToUI(comment, false);
            });
        } catch (e) { console.error(e); }
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const commentTime = new Date(timestamp);
        const diffMs = now - commentTime;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        const diffHours = Math.floor(diffMs / 3600000);
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return commentTime.toLocaleDateString('vi-VN');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearAllComments() {
        if (confirm('Bạn có chắc muốn xóa tất cả?')) {
            const movieSlug = new URLSearchParams(window.location.search).get('slug');
            localStorage.removeItem(`comments_${movieSlug}`);
            this.boxComment.innerHTML = '<div class="text-white-50 text-center py-3">Chưa có bình luận nào.</div>';
        }
    }
}

export let commentManager = null;

export function initCommentManager() {
    commentManager = new CommentManager();
    window.commentManager = commentManager;
    return commentManager;
}