'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createSavings } from '@/app/actions/savings';

export function AddSavingsForm() {
  const router = useRouter();
  const [goalName, setGoalName] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [balance, setBalance] = useState('0');
  const [targetAmount, setTargetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createSavings({
        goalName: goalName.trim(),
        monthlyContribution: parseFloat(monthlyContribution) || 0,
        balance: parseFloat(balance) || 0,
        targetAmount: targetAmount.trim() ? parseFloat(targetAmount) || null : null,
      });
      setGoalName('');
      setMonthlyContribution('');
      setBalance('0');
      setTargetAmount('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-medium text-gray-700 mb-3">Add savings goal</h2>
      <div className="space-y-3">
        <div>
          <label htmlFor="goal_name" className="block text-xs text-gray-500 mb-1">Goal name</label>
          <input
            id="goal_name"
            type="text"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            required
            placeholder="e.g. Emergency fund"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="monthly_contribution" className="block text-xs text-gray-500 mb-1">Monthly contribution ($)</label>
            <input
              id="monthly_contribution"
              type="number"
              step="0.01"
              min="0"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              required
              placeholder="0"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
            />
          </div>
          <div>
            <label htmlFor="balance" className="block text-xs text-gray-500 mb-1">Current balance ($)</label>
            <input
              id="balance"
              type="number"
              step="0.01"
              min="0"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
            />
          </div>
        </div>
        <div>
          <label htmlFor="target_amount" className="block text-xs text-gray-500 mb-1">Target amount ($) optional</label>
          <input
            id="target_amount"
            type="number"
            step="0.01"
            min="0"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="e.g. 5000"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding…' : 'Add goal'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
