'use server';

import { getAuthUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createBill(data: {
  name: string;
  category: string;
  dueDate: number;
  monthlyAmount: number;
  debtId?: string | null;
}) {
  const userId = await getAuthUserId();
  await prisma.bill.create({
    data: {
      userId,
      name: data.name.trim(),
      category: data.category,
      dueDate: data.dueDate,
      monthlyAmount: data.monthlyAmount,
      debtId: data.debtId || null,
    },
  });
  revalidatePath('/bills');
  revalidatePath('/dashboard');
}

export async function updateBill(
  id: string,
  data: {
    name: string;
    category: string;
    dueDate: number;
    monthlyAmount: number;
    debtId?: string | null;
  }
) {
  const userId = await getAuthUserId();
  await prisma.bill.updateMany({
    where: { id, userId },
    data: {
      name: data.name.trim(),
      category: data.category,
      dueDate: data.dueDate,
      monthlyAmount: data.monthlyAmount,
      debtId: data.debtId || null,
    },
  });
  revalidatePath('/bills');
  revalidatePath('/dashboard');
}

export async function updateBillPaid(
  id: string,
  paid: boolean,
  amountPaid?: number | null,
  paidMonth?: string | null
) {
  const userId = await getAuthUserId();
  const bill = await prisma.bill.findFirst({ where: { id, userId } });
  if (!bill) return;

  if (paid && bill.debtId) {
    const paymentAmount = amountPaid ?? Number(bill.monthlyAmount);
    const debt = await prisma.debt.findFirst({ where: { id: bill.debtId, userId } });
    if (debt && paymentAmount > 0) {
      const newBalance = Math.max(0, Number(debt.balance) - paymentAmount);
      await prisma.debt.updateMany({
        where: { id: bill.debtId, userId },
        data: { balance: newBalance },
      });
    }
  }

  await prisma.bill.updateMany({
    where: { id, userId },
    data: {
      paid,
      amountPaid: paid ? amountPaid ?? null : null,
      paidMonth: paid && paidMonth ? new Date(paidMonth) : null,
    },
  });
  revalidatePath('/bills');
  revalidatePath('/debts');
  revalidatePath('/dashboard');
}

export async function deleteBill(id: string) {
  const userId = await getAuthUserId();
  await prisma.bill.deleteMany({ where: { id, userId } });
  revalidatePath('/bills');
  revalidatePath('/dashboard');
}
