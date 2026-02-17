'use server';

import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signIn, signOut } from '@/auth';

export async function signOutAction() {
  await signOut({ redirect: false });
}

export async function signUp(email: string, password: string) {
  const emailLower = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: emailLower } });
  if (existing) {
    throw new Error('An account with this email already exists.');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email: emailLower, passwordHash },
  });
}

export async function signInAction(email: string, password: string) {
  await signIn('credentials', {
    email: email.trim().toLowerCase(),
    password,
    redirectTo: '/dashboard',
  });
}
