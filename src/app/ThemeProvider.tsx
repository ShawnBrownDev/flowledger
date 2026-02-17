'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'flowledger-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as 'light' | 'dark' | null;
    const dark = stored === 'dark' || (stored !== 'light' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  if (!mounted) return <>{children}</>;
  return <>{children}</>;
}

export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as 'light' | 'dark' | null;
    const systemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setThemeState(stored === 'dark' || (stored !== 'light' && systemDark) ? 'dark' : 'light');
  }, []);

  function setTheme(value: 'light' | 'dark') {
    localStorage.setItem(STORAGE_KEY, value);
    document.documentElement.classList.toggle('dark', value === 'dark');
    setThemeState(value);
  }

  return { theme, setTheme };
}
