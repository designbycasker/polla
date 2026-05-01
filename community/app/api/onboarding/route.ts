export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { Gender, AgeGroup, PoliticalLeaning } from '@/lib/database.types';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: {
    nickname: string;
    gender: Gender;
    age_group: AgeGroup;
    region: string;
    political_leaning: PoliticalLeaning;
  } = await req.json();

  const { error } = await getSupabaseAdmin()
    .from('users')
    .update({
      name: body.nickname.trim(),
      gender: body.gender,
      age_group: body.age_group,
      region: body.region,
      political_leaning: body.political_leaning,
      onboarding_completed: true,
    })
    .eq('id', session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
