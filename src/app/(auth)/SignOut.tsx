'use client';

import { useRouter } from 'next/navigation';
import { signOutAction } from '@/app/actions/auth';

export function SignOut() {
  const router = useRouter();

  async function handleSignOut() {
    await signOutAction();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="text-sm text-gray-500 hover:text-gray-700"
    >
      Sign out
    </button>
  );
}
