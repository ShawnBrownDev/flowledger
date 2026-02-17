import { getAuthUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SavingsList } from './SavingsList';
import { AddSavingsForm } from './AddSavingsForm';

export default async function SavingsPage() {
  const userId = await getAuthUserId();

  const savings = await prisma.savings.findMany({
    where: { userId },
    orderBy: { goalName: 'asc' },
    select: {
      id: true,
      goalName: true,
      monthlyContribution: true,
      balance: true,
      targetAmount: true,
    },
  });

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Savings</h1>
        <p className="text-sm text-gray-500">Goals and monthly contributions.</p>
      </header>

      <AddSavingsForm />
      <SavingsList
        savings={savings.map((s) => ({
          id: s.id,
          goal_name: s.goalName,
          monthly_contribution: Number(s.monthlyContribution),
          balance: Number(s.balance),
          target_amount: s.targetAmount != null ? Number(s.targetAmount) : null,
        }))}
      />
    </div>
  );
}
