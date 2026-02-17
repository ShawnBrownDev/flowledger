import Link from 'next/link';

interface CategoryTotal {
  category: string;
  total: number;
}

export function TransactionsSidebar({
  categoryBreakdown,
  total,
  isEmpty,
}: {
  categoryBreakdown: CategoryTotal[];
  total: number;
  isEmpty: boolean;
}) {
  return (
    <aside className="w-full lg:w-80 xl:w-96 space-y-6 shrink-0">
      {/* Summary card */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4">
          This month
        </h3>
        <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
          ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Total spending
        </p>

        {categoryBreakdown.length > 0 && (
          <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
              By category
            </p>
            <ul className="space-y-2">
              {categoryBreakdown.map(({ category, total: catTotal }) => {
                const pct = total > 0 ? (catTotal / total) * 100 : 0;
                return (
                  <li key={category} className="flex justify-between items-center gap-2">
                    <span className="text-sm text-stone-700 dark:text-stone-300 truncate">
                      {category}
                    </span>
                    <span className="text-sm font-medium text-stone-900 dark:text-stone-100 tabular-nums shrink-0">
                      ${catTotal.toFixed(2)} ({Math.round(pct)}%)
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {isEmpty && (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 p-5">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-2">
            Quick tips
          </h3>
          <ul className="text-sm text-stone-600 dark:text-stone-400 space-y-2">
            <li>• Use categories to see spending breakdowns on your dashboard</li>
            <li>• Add transactions regularly for accurate cash flow tracking</li>
            <li>• Your spending affects the &quot;Remaining cash&quot; calculation</li>
          </ul>
          <Link
            href="/dashboard"
            className="mt-4 block text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
          >
            View dashboard →
          </Link>
        </div>
      )}
    </aside>
  );
}
