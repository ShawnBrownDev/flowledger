'use client';

function WandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4V2" />
      <path d="M15 16v-2" />
      <path d="M8 9h2" />
      <path d="M20 9h2" />
      <path d="M17.8 11.8 19 13" />
      <path d="M15 9h0" />
      <path d="M17.8 6.2 19 5" />
      <path d="m3 21 9-9" />
      <path d="M12.2 6.2 11 5" />
    </svg>
  );
}

export function AutomationCard() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-stone-900">
          Automation
        </h2>
        <p className="text-sm text-stone-500 mt-0.5">
          Turn paydays into rules once, reuse every month.
        </p>
      </div>

      <div className="mt-4 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-12 rounded-lg bg-stone-200/80 flex flex-col justify-center gap-1 px-2 mb-4">
          <div className="h-1 rounded bg-stone-300" />
          <div className="h-1 rounded bg-stone-300 w-3/4" />
        </div>
        <p className="text-sm font-medium text-stone-700">No automation rules yet</p>
        <p className="text-xs text-stone-500 mt-1 max-w-[220px]">
          Set up rules to automatically split every paycheck into bills, savings,
          and goals.
        </p>
        <button
          type="button"
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <WandIcon className="w-4 h-4" />
          Create automation
        </button>
      </div>
    </section>
  );
}
