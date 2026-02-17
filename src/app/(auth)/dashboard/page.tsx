import { auth } from '@/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import {
  getMonthlyIncome,
  getTotalBillsForMonth,
  getTotalSavings,
  getTotalTransactionsForMonth,
  getDebtsWithSnapshots,
  getSpendingByCategory,
  getMonthlyIncomeLast6Months,
} from '@/lib/aggregations';
import { CashFlowChart, SpendingByCategoryChart } from '@/app/(auth)/dashboard/DashboardCharts';
import { MonthPicker } from '@/app/(auth)/dashboard/MonthPicker';

function parseMonthParam(monthParam: string | null) {
  const now = new Date();
  if (!monthParam || !/^\d{4}-\d{2}$/.test(monthParam)) {
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const [y, m] = monthParam.split('-').map(Number);
  if (m < 1 || m > 12) return { year: now.getFullYear(), month: now.getMonth() + 1 };
  return { year: y, month: m };
}

function prevMonth(year: number, month: number) {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user;

  const params = await searchParams;
  const { year, month } = parseMonthParam(params.month ?? null);
  const prev = prevMonth(year, month);
  const currentMonthLabel = monthLabel(year, month);

  const [income, prevIncome, totalBills, totalSavings, totalTransactions, debts, spendingByCategory, incomeLast6] =
    await Promise.all([
      getMonthlyIncome(user.id, year, month),
      getMonthlyIncome(user.id, prev.year, prev.month),
      getTotalBillsForMonth(user.id),
      getTotalSavings(user.id),
      getTotalTransactionsForMonth(user.id, year, month),
      getDebtsWithSnapshots(user.id, year, month),
      getSpendingByCategory(user.id, year, month),
      getMonthlyIncomeLast6Months(user.id),
    ]);

  const incomeNum = Number(income);
  const prevIncomeNum = Number(prevIncome);
  const billsNum = Number(totalBills);
  const savingsNum = Number(totalSavings);
  const transactionsNum = Number(totalTransactions);
  const remaining = incomeNum - billsNum - savingsNum - transactionsNum;
  const totalSpendingForDonut = spendingByCategory.reduce((s, x) => s + x.total, 0);
  const totalDebt = debts.reduce((s, d) => s + Number(d.balance), 0);

  const incomeChange = prevIncomeNum > 0
    ? ((incomeNum - prevIncomeNum) / prevIncomeNum) * 100
    : null;
  const incomeChangeStr = incomeChange != null
    ? (incomeChange > 0 ? `↑${incomeChange.toFixed(0)}%` : incomeChange < 0 ? `↓${Math.abs(incomeChange).toFixed(0)}%` : '— 0%') + ' vs last'
    : '— vs last month';

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Overview</h1>
          <Suspense fallback={<span className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600">{currentMonthLabel}</span>}>
            <MonthPicker currentLabel={currentMonthLabel} />
          </Suspense>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/paychecks"
            className="rounded-lg border-2 border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            + Add Income
          </Link>
          <Link
            href="/bills"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            + Add Bill
          </Link>
        </div>
      </header>

      <div className="p-6 space-y-8">
        {/* Hero: Remaining Cash */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-600 p-8 shadow-xl shadow-teal-900/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
          <div className="relative">
            <p className="text-teal-100/90 text-sm font-medium mb-1">Remaining this month</p>
            <p className={`text-4xl sm:text-5xl font-bold tracking-tight ${remaining >= 0 ? 'text-white' : 'text-red-100'}`}>
              ${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={`mt-2 text-sm font-medium ${remaining >= 0 ? 'text-teal-100' : 'text-red-200'}`}>
              {remaining >= 0 ? 'Safe to spend after all bills' : 'Over budget — review bills'}
            </p>
          </div>
        </section>

        {/* Metric cards */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Income"
            value={incomeNum}
            subtitle={incomeChangeStr}
            trend={incomeChange}
            icon={<TrendUpIcon />}
            href="/paychecks"
            accent="income"
          />
          <MetricCard
            title="Bills"
            value={billsNum}
            subtitle="This month"
            icon={<DocumentIcon />}
            href="/bills"
          />
          <MetricCard
            title="Savings"
            value={savingsNum}
            subtitle="Monthly goal"
            icon={<PiggyIcon />}
            href="/savings"
          />
          <MetricCard
            title="Spending"
            value={transactionsNum}
            subtitle="This month"
            icon={<ReceiptIcon />}
            href="/transactions"
          />
          <MetricCard
            title="Total Debt"
            value={totalDebt}
            subtitle={debts.length > 0 ? `${debts.length} accounts` : 'Debt free'}
            icon={<ScaleIcon />}
            href="/debts"
            accent="debt"
          />
        </section>

        {/* Cash Flow + Debts side by side */}
        <div className="grid lg:grid-cols-2 gap-6">
          <CashFlowChart incomeLast6={incomeLast6} />

          {/* Debts panel */}
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-stone-900">Debts</h2>
              <Link
                href="/debts"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Manage →
              </Link>
            </div>
            {debts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <CheckIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="font-medium text-stone-900">Debt free!</p>
                <p className="text-sm text-stone-500 mt-1">Track loans and credit cards to see payoff progress.</p>
                <Link
                  href="/debts"
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Add debt
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-stone-50 px-4 py-3">
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total owed</p>
                  <p className="text-2xl font-bold text-stone-900">${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <ul className="space-y-3">
                  {debts.slice(0, 5).map((d) => (
                    <li key={d.id} className="flex justify-between items-center">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-stone-900 truncate">{d.name}</p>
                        {d.snapshot && Number(d.snapshot.interestApplied) > 0 && (
                          <p className="text-xs text-stone-500">+${Number(d.snapshot.interestApplied).toFixed(2)} interest</p>
                        )}
                      </div>
                      <p className="font-semibold text-stone-900 ml-3 shrink-0">${Number(d.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </li>
                  ))}
                </ul>
                {debts.length > 5 && (
                  <Link href="/debts" className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View all {debts.length} debts →
                  </Link>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Spending by category - full width */}
        <SpendingByCategoryChart
          spendingByCategory={spendingByCategory}
          totalSpendingForDonut={totalSpendingForDonut}
        />
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  href,
  accent,
}: {
  title: string;
  value: number;
  subtitle: string;
  trend?: number | null;
  icon: React.ReactNode;
  href?: string;
  accent?: 'debt' | 'income';
}) {
  const isDebt = accent === 'debt';
  const isIncome = accent === 'income';
  const iconBg = isDebt ? 'bg-red-100 text-red-600' : isIncome ? 'bg-blue-100 text-blue-600' : 'bg-stone-100 text-stone-600';
  const className = `block rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md transition-all ${
    href ? 'hover:border-stone-300' : ''
  } ${isDebt ? 'bg-red-50/80 border-red-100' : ''}`;

  const content = (
    <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-500">{title}</p>
          <p className={`mt-1 text-xl font-bold ${isDebt ? 'text-red-700' : 'text-stone-900'}`}>
            ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`mt-0.5 text-xs ${trend != null ? (trend >= 0 ? 'text-emerald-600' : 'text-red-600') : 'text-stone-400'}`}>
            {subtitle}
          </p>
        </div>
        <div className={`rounded-lg p-2 shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
  );

  if (href) {
    return <Link href={href} className={className}>{content}</Link>;
  }
  return <div className={className}>{content}</div>;
}

function TrendUpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 7-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </svg>
  );
}
function DocumentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}
function PiggyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 11c-.83 0-1.58.21-2.27.57l-2.28-4.54A2 2 0 0 0 12.76 6H9.24a2 2 0 0 0-1.69.93L5.27 11.57A4.92 4.92 0 0 0 5 11c-2.76 0-5 2.24-5 5s2.24 5 5 5h14c2.76 0 5-2.24 5-5s-2.24-5-5-5Z" />
      <path d="M9 14h6" />
    </svg>
  );
}
function ScaleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}
function ReceiptIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </svg>
  );
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
