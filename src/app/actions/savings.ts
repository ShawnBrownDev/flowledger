'use server';

import { getAuthUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createSavings(data: {
  goalName: string;
  monthlyContribution: number;
  balance: number;
  targetAmount?: number | null;
}) {
  const userId = await getAuthUserId();
  await prisma.savings.create({
    data: {
      userId,
      goalName: data.goalName.trim(),
      monthlyContribution: data.monthlyContribution,
      balance: data.balance,
      targetAmount: data.targetAmount ?? null,
    },
  });
  revalidatePath('/savings');
  revalidatePath('/dashboard');
}

export async function updateSavings(
  id: string,
  data: {
    goalName: string;
    monthlyContribution: number;
    balance: number;
    targetAmount?: number | null;
  }
) {
  const userId = await getAuthUserId();
  await prisma.savings.updateMany({
    where: { id, userId },
    data: {
      goalName: data.goalName.trim(),
      monthlyContribution: data.monthlyContribution,
      balance: data.balance,
      targetAmount: data.targetAmount ?? null,
    },
  });
  revalidatePath('/savings');
  revalidatePath('/dashboard');
}

export async function deleteSavings(id: string) {
  const userId = await getAuthUserId();
  await prisma.savings.deleteMany({ where: { id, userId } });
  revalidatePath('/savings');
  revalidatePath('/dashboard');
}
