'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createBill } from '@/app/actions/bills';

const CATEGORIES = ['Housing', 'Utilities', 'Debt', 'Insurance', 'Transport', 'Other'];

interface DebtOption {
  id: string;
  name: string;
}

export function AddBillForm({ debts }: { debts: DebtOption[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Other');
  const [dueDate, setDueDate] = useState('1');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [debtId, setDebtId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createBill({
        name: name.trim(),
        category,
        dueDate: parseInt(dueDate, 10) || 1,
        monthlyAmount: parseFloat(monthlyAmount) || 0,
        debtId: category === 'Debt' && debtId ? debtId : null,
      });
      setName('');
      setMonthlyAmount('');
      setDebtId('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-medium text-gray-700 mb-3">Add bill</h2>
      <div className="space-y-3">
        <div>
          <label htmlFor="bill_name" className="block text-xs text-gray-500 mb-1">Name</label>
          <input
            id="bill_name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Rent"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="category" className="block text-xs text-gray-500 mb-1">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="due_date" className="block text-xs text-gray-500 mb-1">Due date (day)</label>
            <input
              id="due_date"
              type="number"
              min="1"
              max="31"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
            />
          </div>
        </div>
        <div>
          <label htmlFor="monthly_amount" className="block text-xs text-gray-500 mb-1">Monthly amount ($)</label>
          <input
            id="monthly_amount"
            type="number"
            step="0.01"
            min="0"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(e.target.value)}
            required
            placeholder="0"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
          />
        </div>
        {category === 'Debt' && debts.length > 0 && (
          <div>
            <label htmlFor="debt_id" className="block text-xs text-gray-500 mb-1">Link to debt</label>
            <select
              id="debt_id"
              value={debtId}
              onChange={(e) => setDebtId(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
            >
              <option value="">— Select debt —</option>
              {debts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding…' : 'Add bill'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
