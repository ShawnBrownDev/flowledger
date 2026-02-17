import { getAuthUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  getPaycheckMetrics,
  getPaycheckImpact,
  getMonthlyIncomeLast6Months,
} from '@/lib/aggregations';
import { PaycheckList } from './PaycheckList';
import { AddPaycheckForm } from './AddPaycheckForm';
import { PaycheckMetrics } from './PaycheckMetrics';
import { PaycheckImpactCard } from './PaycheckImpactCard';
import { AutomationCard } from './AutomationCard';

export default async function PaychecksPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const userId = await getAuthUserId();
  const params = await searchParams;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [paychecks, metrics, impact, incomeLast6] = await Promise.all([
    prisma.paycheck.findMany({
      where: { userId },
      orderBy: { payDate: 'desc' },
    }),
    getPaycheckMetrics(userId),
    getPaycheckImpact(userId, year, month),
    getMonthlyIncomeLast6Months(userId),
  ]);

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Paychecks
          </h1>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            Recurring income
          </span>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            defaultValue="month"
            aria-label="View period"
          >
            <option value="month">This month</option>
            <option value="quarter">This quarter</option>
          </select>
          <button
            type="button"
            className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4" />
            Export
          </button>
          <a
            href="#add-paycheck"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            + New paycheck
          </a>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Metric cards */}
        <PaycheckMetrics metrics={metrics} />

        {/* Two-column: Schedule | Impact + Automation */}
        <div className="grid lg:grid-cols-[1fr,380px] gap-6">
          {/* Left: Paycheck schedule */}
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-semibold text-stone-900">
                  Paycheck schedule
                </h2>
                <p className="text-sm text-stone-500 mt-0.5">
                  Manage recurring income and see how it lands over the month.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 flex items-center gap-2 shrink-0"
              >
                <MenuIcon className="w-4 h-4" />
                Configure cadence
              </button>
            </div>

            <div id="add-paycheck" className="scroll-mt-6">
              <AddPaycheckForm />
            </div>

            <PaycheckList
              paychecks={paychecks.map((p) => ({
                id: p.id,
                pay_date: p.payDate.toISOString().slice(0, 10),
                net_amount: Number(p.netAmount),
              }))}
            />
          </section>

          {/* Right: Impact + Automation */}
          <div className="space-y-6">
            <PaycheckImpactCard
              impact={impact}
              incomeLast6={incomeLast6}
            />
            <AutomationCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}
