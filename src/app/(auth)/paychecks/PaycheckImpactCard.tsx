'use client';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function PaycheckImpactCard({
  impact,
  incomeLast6,
}: {
  impact: { projectedMonthEnd: number; billsCoveredPct: number };
  incomeLast6: { year: number; month: number; income: number }[];
}) {
  const maxIncome = Math.max(1, ...incomeLast6.map((x) => x.income));
  const chartHeight = 100;
  const chartWidth = 280;
  const padding = { top: 8, right: 8, bottom: 20, left: 36 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const points = incomeLast6.map((d, i) => {
    const x = padding.left + (i / Math.max(1, incomeLast6.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - (d.income / maxIncome) * innerHeight;
    return `${x},${y}`;
  });
  const linePath = points.length > 0 ? `M ${points.join(' L ')}` : '';
  const areaPath =
    linePath && points.length > 0
      ? `${linePath} L ${padding.left + innerWidth},${padding.top + innerHeight} L ${padding.left},${padding.top + innerHeight} Z`
      : '';

  const labels = incomeLast6.map((d) => MONTHS[d.month - 1]);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-stone-900">
          Paycheck impact
        </h2>
        <p className="text-sm text-stone-500 mt-0.5">
          How upcoming paychecks affect your cash runway.
        </p>
      </div>

      <div className="mt-4">
        <svg
          width="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="impactGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={areaPath}
            fill="url(#impactGrad)"
          />
          <path
            d={linePath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {labels.map((label, i) => (
            <text
              key={i}
              x={padding.left + (i / Math.max(1, labels.length - 1)) * innerWidth}
              y={chartHeight + 14}
              textAnchor="middle"
              className="fill-stone-500 text-[10px] font-medium"
            >
              {label}
            </text>
          ))}
        </svg>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-600">Projected month-end balance</span>
          <span className="font-semibold text-stone-900 tabular-nums">
            ${impact.projectedMonthEnd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-stone-600">Bills covered by paychecks</span>
            <span className="font-semibold text-stone-900 tabular-nums">
              {impact.billsCoveredPct}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, impact.billsCoveredPct)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
