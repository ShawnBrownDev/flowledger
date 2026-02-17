'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateSavings, deleteSavings as deleteSavingsAction } from '@/app/actions/savings';

interface SavingsRow {
  id: string;
  goal_name: string;
  monthly_contribution: number;
  balance: number;
  target_amount?: number | null;
}

export function SavingsList({ savings }: { savings: SavingsRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editContribution, setEditContribution] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(s: SavingsRow) {
    setEditingId(s.id);
    setEditName(s.goal_name);
    setEditContribution(String(s.monthly_contribution));
    setEditBalance(String(s.balance));
    setEditTarget(s.target_amount != null ? String(s.target_amount) : '');
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setError(null);
  }

  async function saveEdit() {
    if (!editingId) return;
    setError(null);
    setSaving(true);
    try {
      await updateSavings(editingId, {
        goalName: editName.trim(),
        monthlyContribution: parseFloat(editContribution) || 0,
        balance: parseFloat(editBalance) || 0,
        targetAmount: editTarget.trim() ? parseFloat(editTarget) || null : null,
      });
      cancelEdit();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSavings(id: string) {
    setError(null);
    setDeleting(true);
    setDeleteConfirmId(null);
    try {
      await deleteSavingsAction(id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  }

  if (savings.length === 0) {
    return (
      <p className="text-sm text-gray-500">No savings goals yet. Add one above.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {savings.map((s) => (
        <li key={s.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          {editingId === s.id ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Goal name"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Monthly ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editContribution}
                    onChange={(e) => setEditContribution(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Balance ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editBalance}
                    onChange={(e) => setEditBalance(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Target ($) optional</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                  placeholder="Leave empty for no target"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={saveEdit} disabled={saving} className="rounded bg-teal-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={cancelEdit} disabled={saving} className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{s.goal_name}</h3>
                  <p className="text-xs text-gray-500">${Number(s.monthly_contribution).toFixed(2)}/mo</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">${Number(s.balance).toFixed(2)}</p>
                  {s.target_amount != null && s.target_amount > 0 && (
                    <span className="text-xs text-gray-500">
                      / ${Number(s.target_amount).toFixed(0)} target
                    </span>
                  )}
                  <button type="button" onClick={() => startEdit(s)} className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    Edit
                  </button>
                  {deleteConfirmId === s.id ? (
                    <span className="flex gap-1">
                      <button type="button" onClick={() => deleteSavings(s.id)} disabled={deleting} className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700">Yes, delete</button>
                      <button type="button" onClick={() => setDeleteConfirmId(null)} disabled={deleting} className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600">Cancel</button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => setDeleteConfirmId(s.id)} className="rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                  )}
                </div>
              </div>
              {s.target_amount != null && s.target_amount > 0 && (
                <div className="mt-3">
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-500 transition-all"
                      style={{ width: `${Math.min(100, (Number(s.balance) / Number(s.target_amount)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((Number(s.balance) / Number(s.target_amount)) * 100)}% to goal
                  </p>
                </div>
              )}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
