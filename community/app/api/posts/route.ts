export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: {
    title: string;
    content: string;
    category: string;
    is_poll: boolean;
    poll_question: string | null;
    poll_options: string[];
  } = await req.json();

  const db = getSupabaseAdmin();

  const { data: post, error: postError } = await db
    .from('posts')
    .insert({
      user_id: session.user.id,
      title: body.title,
      content: body.content,
      category: body.category,
      is_poll: body.is_poll,
    })
    .select('id')
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: postError?.message ?? '글 작성 실패' }, { status: 500 });
  }

  if (body.is_poll && body.poll_options.length >= 2) {
    const { data: poll, error: pollError } = await db
      .from('polls')
      .insert({
        post_id: post.id,
        question: body.poll_question || null,
      })
      .select('id')
      .single();

    if (pollError || !poll) {
      return NextResponse.json({ error: '투표 생성 실패' }, { status: 500 });
    }

    const { error: optionsError } = await db
      .from('poll_options')
      .insert(
        body.poll_options.map((text, i) => ({
          poll_id: poll.id,
          text,
          display_order: i,
        }))
      );

    if (optionsError) {
      return NextResponse.json({ error: '투표 선택지 생성 실패' }, { status: 500 });
    }
  }

  return NextResponse.json({ postId: post.id });
}
