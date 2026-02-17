import { getAuthUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { BillList } from './BillList';
import { AddBillForm } from './AddBillForm';

export default async function BillsPage() {
  const userId = await getAuthUserId();

  const [bills, debts] = await Promise.all([
    prisma.bill.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' },
      include: { debt: { select: { name: true } } },
    }),
    prisma.debt.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Bills</h1>
        <p className="text-sm text-gray-500">
        Bills auto-created from debts use the monthly payment amount. Mark paid to apply payment and reduce the debt.
      </p>
      </header>

      <AddBillForm debts={debts} />
      <BillList
        bills={bills.map((b) => ({
          id: b.id,
          name: b.name,
          category: b.category,
          due_date: b.dueDate,
          monthly_amount: Number(b.monthlyAmount),
          paid: b.paid,
          amount_paid: b.amountPaid != null ? Number(b.amountPaid) : null,
          debt_id: b.debtId,
          paid_month: b.paidMonth?.toISOString().slice(0, 10) ?? null,
          debts: b.debt ? { name: b.debt.name } : null,
        }))}
        debts={debts}
      />
    </div>
  );
}
