import { getAuthUserId } from '@/lib/auth';
import { getDebtsWithSnapshots } from '@/lib/aggregations';
import { DebtList } from './DebtList';
import { AddDebtForm } from './AddDebtForm';

export default async function DebtsPage() {
  const userId = await getAuthUserId();

  const now = new Date();
  const debtsRaw = await getDebtsWithSnapshots(
    userId,
    now.getFullYear(),
    now.getMonth() + 1
  );
  const debts = debtsRaw.map((d) => ({
    id: d.id,
    name: d.name,
    apr: Number(d.apr),
    balance: Number(d.balance),
    min_payment: Number(d.minPayment),
    payment_frequency: d.paymentFrequency,
    snapshot: d.snapshot
      ? {
          interest_applied: Number(d.snapshot.interestApplied),
          payments_applied: Number(d.snapshot.paymentsApplied),
        }
      : null,
  }));

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Debts</h1>
        <p className="text-sm text-gray-500">Credit cards and loans. Interest is applied monthly.</p>
      </header>

      <AddDebtForm />
      <DebtList debts={debts} />
    </div>
  );
}
