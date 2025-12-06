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

    setupSendButton() {
        this.btnSend.addEventListener('click', () => { this.sendComment(); });
        this.txtComment.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') { this.sendComment(); }
        });
    }

    sendComment() {
        const content = this.txtComment.value.trim();
        if (!content) { alert('Vui lòng nhập nội dung!'); return; }

        const comment = {
            id: Date.now(),
            content: content,
            author: this.isAnonymous ? 'Vô Danh' : 'Người dùng',
            avatar: this.isAnonymous ? '/assets/images/VitaFlix.png' : '/assets/images/user-avatar.png',
            timestamp: new Date().toISOString(),
            movieSlug: new URLSearchParams(window.location.search).get('slug'),
            likes: 0,
            dislikes: 0,
            isLiked: false,
            isDisliked: false,
            replies: []
        };

        this.addCommentToUI(comment);
        this.saveComment(comment);
        
        this.txtComment.value = '';
        this.charCounter.textContent = '0';
    }

    setupCommentActions() {
        this.boxComment.addEventListener('click', (e) => {
            const target = e.target.closest('.like-btn, .dislike-btn, .reply-btn, .more-btn, .delete-item, .btn-submit-reply');
            
            if (!target) {
                document.querySelectorAll('.more-menu.show').forEach(m => m.classList.remove('show'));
                return;
            }

            const commentItem = target.closest('.viewer-comment'); 
            const replyItem = target.closest('.reply-item');
            const parentItem = replyItem ? replyItem : commentItem;
            
            const commentId = parentItem.getAttribute(replyItem ? 'data-reply-id' : 'data-comment-id');

            if (target.classList.contains('like-btn')) {
                const countSpan = target.querySelector('span');
                let count = parseInt(countSpan.innerText);
                
                if (target.classList.contains('active-reaction')) {
                    count--;
                    target.classList.remove('active-reaction');
                } else {
                    count++;
                    target.classList.add('active-reaction');
                    const dislikeBtn = parentItem.querySelector('.dislike-btn');
                    if (dislikeBtn && dislikeBtn.classList.contains('active-dislike')) {
                        dislikeBtn.classList.remove('active-dislike');
                        let dCount = parseInt(dislikeBtn.querySelector('span').innerText);
                        dislikeBtn.querySelector('span').innerText = Math.max(0, dCount - 1);
                    }
                }
                countSpan.innerText = count;
            }

            if (target.classList.contains('dislike-btn')) {
                const countSpan = target.querySelector('span');
                let count = parseInt(countSpan.innerText);

                if (target.classList.contains('active-dislike')) {
                    count--;
                    target.classList.remove('active-dislike');
                } else {
                    count++;
                    target.classList.add('active-dislike');
                    const likeBtn = parentItem.querySelector('.like-btn');
                    if (likeBtn && likeBtn.classList.contains('active-reaction')) {
                        likeBtn.classList.remove('active-reaction');
                        let lCount = parseInt(likeBtn.querySelector('span').innerText);
                        likeBtn.querySelector('span').innerText = Math.max(0, lCount - 1);
                    }
                }
                countSpan.innerText = count;
            }

            if (target.classList.contains('more-btn')) {
                const menu = parentItem.querySelector('.more-menu');
                document.querySelectorAll('.more-menu.show').forEach(m => {
                    if(m !== menu) m.classList.remove('show');
                });
                if(menu) menu.classList.toggle('show');
            }

            if (target.classList.contains('delete-item')) {
                if (confirm('Xóa bình luận này?')) {
                    parentItem.style.opacity = '0';
                    setTimeout(() => {
                        parentItem.remove();
                        if (!replyItem) {
                            this.deleteCommentFromStorage(commentId);
                        } else {
                            const rootComment = replyItem.closest('.viewer-comment');
                            const rootId = rootComment.getAttribute('data-comment-id');
                            this.deleteReplyFromStorage(rootId, commentId);
                        }
                        this.checkEmptyState();
                    }, 300);
                }
            }

            if (target.classList.contains('reply-btn')) {
                // Chỉ cho phép reply ở comment cha
                if (replyItem) return;

                let replyBox = commentItem.querySelector('.reply-input-box');
                if (!replyBox) {
                    const replyHtml = `
                        <div class="reply-input-box">
                            <input type="text" placeholder="Viết câu trả lời...">
                            <button class="btn-submit-reply">Gửi</button>
                        </div>
                    `;
                    commentItem.querySelector('.place-viewer-comment').insertAdjacentHTML('beforeend', replyHtml);
                    commentItem.querySelector('.reply-input-box input').focus();
                } else {
                    replyBox.remove();
                }
            }

            if (target.classList.contains('btn-submit-reply')) {
                const input = target.previousElementSibling;
                const content = input.value.trim();
                
                if (content) {
                    const reply = {
                        id: Date.now(),
                        content: content,
                        author: this.isAnonymous ? 'Vô Danh' : 'Người dùng',
                        avatar: this.isAnonymous ? '/assets/images/VitaFlix.png' : '/assets/images/user-avatar.png',
                        timestamp: new Date().toISOString(),
                        likes: 0,
                        dislikes: 0
                    };
                    
                    this.addReplyToUI(commentItem, reply);
                    
                    const rootId = commentItem.getAttribute('data-comment-id');
                    this.saveReply(rootId, reply);

                    target.parentElement.remove();
                } else {
                    alert('Vui lòng nhập nội dung!');
                }
            }
        });
    }

    addCommentToUI(comment, prepend = true) {
        const emptyMsg = this.boxComment.querySelector('.no-comments-msg');
        if (emptyMsg) emptyMsg.remove();

        const timeAgo = this.getTimeAgo(comment.timestamp);
        
        const html = `
            <div class="viewer-comment" data-comment-id="${comment.id}" style="transition: opacity 0.3s;">
                <div class="avatar-show-comment">
                    <div class="avatar">
                        <img src="${comment.avatar}" onerror="this.src='/assets/images/VitaFlix.png'">
                    </div>
                </div>
                <div class="place-viewer-comment">
                    <div class="name-comment">
                        <span>${comment.author}</span>
                        <p>${timeAgo}</p>
                    </div>
                    <div class="content-comment">
                        <div class="comment-content-text">${this.escapeHtml(comment.content)}</div>
                    </div>
                    <div class="react-comment">
                        <p class="like-btn">
                            <i class="fa-regular fa-thumbs-up"></i><span>${comment.likes || 0}</span>
                        </p>
                        <p class="dislike-btn">
                            <i class="fa-regular fa-thumbs-down"></i><span>${comment.dislikes || 0}</span>
                        </p>
                        <p class="reply-btn">
                            <i class="fa-solid fa-reply"></i><span>Trả lời</span>
                        </p>
                        <p class="more-btn">
                            <i class="fa-solid fa-ellipsis"></i>
                        </p>
                        
                        <div class="more-menu">
                            <div class="more-menu-item delete-item">
                                <i class="fa-solid fa-trash"></i> Xóa
                            </div>
                        </div>
                    </div> 
                    <div class="list-replies"></div>
                </div>
            </div>
        `;

        if (prepend) {
            this.boxComment.insertAdjacentHTML('afterbegin', html);
        } else {
            this.boxComment.insertAdjacentHTML('beforeend', html);
        }

        if (comment.replies && comment.replies.length > 0) {
            const addedComment = this.boxComment.querySelector(`.viewer-comment[data-comment-id="${comment.id}"]`);
            if (addedComment) {
                comment.replies.forEach(reply => this.addReplyToUI(addedComment, reply));
            }
        }
    }

    addReplyToUI(parentCommentElement, reply) {
        const repliesContainer = parentCommentElement.querySelector('.list-replies');
        const timeAgo = this.getTimeAgo(reply.timestamp);

        const replyHtml = `
            <div class="reply-item" data-reply-id="${reply.id}" style="transition: opacity 0.3s;">
                <div class="reply-avatar">
                    <img src="${reply.avatar}" onerror="this.src='/assets/images/VitaFlix.png'">
                </div>
                <div class="reply-content-block">
                    <div class="reply-header">
                        <span class="reply-author">${reply.author}</span>
                        <span class="reply-time">${timeAgo}</span>
                    </div>
                    <div class="reply-text">${this.escapeHtml(reply.content)}</div>
                    
                    <div class="react-comment">
                        <p class="like-btn">
                            <i class="fa-regular fa-thumbs-up"></i><span>${reply.likes || 0}</span>
                        </p>
                        <p class="dislike-btn">
                            <i class="fa-regular fa-thumbs-down"></i><span>${reply.dislikes || 0}</span>
                        </p>
                        <p class="more-btn">
                            <i class="fa-solid fa-ellipsis"></i>
                        </p>
                        
                        <div class="more-menu">
                            <div class="more-menu-item delete-item">
                                <i class="fa-solid fa-trash"></i> Xóa
                            </div>
                        </div>
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
            localStorage.setItem(storageKey, JSON.stringify(comments));
        } catch (e) { console.error(e); }
    }

    saveReply(parentId, reply) {
        try {
            const movieSlug = new URLSearchParams(window.location.search).get('slug');
            const storageKey = `comments_${movieSlug}`;
            let comments = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            const index = comments.findIndex(c => c.id.toString() === parentId.toString());
            if (index !== -1) {
                if(!comments[index].replies) comments[index].replies = [];
                comments[index].replies.push(reply);
                localStorage.setItem(storageKey, JSON.stringify(comments));
            }
        } catch (e) { console.error(e); }
    }

    deleteCommentFromStorage(id) {
        try {
            const movieSlug = new URLSearchParams(window.location.search).get('slug');
            const storageKey = `comments_${movieSlug}`;
            let comments = JSON.parse(localStorage.getItem(storageKey) || '[]');
            comments = comments.filter(c => c.id.toString() !== id.toString());
            localStorage.setItem(storageKey, JSON.stringify(comments));
        } catch (e) { console.error(e); }
    }

    deleteReplyFromStorage(parentId, replyId) {
        try {
            const movieSlug = new URLSearchParams(window.location.search).get('slug');
            const storageKey = `comments_${movieSlug}`;
            let comments = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            const index = comments.findIndex(c => c.id.toString() === parentId.toString());
            if (index !== -1 && comments[index].replies) {
                comments[index].replies = comments[index].replies.filter(r => r.id.toString() !== replyId.toString());
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
                this.checkEmptyState();
                return;
            }

            this.boxComment.innerHTML = '';
            comments.forEach(comment => {
                this.addCommentToUI(comment, false); 
            });
        } catch (e) { console.error(e); }
    }

    checkEmptyState() {
        if (this.boxComment.children.length === 0) {
            this.boxComment.innerHTML = `
                <div class="no-comments-msg" style="text-align: center; padding: 40px; color: #666; font-style: italic;">
                    <i class="fa-regular fa-comment" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                    <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                </div>
            `;
        }
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
}

export let commentManager = null;

export function initCommentManager() {
    commentManager = new CommentManager();
    window.commentManager = commentManager;
    return commentManager;
}