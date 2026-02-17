'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function MonthPicker({ currentLabel }: { currentLabel: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monthParam = searchParams.get('month');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const months: { value: string; label: string }[] = [];
  for (let i = -6; i <= 0; i++) {
    const d = new Date(currentYear, currentMonth + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    months.push({ value, label });
  }
  months.reverse();

  const value = monthParam || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    if (!v) return;
    router.push(`/dashboard?month=${v}`);
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      className="rounded-lg border border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
      aria-label="Select month"
    >
      {months.map((m) => (
        <option key={m.value} value={m.value}>
          {m.label}
        </option>
      ))}
    </select>
  );
}
