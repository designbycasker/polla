export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { postId } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: '내용을 입력해주세요' }, { status: 400 });

  const db = getSupabaseAdmin();

  const { data: comment, error } = await db
    .from('comments')
    .insert({ post_id: postId, user_id: session.user.id, content: content.trim() })
    .select('id, content, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: user } = await db
    .from('users')
    .select('name, avatar_url')
    .eq('id', session.user.id)
    .single();

  return NextResponse.json({
    comment: {
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      authorName: user?.name ?? '익명',
      authorAvatar: user?.avatar_url ?? null,
    },
  });
}
