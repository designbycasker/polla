export const runtime = 'edge';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { data } = await getSupabaseAdmin()
    .from('users')
    .select('onboarding_completed')
    .eq('id', session.user.id)
    .single();

  if (!data?.onboarding_completed) redirect('/onboarding');
  redirect('/feed');
}
