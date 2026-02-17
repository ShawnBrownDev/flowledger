'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'flowledger-theme';

export function SettingsForm() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(stored === 'dark' || (stored !== 'light' && systemDark));
  }, []);

  function toggleDark(enabled: boolean) {
    setDark(enabled);
    localStorage.setItem(STORAGE_KEY, enabled ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', enabled);
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Dark mode</span>
        <div className="h-6 w-10 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center justify-between gap-4 py-2 cursor-pointer">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark mode</span>
        <button
          type="button"
          role="switch"
          aria-checked={dark}
          onClick={() => toggleDark(!dark)}
          className={`relative inline-flex h-6 w-10 shrink-0 rounded-full border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
            dark ? 'bg-teal-500' : 'bg-gray-200 dark:bg-gray-600'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
              dark ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </label>
    </div>
  );
}
