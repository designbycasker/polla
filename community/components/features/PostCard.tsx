import Link from 'next/link';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import styles from './PostCard.module.css';

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  authorAvatar?: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isPoll?: boolean;
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function PostCard({
  id, title, content, category,
  authorName, authorAvatar,
  likeCount, commentCount, createdAt, isPoll,
}: PostCardProps) {
  return (
    <Link href={`/post/${id}`} className={styles.card}>
      <div className={styles.header}>
        <div className={styles.badges}>
          <Badge variant="neutral" size="small">{category}</Badge>
          {isPoll && <span className={styles.pollBadge}><PollIcon /> 투표</span>}
        </div>
        <span className={styles.time}>{timeAgo(createdAt)}</span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.content}>{content}</p>
      <div className={styles.footer}>
        <div className={styles.author}>
          <Avatar src={authorAvatar} name={authorName} size="xsmall" />
          <span className={styles.authorName}>{authorName}</span>
        </div>
        <div className={styles.stats}>
          <span className={styles.stat}>
            <HeartIcon /> {likeCount}
          </span>
          <span className={styles.stat}>
            <CommentIcon /> {commentCount}
          </span>
        </div>
      </div>
    </Link>
  );
}

function PollIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="13" width="4" height="9" rx="1"/><rect x="9" y="8" width="4" height="14" rx="1"/><rect x="16" y="3" width="4" height="19" rx="1"/>
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
