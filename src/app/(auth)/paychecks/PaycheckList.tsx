'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updatePaycheck, deletePaycheck as deletePaycheckAction } from '@/app/actions/paychecks';

interface PaycheckRow {
  id: string;
  pay_date: string;
  net_amount: number;
}

export function PaycheckList({ paychecks }: { paychecks: PaycheckRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(p: PaycheckRow) {
    setEditingId(p.id);
    setEditDate(p.pay_date);
    setEditAmount(String(p.net_amount));
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDate('');
    setEditAmount('');
    setError(null);
  }

  async function saveEdit() {
    if (!editingId) return;
    setError(null);
    setSaving(true);
    try {
      await updatePaycheck(editingId, {
        payDate: editDate,
        netAmount: parseFloat(editAmount) || 0,
      });
      cancelEdit();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function deletePaycheck(id: string) {
    setError(null);
    setDeleting(true);
    setDeleteConfirmId(null);
    try {
      await deletePaycheckAction(id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  }

  function formatDate(isoDate: string) {
    const d = new Date(isoDate + 'T12:00:00');
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (paychecks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/50 py-12 text-center">
        <p className="text-sm text-stone-500">No paychecks yet. Add one above.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50">
            <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Pay date
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Net amount
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Status
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {paychecks.map((p) => (
            <tr key={p.id} className="hover:bg-stone-50/50">
              <td className="py-3 px-4">
                {editingId === p.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="rounded border border-stone-200 px-2 py-1.5 text-sm"
                    />
                  </div>
                ) : (
                  <span className="text-stone-800">{formatDate(p.pay_date)}</span>
                )}
              </td>
              <td className="py-3 px-4 text-right">
                {editingId === p.id ? (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="rounded border border-stone-200 px-2 py-1.5 text-sm w-24 text-right"
                  />
                ) : (
                  <span className="font-semibold text-stone-900 tabular-nums">
                    ${Number(p.net_amount).toFixed(2)}
                  </span>
                )}
              </td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-stone-600">Posted</span>
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                {editingId === p.id ? (
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={saving}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={saving}
                      className="text-sm font-medium text-stone-500 hover:text-stone-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : deleteConfirmId === p.id ? (
                  <span className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => deletePaycheck(p.id)}
                      disabled={deleting}
                      className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      {deleting ? '…' : 'Confirm'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      disabled={deleting}
                      className="text-sm font-medium text-stone-500 hover:text-stone-700"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(p.id)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && (
        <p className="px-4 py-2 text-sm text-red-600 bg-red-50">{error}</p>
      )}
    </div>
  );
}
