import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="p-6 max-w-lg">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Preferences and account.</p>
      </header>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
        <p className="text-sm text-gray-600 dark:text-gray-400">Signed in as <strong className="text-gray-900 dark:text-gray-100">{session.user.email}</strong></p>
      </div>
    </div>
  );
}
