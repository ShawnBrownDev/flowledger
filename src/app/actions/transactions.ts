'use server';

import { getAuthUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createTransaction(data: {
  date: string;
  amount: number;
  category: string;
  description?: string;
}) {
  const userId = await getAuthUserId();
  await prisma.expense.create({
    data: {
      userId,
      date: new Date(data.date),
      amount: data.amount,
      category: data.category,
      description: data.description?.trim() || null,
    },
  });
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
}

export async function updateTransaction(
  id: string,
  data: { date: string; amount: number; category: string; description?: string }
) {
  const userId = await getAuthUserId();
  await prisma.expense.updateMany({
    where: { id, userId },
    data: {
      date: new Date(data.date),
      amount: data.amount,
      category: data.category,
      description: data.description?.trim() || null,
    },
  });
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
}

export async function deleteTransaction(id: string) {
  const userId = await getAuthUserId();
  await prisma.expense.deleteMany({ where: { id, userId } });
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
}
