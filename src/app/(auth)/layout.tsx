import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from './Sidebar';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userInitial = session.user.email?.[0]?.toUpperCase() ?? '?';
  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      <Sidebar userInitial={userInitial} />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto ml-56">
        {children}
      </main>
    </div>
  );
}
