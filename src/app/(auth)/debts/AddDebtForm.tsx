'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createDebt } from '@/app/actions/debts';
import type { PaymentFrequency } from '@/lib/types';

const FREQUENCIES: { value: PaymentFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function AddDebtForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [apr, setApr] = useState('');
  const [balance, setBalance] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createDebt({
        name: name.trim(),
        apr: parseFloat(apr) / 100 || 0,
        balance: parseFloat(balance) || 0,
        minPayment: parseFloat(minPayment) || 0,
        paymentFrequency,
      });
      setName('');
      setApr('');
      setBalance('');
      setMinPayment('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-medium text-gray-700 mb-3">Add debt</h2>
      <div className="space-y-3">
        <div>
          <label htmlFor="debt_name" className="block text-xs text-gray-500 mb-1">Name</label>
          <input
            id="debt_name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Chase Card"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="apr" className="block text-xs text-gray-500 mb-1">APR (%)</label>
            <input
              id="apr"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={apr}
              onChange={(e) => setApr(e.target.value)}
              required
              placeholder="29.99"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
            />
          </div>
          <div>
            <label htmlFor="balance" className="block text-xs text-gray-500 mb-1">Balance ($)</label>
            <input
              id="balance"
              type="number"
              step="0.01"
              min="0"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              required
              placeholder="0"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="min_payment" className="block text-xs text-gray-500 mb-1">Min payment ($)</label>
            <input
              id="min_payment"
              type="number"
              step="0.01"
              min="0"
              value={minPayment}
              onChange={(e) => setMinPayment(e.target.value)}
              required
              placeholder="0"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
            />
          </div>
          <div>
            <label htmlFor="frequency" className="block text-xs text-gray-500 mb-1">Payment frequency</label>
            <select
              id="frequency"
              value={paymentFrequency}
              onChange={(e) => setPaymentFrequency(e.target.value as PaymentFrequency)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding…' : 'Add debt'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
