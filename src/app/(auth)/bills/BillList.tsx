'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updateBill, deleteBill as deleteBillAction, updateBillPaid } from '@/app/actions/bills';

const CATEGORIES = ['Housing', 'Utilities', 'Debt', 'Insurance', 'Transport', 'Other'];

interface DebtOption {
  id: string;
  name: string;
}

interface BillRow {
  id: string;
  name: string;
  category: string;
  due_date: number;
  monthly_amount: number;
  paid: boolean;
  amount_paid: number | null;
  debt_id: string | null;
  paid_month: string | null;
  debts: { name: string } | null;
}

function isDueSoon(dueDate: number): boolean {
  const now = new Date();
  const today = now.getDate();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const due = Math.min(dueDate, lastDay);
  const daysUntil = due - today;
  return daysUntil >= 0 && daysUntil <= 7;
}

export function BillList({ bills, debts }: { bills: BillRow[]; debts: DebtOption[] }) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editMonthlyAmount, setEditMonthlyAmount] = useState('');
  const [editDebtId, setEditDebtId] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(b: BillRow) {
    setEditingId(b.id);
    setEditName(b.name);
    setEditCategory(b.category);
    setEditDueDate(String(b.due_date));
    setEditMonthlyAmount(String(b.monthly_amount));
    setEditDebtId(b.debt_id ?? '');
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
      await updateBill(editingId, {
        name: editName.trim(),
        category: editCategory,
        dueDate: parseInt(editDueDate, 10) || 1,
        monthlyAmount: parseFloat(editMonthlyAmount) || 0,
        debtId: editCategory === 'Debt' && editDebtId ? editDebtId : null,
      });
      cancelEdit();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function deleteBill(id: string) {
    setError(null);
    setDeleting(true);
    setDeleteConfirmId(null);
    try {
      await deleteBillAction(id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  }

  async function togglePaid(bill: BillRow, paid: boolean, amountPaid?: string) {
    setUpdating(bill.id);
    const now = new Date();
    const paidMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    try {
      await updateBillPaid(
        bill.id,
        paid,
        paid && amountPaid !== undefined ? parseFloat(amountPaid) || null : null,
        paid ? paidMonth : null
      );
      router.refresh();
    } finally {
      setUpdating(null);
    }
  }

  if (bills.length === 0) {
    return <p className="text-sm text-gray-500">No bills yet. Add one above.</p>;
  }

  return (
    <ul className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {bills.map((b) => (
        <li key={b.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          {editingId === b.id ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Name"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  placeholder="Due day"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                />
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editMonthlyAmount}
                onChange={(e) => setEditMonthlyAmount(e.target.value)}
                placeholder="Monthly amount"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
              />
              {editCategory === 'Debt' && debts.length > 0 && (
                <select
                  value={editDebtId}
                  onChange={(e) => setEditDebtId(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                >
                  <option value="">— Select debt —</option>
                  {debts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{b.name}</h3>
                    {isDueSoon(b.due_date) && !b.paid && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">Due soon</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {b.category} · Due day {b.due_date} · ${Number(b.monthly_amount).toFixed(2)}/mo
                    {b.debt_id && b.debts && ` · ${b.debts.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className={`text-sm font-medium ${b.paid ? 'text-green-600' : 'text-gray-500'}`}>
                    {b.paid ? 'Paid' : 'Unpaid'}
                  </span>
                  <PaidToggle bill={b} debts={debts} updating={updating === b.id} onToggle={togglePaid} />
                  <button type="button" onClick={() => startEdit(b)} className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    Edit
                  </button>
                  {deleteConfirmId === b.id ? (
                    <span className="flex gap-1">
                      <button type="button" onClick={() => deleteBill(b.id)} disabled={deleting} className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50">Yes, delete</button>
                      <button type="button" onClick={() => setDeleteConfirmId(null)} disabled={deleting} className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                    </span>
                  ) : (
                    <button type="button" onClick={() => setDeleteConfirmId(b.id)} className="rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                  )}
                </div>
              </div>
              {b.paid && b.amount_paid != null && (
                <p className="text-xs text-gray-600 mt-1">Amount paid: ${Number(b.amount_paid).toFixed(2)}</p>
              )}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

function PaidToggle({
  bill,
  debts,
  updating,
  onToggle,
}: {
  bill: BillRow;
  debts: DebtOption[];
  updating: boolean;
  onToggle: (bill: BillRow, paid: boolean, amountPaid?: string) => void;
}) {
  const [showAmount, setShowAmount] = useState(false);
  const defaultAmount =
    bill.amount_paid != null ? String(bill.amount_paid) : bill.debt_id ? String(bill.monthly_amount) : '';
  const [amountPaid, setAmountPaid] = useState(defaultAmount);

  if (bill.paid) {
    return (
      <button
        type="button"
        onClick={() => onToggle(bill, false)}
        disabled={updating}
        className="text-xs text-red-600 hover:underline disabled:opacity-50"
      >
        Mark unpaid
      </button>
    );
  }

  if (showAmount) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          step="0.01"
          min="0"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          placeholder="Amount"
          className="w-20 rounded border border-gray-300 px-2 py-1 text-xs text-gray-900 placeholder:text-gray-400 bg-white"
        />
        <button
          type="button"
          onClick={() => {
            onToggle(bill, true, amountPaid);
            setShowAmount(false);
          }}
          disabled={updating}
          className="text-xs text-blue-600 hover:underline disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setShowAmount(false)}
          className="text-xs text-gray-500 hover:underline"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Debt-linked bills: one-click Mark paid (uses monthly amount, reduces debt)
  if (bill.debt_id) {
    return (
      <button
        type="button"
        onClick={() => onToggle(bill, true, String(bill.monthly_amount))}
        disabled={updating}
        className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        Mark paid
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowAmount(true)}
      disabled={updating}
      className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
    >
      Mark paid
    </button>
  );
}
