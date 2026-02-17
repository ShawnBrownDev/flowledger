'use client';

const METRICS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function PaycheckMetrics({
  metrics,
}: {
  metrics: {
    monthToDate: number;
    pctChange: number | null;
    average: number;
    nextPaycheck: {
      date: Date;
      amount: number;
      daysUntil: number;
    } | null;
  };
}) {
  const nextLabel = metrics.nextPaycheck
    ? metrics.nextPaycheck.daysUntil <= 0
      ? 'Today'
      : metrics.nextPaycheck.daysUntil === 1
        ? 'in 1 day'
        : `in ${metrics.nextPaycheck.daysUntil} days`
    : '—';

  const nextDate = metrics.nextPaycheck?.date;
  const nextDateObj = nextDate ? (typeof nextDate === 'string' ? new Date(nextDate) : nextDate) : null;
  const nextDateStr = nextDateObj
    ? `${METRICS[nextDateObj.getMonth()]} ${nextDateObj.getDate()}`
    : '—';

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Month-to-date */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-stone-500">
              Month-to-date paycheck total
            </p>
            <p className="text-2xl font-bold text-stone-900 mt-1">
              ${metrics.monthToDate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {metrics.pctChange != null && (
              <p
                className={`text-sm font-medium mt-1 ${
                  metrics.pctChange >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {metrics.pctChange >= 0 ? '↑' : '↓'}
                {Math.abs(metrics.pctChange).toFixed(1)}% vs last month
              </p>
            )}
          </div>
          <div className="rounded-lg bg-stone-100 p-2 shrink-0">
            <WalletIcon className="w-5 h-5 text-stone-600" />
          </div>
        </div>
      </div>

      {/* Average paycheck */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-stone-500">
              Average paycheck
            </p>
            <p className="text-2xl font-bold text-stone-900 mt-1">
              ${metrics.average.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-stone-400 mt-1">vs last month</p>
          </div>
          <div className="rounded-lg bg-emerald-100 p-2 shrink-0">
            <DollarIcon className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Next confirmed paycheck */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-stone-500">
              Next confirmed paycheck
            </p>
            <p className="text-2xl font-bold text-stone-900 mt-1">
              {nextDateStr}
            </p>
            <p className="text-sm text-stone-400 mt-1">{nextLabel}</p>
          </div>
          <div className="rounded-lg bg-stone-100 p-2 shrink-0">
            <CalendarIcon className="w-5 h-5 text-stone-600" />
          </div>
        </div>
      </div>
    </section>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
