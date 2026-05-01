export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request, { params }: { params: Promise<{ pollId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { pollId } = await params;
  const { option_id } = await req.json();
  const db = getSupabaseAdmin();

  const { data: user } = await db
    .from('users')
    .select('gender, age_group, region, political_leaning')
    .eq('id', session.user.id)
    .single();

  const { data: vote, error } = await db
    .from('poll_votes')
    .insert({
      poll_id: pollId,
      option_id,
      user_id: session.user.id,
      gender: user?.gender ?? null,
      age_group: user?.age_group ?? null,
      region: user?.region ?? null,
      political_leaning: user?.political_leaning ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ vote });
}
