import { prisma } from '@/lib/db';

/**
 * Apply monthly interest to all debts; idempotent per (debt_id, year_month).
 * Payments from bills (Debt category, paid this month) are subtracted.
 */
export async function applyMonthlyInterest(): Promise<void> {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const debts = await prisma.debt.findMany({
    include: {
      bills: {
        where: {
          paid: true,
          amountPaid: { not: null },
          paidMonth: { gte: thisMonthStart, lt: nextMonthStart },
        },
        select: { amountPaid: true },
      },
    },
  });

  for (const debt of debts) {
    const existing = await prisma.debtMonthlySnapshot.findUnique({
      where: {
        debtId_yearMonth: { debtId: debt.id, yearMonth: thisMonthStart },
      },
    });
    if (existing) continue;

    const prevBalance = Number(debt.balance);
    const interest = Math.round(prevBalance * (Number(debt.apr) / 12) * 100) / 100;
    const paymentsThisMonth =
      debt.bills.reduce((s, b) => s + Number(b.amountPaid ?? 0), 0);
    const newBalance = Math.max(
      0,
      prevBalance + interest - paymentsThisMonth
    );

    await prisma.$transaction([
      prisma.debtMonthlySnapshot.upsert({
        where: {
          debtId_yearMonth: { debtId: debt.id, yearMonth: thisMonthStart },
        },
        create: {
          debtId: debt.id,
          yearMonth: thisMonthStart,
          balanceBefore: prevBalance,
          interestApplied: interest,
          paymentsApplied: paymentsThisMonth,
          balanceAfter: newBalance,
        },
        update: {},
      }),
      prisma.debt.update({
        where: { id: debt.id },
        data: { balance: newBalance },
      }),
    ]);
  }
}
