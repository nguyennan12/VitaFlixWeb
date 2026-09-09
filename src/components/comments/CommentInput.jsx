import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ASSETS } from '../../config/constants';

export function CommentInput({ onSubmit, placeholder = 'Viết bình luận của bạn...' }) {
  const { user, isLoggedIn } = useAuth();
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(!isLoggedIn);

  const maxChars = 1000;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const authorName = (!isAnonymous && isLoggedIn && user?.fullname)
      ? user.fullname
      : (!isAnonymous && isLoggedIn && user?.username)
      ? user.username
      : 'Vô Danh';

    const authorAvatar = (!isAnonymous && isLoggedIn && user?.avatar)
      ? user.avatar
      : ASSETS.DEFAULT_AVATAR_3;

    onSubmit({
      content: content.trim(),
      author: authorName,
      avatar: authorAvatar,
      isAnonymous
    });

    setContent('');
  };

  const handleToggleAnonymous = () => {
    if (!isLoggedIn) return;
    setIsAnonymous(!isAnonymous);
  };

  const displayAvatar = (!isAnonymous && isLoggedIn && user?.avatar)
    ? user.avatar
    : ASSETS.DEFAULT_AVATAR_3;

  const displayName = (!isAnonymous && isLoggedIn)
    ? user?.fullname || user?.username
    : 'Vô Danh';

  return (
    <form className="comment-input-box" onSubmit={handleSubmit}>
      <div className="comment-input-header">
        <div className="comment-author-preview">
          <img src={displayAvatar} alt="Avatar" className="comment-author-avatar" onError={(e) => { e.currentTarget.src = ASSETS.DEFAULT_AVATAR_3; }} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-white)' }}>
            {displayName}
          </span>
        </div>

        {isLoggedIn && (
          <button
            type="button"
            className="anonymous-toggle-btn"
            onClick={handleToggleAnonymous}
            title="Đổi chế độ ẩn danh / công khai"
          >
            <span>{isAnonymous ? 'Chế độ: Ẩn danh' : 'Chế độ: Công khai'}</span>
            <i className="fa-solid fa-rotate ms-1" />
          </button>
        )}
      </div>

      <textarea
        className="comment-textarea"
        placeholder={placeholder}
        value={content}
        maxLength={maxChars}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />

      <div className="comment-input-footer">
        <span className="char-counter">
          {content.length} / {maxChars}
        </span>

        <button type="submit" className="btn-send-comment" disabled={!content.trim()}>
          <span>Gửi</span>
          <i className="fa-solid fa-paper-plane" />
        </button>
      </div>
    </form>
  );
}
