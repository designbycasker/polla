export const runtime = 'edge';

import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabase';
import PostCard from '@/components/features/PostCard';
import styles from './feed.module.css';

const CATEGORIES = ['전체', '정치', '사회', '게임', '스포츠', '연예', '자유'];

async function getPosts(category?: string) {
  try {
    let query = getSupabaseAdmin()
      .from('posts')
      .select('id, title, content, category, like_count, comment_count, is_poll, created_at, users(name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(30);

    if (category && category !== '전체') query = query.eq('category', category);

    const { data } = await query;
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const posts = await getPosts(category);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Polla</h1>
        <Link href="/post/new" className={styles.writeBtn}>
          <PlusIcon /> 글쓰기
        </Link>
      </header>

      <div className={styles.categories}>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={cat === '전체' ? '/feed' : `/feed?category=${encodeURIComponent(cat)}`}
            className={`${styles.categoryChip} ${(!category && cat === '전체') || category === cat ? styles.categoryChipActive : ''}`}
          >
            {cat}
          </Link>
        ))}
      </div>

      <main className={styles.list}>
        {posts.length === 0 ? (
          <div className={styles.empty}>
            <p>아직 글이 없어요</p>
            <p>첫 번째 글을 올려보세요!</p>
          </div>
        ) : (
          posts.map((post) => {
            const user = Array.isArray(post.users) ? post.users[0] : post.users;
            return (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                content={post.content}
                category={post.category}
                authorName={user?.name ?? '익명'}
                authorAvatar={user?.avatar_url ?? null}
                likeCount={post.like_count}
                commentCount={post.comment_count}
                createdAt={post.created_at}
                isPoll={post.is_poll}
              />
            );
          })
        )}
      </main>

      <nav className={styles.tabBar}>
        <Link href="/feed" className={`${styles.tabItem} ${styles.active}`}>
          <HomeIcon /><span>홈</span>
        </Link>
        <Link href="/search" className={styles.tabItem}>
          <SearchIcon /><span>검색</span>
        </Link>
        <Link href="/post/new" className={styles.tabItemCenter}>
          <PlusIcon />
        </Link>
        <Link href="/notifications" className={styles.tabItem}>
          <BellIcon /><span>알림</span>
        </Link>
        <Link href="/profile" className={styles.tabItem}>
          <PersonIcon /><span>프로필</span>
        </Link>
      </nav>
    </div>
  );
}

function PlusIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function HomeIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>;
}
function SearchIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function BellIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function PersonIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
