'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  updateTransaction,
  deleteTransaction as deleteTransactionAction,
} from '@/app/actions/transactions';

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

function prevMonth(year: number, month: number) {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

function nextMonth(year: number, month: number) {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

interface TransactionRow {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string | null;
}

export function TransactionList({
  transactions,
  currentMonthLabel,
  year,
  month,
}: {
  transactions: TransactionRow[];
  currentMonthLabel: string;
  year: number;
  month: number;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prev = prevMonth(year, month);
  const next = nextMonth(year, month);

  function startEdit(t: TransactionRow) {
    setEditingId(t.id);
    setEditDate(t.date);
    setEditAmount(String(t.amount));
    setEditCategory(t.category);
    setEditDescription(t.description ?? '');
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDate('');
    setEditAmount('');
    setEditCategory('');
    setEditDescription('');
    setError(null);
  }

  async function saveEdit() {
    if (!editingId) return;
    setError(null);
    setSaving(true);
    try {
      await updateTransaction(editingId, {
        date: editDate,
        amount: parseFloat(editAmount) || 0,
        category: editCategory,
        description: editDescription.trim() || undefined,
      });
      cancelEdit();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function deleteTransaction(id: string) {
    setError(null);
    setDeleting(true);
    setDeleteConfirmId(null);
    try {
      await deleteTransactionAction(id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  }

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const inputBase =
    'rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500';

  return (
    <div>
      {/* Month navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="inline-flex items-center rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50 p-1 shadow-sm">
          <Link
            href={`/transactions?month=${prev.year}-${String(prev.month).padStart(2, '0')}`}
            className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
          >
            ← {new Date(prev.year, prev.month - 1, 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
          </Link>
          <span className="rounded-lg bg-teal-50 dark:bg-teal-900/30 px-4 py-2 text-sm font-semibold text-teal-700 dark:text-teal-300">
            {currentMonthLabel}
          </span>
          <Link
            href={`/transactions?month=${next.year}-${String(next.month).padStart(2, '0')}`}
            className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
          >
            {new Date(next.year, next.month - 1, 1).toLocaleString('default', { month: 'short', year: 'numeric' })} →
          </Link>
        </div>
        {transactions.length > 0 && (
          <div className="rounded-xl bg-stone-50 dark:bg-stone-800/50 px-4 py-2">
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Total
            </p>
            <p className="text-lg font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/30 py-12 px-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-stone-400 dark:text-stone-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-1">
            No transactions this month
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
            Add your first transaction using the form above to start tracking your spending.
          </p>
        </div>
      ) : (
        <ul className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50 shadow-sm overflow-hidden divide-y divide-stone-100 dark:divide-stone-800">
          {transactions.map((t) => (
            <li
              key={t.id}
              className="px-5 py-4 text-sm hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
            >
              {editingId === t.id ? (
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    id={`edit-date-${t.id}`}
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className={`${inputBase} w-36`}
                  />
                  <input
                    id={`edit-amount-${t.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className={`${inputBase} w-24`}
                  />
                  <select
                    id={`edit-category-${t.id}`}
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className={`${inputBase} w-36`}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    className={`${inputBase} flex-1 min-w-[140px]`}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={saving}
                      className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={saving}
                      className="rounded-lg border border-stone-200 dark:border-stone-600 px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  {error && (
                    <p className="w-full text-sm text-red-600 dark:text-red-400">{error}</p>
                  )}
                </div>
              ) : (
                <div className="flex justify-between items-center gap-4">
                  <div className="min-w-0 flex-1 flex items-center gap-3">
                    <span className="text-stone-500 dark:text-stone-400 tabular-nums shrink-0">
                      {new Date(t.date + 'Z').toLocaleDateString('default', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="rounded-md bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-xs font-medium text-stone-700 dark:text-stone-300 shrink-0">
                      {t.category}
                    </span>
                    {t.description && (
                      <span className="text-stone-600 dark:text-stone-400 truncate">
                        {t.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
                      ${t.amount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(t)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
                      >
                        Edit
                      </button>
                      {deleteConfirmId === t.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => deleteTransaction(t.id)}
                            disabled={deleting}
                            className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {deleting ? '…' : 'Delete'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            disabled={deleting}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(t.id)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
