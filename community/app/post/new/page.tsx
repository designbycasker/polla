import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import PostForm from './PostForm';

export default async function PostNewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  return <PostForm />;
}
