import { NextResponse } from 'next/server';
import { applyMonthlyInterest } from '@/lib/apply-monthly-interest';

/**
 * Vercel Cron: run monthly (e.g. 0 0 1 * *) to apply interest to all debts.
 * Set CRON_SECRET in Vercel and pass it in the request header to secure.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await applyMonthlyInterest();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('apply_monthly_interest error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
