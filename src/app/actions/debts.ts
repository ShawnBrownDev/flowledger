'use server';

import { getAuthUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { PaymentFrequency } from '@/lib/types';

function monthlyPaymentFromDebt(minPayment: number, frequency: string): number {
  switch (frequency) {
    case 'weekly':
      return minPayment * 4.33;
    case 'biweekly':
      return minPayment * 2.17;
    default:
      return minPayment;
  }
}

export async function createDebt(data: {
  name: string;
  apr: number;
  balance: number;
  minPayment: number;
  paymentFrequency: PaymentFrequency;
}) {
  const userId = await getAuthUserId();
  const debt = await prisma.debt.create({
    data: {
      userId,
      name: data.name.trim(),
      apr: data.apr,
      balance: data.balance,
      minPayment: data.minPayment,
      paymentFrequency: data.paymentFrequency,
    },
  });
  // Auto-create a bill for this debt with the monthly payment amount
  const monthlyAmount = monthlyPaymentFromDebt(data.minPayment, data.paymentFrequency);
  await prisma.bill.create({
    data: {
      userId,
      name: debt.name,
      category: 'Debt',
      dueDate: 1,
      monthlyAmount,
      debtId: debt.id,
    },
  });
  revalidatePath('/debts');
  revalidatePath('/bills');
  revalidatePath('/dashboard');
}

export async function updateDebt(
  id: string,
  data: {
    name: string;
    apr: number;
    balance: number;
    minPayment: number;
    paymentFrequency: PaymentFrequency;
  }
) {
  const userId = await getAuthUserId();
  await prisma.debt.updateMany({
    where: { id, userId },
    data: {
      name: data.name.trim(),
      apr: data.apr,
      balance: data.balance,
      minPayment: data.minPayment,
      paymentFrequency: data.paymentFrequency,
    },
  });
  // Update linked bills with the new monthly amount
  const monthlyAmount = monthlyPaymentFromDebt(data.minPayment, data.paymentFrequency);
  await prisma.bill.updateMany({
    where: { debtId: id, userId },
    data: { monthlyAmount, name: data.name.trim() },
  });
  revalidatePath('/debts');
  revalidatePath('/bills');
  revalidatePath('/dashboard');
}

export async function deleteDebt(id: string) {
  const userId = await getAuthUserId();
  await prisma.debt.deleteMany({ where: { id, userId } });
  revalidatePath('/debts');
  revalidatePath('/dashboard');
}
