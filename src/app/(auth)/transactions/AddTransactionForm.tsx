'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createTransaction } from '@/app/actions/transactions';

const CATEGORIES = [
  'Groceries',
  'Dining',
  'Entertainment',
  'Shopping',
  'Transportation',
  'Healthcare',
  'Subscriptions',
  'Other',
];

export function AddTransactionForm() {
  const router = useRouter();
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createTransaction({
        date,
        amount: parseFloat(amount) || 0,
        category,
        description: description.trim() || undefined,
      });
      setAmount('');
      setDescription('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add');
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    'w-full rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors';

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50 p-6 shadow-sm dark:shadow-none"
    >
      <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-4">
        Add transaction
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div>
          <label
            htmlFor="transaction_date"
            className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wider"
          >
            Date
          </label>
          <input
            id="transaction_date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={inputBase}
          />
        </div>
        <div>
          <label
            htmlFor="transaction_amount"
            className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wider"
          >
            Amount
          </label>
          <input
            id="transaction_amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="0.00"
            className={inputBase}
          />
        </div>
        <div>
          <label
            htmlFor="transaction_category"
            className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wider"
          >
            Category
          </label>
          <select
            id="transaction_category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputBase}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-2">
          <label
            htmlFor="transaction_description"
            className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wider"
          >
            Description
          </label>
          <input
            id="transaction_description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Coffee shop"
            className={inputBase}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-teal-600 hover:bg-teal-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-teal-900/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding…' : 'Add'}
        </button>
      </div>
      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  );
}
