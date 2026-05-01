export const runtime = 'edge';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import PollSection from './PollSection';
import CommentSection from './CommentSection';
import styles from './post-detail.module.css';

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const db = getSupabaseAdmin();

  const { data: post } = await db
    .from('posts')
    .select('*, users(name, avatar_url)')
    .eq('id', id)
    .single();

  if (!post) notFound();

  const user = Array.isArray(post.users) ? post.users[0] : post.users;

  let pollData = null;
  if (post.is_poll) {
    const { data: poll } = await db
      .from('polls')
      .select('id, question, poll_options(id, text, display_order)')
      .eq('post_id', id)
      .single();

    if (poll) {
      const { data: votes } = await db
        .from('poll_votes')
        .select('option_id, gender, age_group, region, political_leaning')
        .eq('poll_id', poll.id);

      let myVote: string | null = null;
      if (session?.user?.id) {
        const { data: myVoteData } = await db
          .from('poll_votes')
          .select('option_id')
          .eq('poll_id', poll.id)
          .eq('user_id', session.user.id)
          .single();
        myVote = myVoteData?.option_id ?? null;
      }

      const options = (poll.poll_options as { id: string; text: string; display_order: number }[])
        .sort((a, b) => a.display_order - b.display_order);

      pollData = { pollId: poll.id, question: poll.question, options, votes: votes ?? [], myVote };
    }
  }

  const { data: comments } = await db
    .from('comments')
    .select('id, content, created_at, users(name, avatar_url)')
    .eq('post_id', id)
    .order('created_at', { ascending: true })
    .limit(50);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/feed" className={styles.backBtn}><BackIcon /></Link>
        <h1 className={styles.headerTitle}>글</h1>
      </header>

      <div className={styles.content}>
        <article className={styles.postBody}>
          <div className={styles.postMeta}>
            <div className={styles.postAuthor}>
              <Avatar src={user?.avatar_url} name={user?.name ?? '익명'} size="small" />
              <span className={styles.postAuthorName}>{user?.name ?? '익명'}</span>
            </div>
            <span className={styles.postTime}>{timeAgo(post.created_at)}</span>
            <Badge variant="neutral" size="small">{post.category}</Badge>
          </div>

          <h2 className={styles.postTitle}>{post.title}</h2>
          <p className={styles.postContent}>{post.content}</p>

          <div className={styles.postActions}>
            <button className={styles.actionBtn}>
              <HeartIcon /> {post.like_count}
            </button>
            <button className={styles.actionBtn}>
              <CommentIcon /> {post.comment_count}
            </button>
          </div>
        </article>

        {pollData && (
          <PollSection
            pollId={pollData.pollId}
            options={pollData.options}
            votes={pollData.votes}
            myVote={pollData.myVote}
          />
        )}

        <CommentSection
          postId={id}
          comments={(comments ?? []).map(c => {
            const cu = Array.isArray(c.users) ? c.users[0] : c.users;
            return { id: c.id, content: c.content, createdAt: c.created_at, authorName: cu?.name ?? '익명', authorAvatar: cu?.avatar_url ?? null };
          })}
        />
      </div>
    </div>
  );
}

function BackIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,18 9,12 15,6"/></svg>;
}
function HeartIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}
function CommentIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
