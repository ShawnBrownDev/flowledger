import { prisma } from '@/lib/db';

const THIS_MONTH_START = (year: number, month: number) =>
  new Date(year, month - 1, 1);

const THIS_MONTH_END = (year: number, month: number) =>
  new Date(year, month, 0);

/** Sum of paychecks in the given calendar month */
export async function getMonthlyIncome(
  userId: string,
  year: number,
  month: number
): Promise<number> {
  const start = THIS_MONTH_START(year, month);
  const end = THIS_MONTH_END(year, month);

  const rows = await prisma.paycheck.findMany({
    where: {
      userId,
      payDate: { gte: start, lte: end },
    },
    select: { netAmount: true },
  });

  return rows.reduce((acc, row) => acc + Number(row.netAmount), 0);
}

/** Sum of monthly_amount for all bills (total committed bills for the month) */
export async function getTotalBillsForMonth(userId: string): Promise<number> {
  const rows = await prisma.bill.findMany({
    where: { userId },
    select: { monthlyAmount: true },
  });
  return rows.reduce((acc, row) => acc + Number(row.monthlyAmount), 0);
}

/** Sum of monthly_contribution across all savings goals */
export async function getTotalSavings(userId: string): Promise<number> {
  const rows = await prisma.savings.findMany({
    where: { userId },
    select: { monthlyContribution: true },
  });
  return rows.reduce((acc, row) => acc + Number(row.monthlyContribution), 0);
}

/** All debts for user with optional snapshot for given month */
export async function getDebtsWithSnapshots(
  userId: string,
  year: number,
  month: number
) {
  const yearMonth = THIS_MONTH_START(year, month);

  const debts = await prisma.debt.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    include: {
      debtMonthlySnapshots: {
        where: { yearMonth },
        take: 1,
      },
    },
  });

  return debts.map((d) => ({
    ...d,
    snapshot: d.debtMonthlySnapshots[0] ?? null,
    debtMonthlySnapshots: undefined,
  }));
}

/** Bills grouped by category (monthly_amount sum) for spending breakdown */
export async function getBillsByCategory(
  userId: string
): Promise<{ category: string; total: number }[]> {
  const rows = await prisma.bill.findMany({
    where: { userId },
    select: { category: true, monthlyAmount: true },
  });
  const byCategory = new Map<string, number>();
  for (const row of rows) {
    const cat = row.category || 'Other';
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + Number(row.monthlyAmount));
  }
  return Array.from(byCategory.entries()).map(([category, total]) => ({
    category,
    total,
  }));
}

/** Sum of transactions in the given calendar month (discretionary spending) */
export async function getTotalTransactionsForMonth(
  userId: string,
  year: number,
  month: number
): Promise<number> {
  const start = THIS_MONTH_START(year, month);
  const end = THIS_MONTH_END(year, month);

  const rows = await prisma.expense.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
    },
    select: { amount: true },
  });

  return rows.reduce((acc, row) => acc + Number(row.amount), 0);
}

/** Transactions grouped by category for given month */
export async function getTransactionsByCategory(
  userId: string,
  year: number,
  month: number
): Promise<{ category: string; total: number }[]> {
  const start = THIS_MONTH_START(year, month);
  const end = THIS_MONTH_END(year, month);

  const rows = await prisma.expense.findMany({
    where: {
      userId,
      date: { gte: start, lte: end },
    },
    select: { category: true, amount: true },
  });

  const byCategory = new Map<string, number>();
  for (const row of rows) {
    const cat = row.category || 'Other';
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + Number(row.amount));
  }
  return Array.from(byCategory.entries()).map(([category, total]) => ({
    category,
    total,
  }));
}

/** Combined spending by category: bills (monthly_amount) + transactions for the month */
export async function getSpendingByCategory(
  userId: string,
  year: number,
  month: number
): Promise<{ category: string; total: number }[]> {
  const [bills, transactions] = await Promise.all([
    getBillsByCategory(userId),
    getTransactionsByCategory(userId, year, month),
  ]);

  const byCategory = new Map<string, number>();
  for (const b of bills) {
    byCategory.set(b.category, (byCategory.get(b.category) ?? 0) + b.total);
  }
  for (const t of transactions) {
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.total);
  }
  return Array.from(byCategory.entries())
    .map(([category, total]) => ({ category, total }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);
}

/** Paycheck metrics for paychecks page */
export async function getPaycheckMetrics(userId: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const start = THIS_MONTH_START(year, month);
  const end = THIS_MONTH_END(year, month);

  const allPaychecks = await prisma.paycheck.findMany({
    where: { userId },
    orderBy: { payDate: 'desc' },
    select: { payDate: true, netAmount: true },
  });

  const thisMonth = allPaychecks.filter(
    (p) => p.payDate >= start && p.payDate <= end
  );
  const monthToDate = thisMonth.reduce((s, p) => s + Number(p.netAmount), 0);

  const prevStart = THIS_MONTH_START(year, month - 1);
  const prevEnd = THIS_MONTH_END(year, month - 1);
  const prevMonthPaychecks = allPaychecks.filter(
    (p) => p.payDate >= prevStart && p.payDate <= prevEnd
  );
  const prevMonthToDate = prevMonthPaychecks.reduce(
    (s, p) => s + Number(p.netAmount),
    0
  );
  const pctChange =
    prevMonthToDate > 0
      ? ((monthToDate - prevMonthToDate) / prevMonthToDate) * 100
      : null;

  const avg =
    allPaychecks.length > 0
      ? allPaychecks.reduce((s, p) => s + Number(p.netAmount), 0) /
        allPaychecks.length
      : 0;

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const upcoming = allPaychecks
    .filter((p) => p.payDate >= todayStart)
    .sort((a, b) => a.payDate.getTime() - b.payDate.getTime())[0];

  const daysUntil = upcoming
    ? Math.ceil(
        (upcoming.payDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  return {
    monthToDate,
    pctChange,
    average: avg,
    nextPaycheck: upcoming
      ? {
          date: upcoming.payDate,
          amount: Number(upcoming.netAmount),
          daysUntil,
        }
      : null,
  };
}

/** Paycheck impact: projected balance and bills covered % */
export async function getPaycheckImpact(userId: string, year: number, month: number) {
  const [income, totalBills, totalSavings, totalTransactions] = await Promise.all([
    getMonthlyIncome(userId, year, month),
    getTotalBillsForMonth(userId),
    getTotalSavings(userId),
    getTotalTransactionsForMonth(userId, year, month),
  ]);

  const incomeNum = Number(income);
  const billsNum = Number(totalBills);
  const savingsNum = Number(totalSavings);
  const transactionsNum = Number(totalTransactions);
  const remaining = incomeNum - billsNum - savingsNum - transactionsNum;
  const billsCovered =
    billsNum > 0 ? Math.min(100, Math.round((incomeNum / billsNum) * 100)) : 100;

  return {
    projectedMonthEnd: remaining,
    billsCoveredPct: billsCovered,
  };
}

/** Monthly income for last 6 months (for cash flow chart) */
export async function getMonthlyIncomeLast6Months(
  userId: string
): Promise<{ year: number; month: number; income: number }[]> {
  const now = new Date();
  const result: { year: number; month: number; income: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const income = await getMonthlyIncome(userId, y, m);
    result.push({ year: y, month: m, income });
  }
  return result;
}
