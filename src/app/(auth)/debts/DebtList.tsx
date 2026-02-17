'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateDebt, deleteDebt as deleteDebtAction } from '@/app/actions/debts';
import type { PaymentFrequency } from '@/lib/types';

const FREQUENCIES: { value: PaymentFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
];

interface Snapshot {
  interest_applied: number;
  payments_applied: number;
}

interface DebtRow {
  id: string;
  name: string;
  apr: number;
  balance: number;
  min_payment: number;
  payment_frequency: string;
  snapshot: Snapshot | null;
}

function monthlyPayment(minPayment: number, frequency: string): number {
  switch (frequency) {
    case 'weekly': return minPayment * 4.33;
    case 'biweekly': return minPayment * 2.17;
    default: return minPayment;
  }
}

function payoffEstimate(d: DebtRow): string {
  const balance = Number(d.balance);
  const apr = Number(d.apr);
  const monthly = monthlyPayment(Number(d.min_payment), d.payment_frequency);
  const monthlyInterest = balance * (apr / 12);
  const net = monthly - monthlyInterest;
  if (net <= 0 || balance <= 0) return 'Increase payments to pay down';
  const months = balance / net;
  if (months > 1200) return 'Paid off in 100+ years';
  const date = new Date();
  date.setMonth(date.getMonth() + Math.ceil(months));
  return `Paid off by ${date.toLocaleDateString('default', { month: 'short', year: 'numeric' })}`;
}

export function DebtList({ debts }: { debts: DebtRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editApr, setEditApr] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [editMinPayment, setEditMinPayment] = useState('');
  const [editFrequency, setEditFrequency] = useState<PaymentFrequency>('monthly');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(d: DebtRow) {
    setEditingId(d.id);
    setEditName(d.name);
    setEditApr((Number(d.apr) * 100).toFixed(2));
    setEditBalance(String(d.balance));
    setEditMinPayment(String(d.min_payment));
    setEditFrequency(d.payment_frequency as PaymentFrequency);
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
      await updateDebt(editingId, {
        name: editName.trim(),
        apr: parseFloat(editApr) / 100 || 0,
        balance: parseFloat(editBalance) || 0,
        minPayment: parseFloat(editMinPayment) || 0,
        paymentFrequency: editFrequency,
      });
      cancelEdit();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function deleteDebt(id: string) {
    setError(null);
    setDeleting(true);
    setDeleteConfirmId(null);
    try {
      await deleteDebtAction(id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  }

  if (debts.length === 0) {
    return (
      <p className="text-sm text-gray-500">No debts yet. Add one above.</p>
    );
  }

  return (
    <ul className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {debts.map((d) => (
        <li key={d.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          {editingId === d.id ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Name"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">APR %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editApr}
                    onChange={(e) => setEditApr(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Balance</label>
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
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Min payment</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editMinPayment}
                    onChange={(e) => setEditMinPayment(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Frequency</label>
                  <select
                    value={editFrequency}
                    onChange={(e) => setEditFrequency(e.target.value as PaymentFrequency)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
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
                  <h3 className="font-medium text-gray-900">{d.name}</h3>
                  <p className="text-xs text-gray-500">
                    APR {(Number(d.apr) * 100).toFixed(2)}% · Min ${Number(d.min_payment).toFixed(2)}/{d.payment_frequency}
                  </p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <p className="font-semibold text-gray-900">${Number(d.balance).toFixed(2)}</p>
                  <span className="text-xs text-gray-500">balance</span>
                  <button type="button" onClick={() => startEdit(d)} className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    Edit
                  </button>
                  {deleteConfirmId === d.id ? (
                    <span className="flex gap-1">
                      <button type="button" onClick={() => deleteDebt(d.id)} disabled={deleting} className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700">Yes, delete</button>
                      <button type="button" onClick={() => setDeleteConfirmId(null)} disabled={deleting} className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600">Cancel</button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => setDeleteConfirmId(d.id)} className="rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                  )}
                </div>
              </div>
              {d.snapshot && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 flex gap-4">
                  <span>Interest this month: ${Number(d.snapshot.interest_applied).toFixed(2)}</span>
                  <span>Payments this month: ${Number(d.snapshot.payments_applied).toFixed(2)}</span>
                </div>
              )}
              <p className="mt-2 text-xs text-teal-600 font-medium">{payoffEstimate(d)}</p>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
