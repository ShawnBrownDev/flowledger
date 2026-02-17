'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createPaycheck } from '@/app/actions/paychecks';

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function WandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4V2" />
      <path d="M15 16v-2" />
      <path d="M8 9h2" />
      <path d="M20 9h2" />
      <path d="M17.8 11.8 19 13" />
      <path d="M15 9h0" />
      <path d="M17.8 6.2 19 5" />
      <path d="m3 21 9-9" />
      <path d="M12.2 6.2 11 5" />
    </svg>
  );
}

export function AddPaycheckForm() {
  const router = useRouter();
  const [payDate, setPayDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [netAmount, setNetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createPaycheck(payDate, parseFloat(netAmount) || 0);
      setNetAmount('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add');
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setPayDate(new Date().toISOString().slice(0, 10));
    setNetAmount('');
    setError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="pay_date" className="block text-sm font-medium text-stone-600 mb-1.5">
            Pay date
          </label>
          <div className="relative">
            <input
              id="pay_date"
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              required
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 pr-10 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
            />
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label htmlFor="net_amount" className="block text-sm font-medium text-stone-600 mb-1.5">
            Net amount
          </label>
          <div className="flex rounded-lg border border-stone-200 bg-stone-50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-400">
            <span className="flex items-center px-3 text-sm text-stone-500 bg-stone-100 border-r border-stone-200">
              USD
            </span>
            <input
              id="net_amount"
              type="number"
              step="0.01"
              min="0"
              value={netAmount}
              onChange={(e) => setNetAmount(e.target.value)}
              required
              placeholder="0.00"
              className="flex-1 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 bg-transparent focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-stone-600 mb-1.5">
            Frequency
          </label>
          <select
            id="frequency"
            className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="once">One time</option>
            <option value="weekly">Every week</option>
            <option value="biweekly">Every 2 weeks</option>
            <option value="monthly">Every month</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <WandIcon className="w-4 h-4" />
          Auto-apply to future months
        </button>
        <div className="flex gap-2 ml-auto">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Adding…' : '+ Add paycheck'}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
