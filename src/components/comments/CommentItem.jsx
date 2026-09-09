import React, { useState } from 'react';
import { formatTimeAgo } from '../../utils/format';
import { CommentInput } from './CommentInput';
import { ASSETS } from '../../config/constants';

export function CommentItem({ comment, onLike, onDislike, onReply, onDelete, isReply = false }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [reactionState, setReactionState] = useState({
    liked: comment.isLiked || false,
    disliked: comment.isDisliked || false,
    likesCount: comment.likes || 0,
    dislikesCount: comment.dislikes || 0
  });

  const handleLike = () => {
    setReactionState((prev) => {
      let newLikes = prev.likesCount;
      let newDislikes = prev.dislikesCount;
      const isCurrentlyLiked = prev.liked;

      if (isCurrentlyLiked) {
        newLikes = Math.max(0, newLikes - 1);
      } else {
        newLikes += 1;
        if (prev.disliked) {
          newDislikes = Math.max(0, newDislikes - 1);
        }
      }

      return {
        liked: !isCurrentlyLiked,
        disliked: false,
        likesCount: newLikes,
        dislikesCount: newDislikes
      };
    });
    if (onLike) onLike(comment.id);
  };

  const handleDislike = () => {
    setReactionState((prev) => {
      let newLikes = prev.likesCount;
      let newDislikes = prev.dislikesCount;
      const isCurrentlyDisliked = prev.disliked;

      if (isCurrentlyDisliked) {
        newDislikes = Math.max(0, newDislikes - 1);
      } else {
        newDislikes += 1;
        if (prev.liked) {
          newLikes = Math.max(0, newLikes - 1);
        }
      }

      return {
        liked: false,
        disliked: !isCurrentlyDisliked,
        likesCount: newLikes,
        dislikesCount: newDislikes
      };
    });
    if (onDislike) onDislike(comment.id);
  };

  const handleAddReply = (replyData) => {
    if (onReply) {
      onReply(comment.id, replyData);
    }
    setShowReplyInput(false);
  };

  return (
    <div className="comment-item">
      <img
        src={comment.avatar || ASSETS.DEFAULT_AVATAR_3}
        alt={comment.author}
        className="comment-avatar"
        onError={(e) => { e.currentTarget.src = ASSETS.DEFAULT_AVATAR_3; }}
      />

      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author-name">{comment.author || 'Vô Danh'}</span>
          <span className="comment-time">{formatTimeAgo(comment.timestamp)}</span>
        </div>

        <p className="comment-text">{comment.content}</p>

        {/* Action buttons */}
        <div className="comment-actions">
          {/* Like */}
          <button
            className={`comment-act-btn ${reactionState.liked ? 'active-like' : ''}`}
            onClick={handleLike}
            title="Thích"
          >
            <i className={`fa-${reactionState.liked ? 'solid' : 'regular'} fa-thumbs-up`} />
            <span>{reactionState.likesCount}</span>
          </button>

          {/* Dislike */}
          <button
            className={`comment-act-btn ${reactionState.disliked ? 'active-dislike' : ''}`}
            onClick={handleDislike}
            title="Không thích"
          >
            <i className={`fa-${reactionState.disliked ? 'solid' : 'regular'} fa-thumbs-down`} />
            <span>{reactionState.dislikesCount}</span>
          </button>

          {/* Reply Toggle */}
          {!isReply && (
            <button
              className="comment-act-btn"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              <i className="fa-solid fa-reply" />
              <span>Trả lời</span>
            </button>
          )}

          {/* Delete */}
          {onDelete && (
            <button
              className="comment-act-btn"
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
                  onDelete(comment.id);
                }
              }}
              title="Xóa bình luận"
              style={{ marginLeft: 'auto' }}
            >
              <i className="fa-solid fa-trash text-muted" />
            </button>
          )}
        </div>

        {/* Reply Input Box */}
        {showReplyInput && (
          <div style={{ marginTop: '12px' }}>
            <CommentInput
              placeholder={`Trả lời ${comment.author}...`}
              onSubmit={handleAddReply}
            />
          </div>
        )}

        {/* Nested Replies List */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies-list">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply={true}
                onDelete={onDelete ? () => onDelete(comment.id, reply.id) : null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
