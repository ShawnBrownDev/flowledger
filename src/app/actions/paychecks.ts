'use server';

import { getAuthUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createPaycheck(payDate: string, netAmount: number) {
  const userId = await getAuthUserId();
  await prisma.paycheck.create({
    data: {
      userId,
      payDate: new Date(payDate),
      netAmount,
    },
  });
  revalidatePath('/paychecks');
  revalidatePath('/dashboard');
}

export async function updatePaycheck(
  id: string,
  data: { payDate: string; netAmount: number }
) {
  const userId = await getAuthUserId();
  await prisma.paycheck.updateMany({
    where: { id, userId },
    data: {
      payDate: new Date(data.payDate),
      netAmount: data.netAmount,
    },
  });
  revalidatePath('/paychecks');
  revalidatePath('/dashboard');
}

export async function deletePaycheck(id: string) {
  const userId = await getAuthUserId();
  await prisma.paycheck.deleteMany({ where: { id, userId } });
  revalidatePath('/paychecks');
  revalidatePath('/dashboard');
}
