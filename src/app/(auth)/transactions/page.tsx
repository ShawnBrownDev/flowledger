import { getAuthUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { TransactionList } from '@/app/(auth)/transactions/TransactionList';
import { AddTransactionForm } from '@/app/(auth)/transactions/AddTransactionForm';
import { TransactionsSidebar } from '@/app/(auth)/transactions/TransactionsSidebar';

const THIS_MONTH_START = (year: number, month: number) =>
  new Date(year, month - 1, 1);
const THIS_MONTH_END = (year: number, month: number) =>
  new Date(year, month, 0);

function getCategoryBreakdown(
  transactions: { category: string | null; amount: unknown }[]
): { category: string; total: number }[] {
  const byCategory = new Map<string, number>();
  for (const t of transactions) {
    const cat = t.category || 'Other';
    const amount = Number(t.amount);
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + amount);
  }
  return Array.from(byCategory.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const userId = await getAuthUserId();
  const params = await searchParams;
  const monthParam = params.month ?? null;
  const now = new Date();
  const year = monthParam && /^\d{4}-\d{2}$/.test(monthParam)
    ? parseInt(monthParam.slice(0, 4), 10)
    : now.getFullYear();
  const month = monthParam && /^\d{4}-\d{2}$/.test(monthParam)
    ? parseInt(monthParam.slice(5, 7), 10)
    : now.getMonth() + 1;

  const start = THIS_MONTH_START(year, month);
  const end = THIS_MONTH_END(year, month);

  const transactions = await prisma.expense.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
    },
    orderBy: { date: 'desc' },
  });

  const monthLabel = new Date(year, month - 1, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const categoryBreakdown = getCategoryBreakdown(transactions);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-10 border-b border-stone-200/80 dark:border-stone-700/50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
              Transactions
            </h1>
            <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
              Log day-to-day spending by category. Shown in dashboard spending breakdown.
            </p>
          </div>
        </div>
      </header>

      <div className="p-6 flex flex-col lg:flex-row gap-8 lg:gap-10">
        <div className="flex-1 min-w-0">
          <AddTransactionForm />
          <TransactionList
            transactions={transactions.map((t) => ({
              id: t.id,
              date: t.date.toISOString().slice(0, 10),
              amount: Number(t.amount),
              category: t.category,
              description: t.description,
            }))}
            currentMonthLabel={monthLabel}
            year={year}
            month={month}
          />
        </div>
        <TransactionsSidebar
          categoryBreakdown={categoryBreakdown}
          total={total}
          isEmpty={transactions.length === 0}
        />
      </div>
    </div>
  );
}
