'use client';

import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOutAction } from '@/app/actions/auth';

const THEME_STORAGE_KEY = 'flowledger-theme';

function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function HelpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function UserMenu({ userInitial }: { userInitial: string }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(stored === 'dark' || (stored !== 'light' && systemDark));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  function toggleDark(enabled: boolean) {
    setDark(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, enabled ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', enabled);
    }
  }

  async function handleSignOut() {
    await signOutAction();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        aria-expanded={menuOpen}
        aria-haspopup="true"
      >
        {userInitial}
      </button>
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute left-0 right-0 bottom-full mb-1 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg z-50 min-w-[10rem]"
          role="menu"
        >
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 rounded-t-lg"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
          >
            <GearIcon />
            Settings
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
          >
            <HelpIcon />
            Help Center
          </Link>
          <div
            className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700"
            role="none"
          >
            <span>Dark mode</span>
            {mounted ? (
              <button
                type="button"
                role="switch"
                aria-checked={dark}
                onClick={(e) => { e.preventDefault(); toggleDark(!dark); }}
                className={`relative inline-flex h-6 w-10 shrink-0 rounded-full border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  dark ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                    dark ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            ) : (
              <div className="h-6 w-10 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
            )}
          </div>
          <button
            type="button"
            onClick={() => { setMenuOpen(false); handleSignOut(); }}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 rounded-b-lg text-left"
            role="menuitem"
          >
            <LogoutIcon />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
