import { auth } from '@/auth';
import { redirect } from 'next/navigation';

/** Get current user id; redirects to /login if not authenticated. Use in server actions and RSC. */
export async function getAuthUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  return session.user.id;
}
