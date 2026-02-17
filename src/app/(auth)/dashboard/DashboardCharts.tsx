'use client';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Professional, accessible color palette for finance
const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#2563eb',
  Utilities: '#0891b2',
  Debt: '#b91c1c',
  Insurance: '#7c3aed',
  Transport: '#c2410c',
  Transportation: '#c2410c',
  Food: '#0d9488',
  Groceries: '#0d9488',
  Dining: '#ea580c',
  Entertainment: '#7c3aed',
  Shopping: '#2563eb',
  Healthcare: '#dc2626',
  Subscriptions: '#0891b2',
  Other: '#475569',
  Others: '#475569',
};

function getCategoryColor(category: string, index: number): string {
  return CATEGORY_COLORS[category] ?? ['#2563eb', '#0891b2', '#7c3aed', '#c2410c', '#475569'][index % 5];
}

function formatCurrency(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function CashFlowChart({
  incomeLast6,
}: {
  incomeLast6: { year: number; month: number; income: number }[];
}) {
  const maxIncome = Math.max(1, ...incomeLast6.map((x) => x.income));
  const chartHeight = 140;
  const chartWidth = 320;
  const padding = { top: 12, right: 12, bottom: 28, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const points = incomeLast6.map((d, i) => {
    const x = padding.left + (i / Math.max(1, incomeLast6.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - (d.income / maxIncome) * innerHeight;
    return `${x},${y}`;
  });
  const linePath = points.length > 0 ? `M ${points.join(' L ')}` : '';

  const labels = incomeLast6.map((d) => MONTHS[d.month - 1]);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-stone-900">Cash Flow</h2>
          <select
            className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            defaultValue="6"
            aria-label="Time range"
          >
            <option value="6">Last 6 months</option>
          </select>
        </div>
        <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight + 24}`} className="overflow-visible">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
          {incomeLast6.map((_, i) => (
            <line
              key={i}
              x1={padding.left + (i / Math.max(1, incomeLast6.length - 1)) * innerWidth}
              y1={padding.top}
              x2={padding.left + (i / Math.max(1, incomeLast6.length - 1)) * innerWidth}
              y2={padding.top + innerHeight}
              stroke="#f5f5f4"
              strokeWidth="1"
            />
          ))}
          <path
            d={linePath ? `${linePath} L ${padding.left + innerWidth},${padding.top + innerHeight} L ${padding.left},${padding.top + innerHeight} Z` : ''}
            fill="url(#lineGrad)"
          />
          <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {labels.map((label, i) => (
            <text
              key={i}
              x={padding.left + (i / Math.max(1, labels.length - 1)) * innerWidth}
              y={chartHeight + 16}
              textAnchor="middle"
              className="fill-stone-500 text-[11px] font-medium"
            >
              {label}
            </text>
          ))}
        </svg>
    </div>
  );
}

export function SpendingByCategoryChart({
  spendingByCategory,
  totalSpendingForDonut,
}: {
  spendingByCategory: { category: string; total: number }[];
  totalSpendingForDonut: number;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-stone-900 mb-5">Spending by category</h2>
        {spendingByCategory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-stone-400 text-sm">
            <p>No bills or transactions yet</p>
            <p className="text-xs mt-1">Add bills and transactions to see breakdown</p>
          </div>
        ) : (
          <div className="flex items-center gap-10">
            <DonutChart data={spendingByCategory} total={totalSpendingForDonut} />
            <div className="flex-1 min-w-0 space-y-4">
              {spendingByCategory.map((d, i) => {
                const pct = totalSpendingForDonut > 0 ? (d.total / totalSpendingForDonut) * 100 : 0;
                return (
                  <div key={d.category} className="group">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: getCategoryColor(d.category, i) }}
                        />
                        <span className="text-sm font-medium text-stone-800">{d.category}</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-semibold tabular-nums text-stone-900">
                          ${d.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-stone-400 font-medium">{Math.round(pct)}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.max(pct, 2)}%`,
                          backgroundColor: getCategoryColor(d.category, i),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );
}

const SEGMENT_GAP = 2; // px gap between segments

function DonutChart({ data, total }: { data: { category: string; total: number }[]; total: number }) {
  const size = 160;
  const stroke = 20;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const segments = data.map((d, i) => {
    const pct = total > 0 ? d.total / total : 0;
    const segmentLength = Math.max(0, circumference * pct - SEGMENT_GAP);
    const color = getCategoryColor(d.category, i);
    const seg = { offset, dash: segmentLength, color };
    offset += circumference * pct;
    return seg;
  });

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <filter id="donut-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.06" floodColor="#000" />
          </filter>
        </defs>
        {segments.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${s.dash} ${circumference}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
            filter="url(#donut-shadow)"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold tabular-nums text-stone-900 tracking-tight">
          {total >= 1000 ? `$${(total / 1000).toFixed(1)}k` : `$${Math.round(total)}`}
        </span>
        <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mt-0.5">
          Total
        </span>
      </div>
    </div>
  );
}
