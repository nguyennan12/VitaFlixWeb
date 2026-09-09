import React, { useState, useEffect } from 'react';
import { storage } from '../../services/storage';
import { STORAGE_KEYS } from '../../config/constants';
import { CommentInput } from './CommentInput';
import { CommentItem } from './CommentItem';

export function CommentSection({ movieSlug }) {
  const storageKey = `${STORAGE_KEYS.COMMENTS_PREFIX}${movieSlug}`;
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!movieSlug) return;
    const saved = storage.get(storageKey, []);
    setComments(saved);
  }, [movieSlug, storageKey]);

  const handleAddComment = (commentData) => {
    const newComment = {
      id: Date.now().toString(),
      content: commentData.content,
      author: commentData.author,
      avatar: commentData.avatar,
      isAnonymous: commentData.isAnonymous,
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      replies: []
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    storage.set(storageKey, updated);
  };

  const handleAddReply = (commentId, replyData) => {
    const newReply = {
      id: Date.now().toString(),
      content: replyData.content,
      author: replyData.author,
      avatar: replyData.avatar,
      isAnonymous: replyData.isAnonymous,
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0
    };

    const updated = comments.map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newReply]
        };
      }
      return c;
    });

    setComments(updated);
    storage.set(storageKey, updated);
  };

  const handleDelete = (commentId, replyId = null) => {
    let updated;
    if (replyId) {
      // Delete nested reply
      updated = comments.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: (c.replies || []).filter((r) => r.id !== replyId)
          };
        }
        return c;
      });
    } else {
      // Delete top-level comment
      updated = comments.filter((c) => c.id !== commentId);
    }

    setComments(updated);
    storage.set(storageKey, updated);
  };

  return (
    <div className="comments-section">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h3 style={{ fontSize: '20px', color: 'var(--text-white)', margin: 0 }}>
          <i className="fa-solid fa-comments text-cyan me-2" />
          Bình Luận ({comments.length})
        </h3>
      </div>

      {/* Input box */}
      <CommentInput onSubmit={handleAddComment} />

      {/* Comments List */}
      {comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
          <i className="fa-regular fa-comment-dots" style={{ fontSize: '36px', opacity: 0.3, marginBottom: '10px' }} />
          <p style={{ margin: 0, fontSize: '14px' }}>Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!</p>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleAddReply}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
