'use client';

import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import styles from './post-detail.module.css';

type Comment = { id: string; content: string; createdAt: string; authorName: string; authorAvatar: string | null };

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function CommentSection({ postId, comments: initial }: { postId: string; comments: Comment[] }) {
  const [comments, setComments] = useState(initial);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim() }),
      });
      if (res.ok) {
        const { comment } = await res.json();
        setComments(prev => [...prev, comment]);
        setText('');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.commentsSection}>
      <h3 className={styles.commentsSectionTitle}>댓글 {comments.length}</h3>
      <div className={styles.commentInputRow}>
        <textarea
          className={styles.commentInput}
          placeholder="댓글을 입력해주세요"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={2}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
        />
        <button
          className={styles.commentSubmitBtn}
          onClick={handleSubmit}
          disabled={!text.trim() || submitting}
        >
          등록
        </button>
      </div>
      <div className={styles.commentsList}>
        {comments.map(c => (
          <div key={c.id} className={styles.commentItem}>
            <Avatar src={c.authorAvatar} name={c.authorName} size="small" />
            <div className={styles.commentBody}>
              <div className={styles.commentAuthorRow}>
                <span className={styles.commentAuthorName}>{c.authorName}</span>
                <span className={styles.commentTime}>{timeAgo(c.createdAt)}</span>
              </div>
              <p className={styles.commentContent}>{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
