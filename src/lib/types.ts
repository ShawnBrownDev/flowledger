export type PaymentFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface Paycheck {
  id: string;
  user_id: string;
  pay_date: string;
  net_amount: number;
  created_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  apr: number;
  balance: number;
  min_payment: number;
  payment_frequency: PaymentFrequency;
  created_at: string;
}

export interface Bill {
  id: string;
  user_id: string;
  name: string;
  category: string;
  due_date: number;
  monthly_amount: number;
  paid: boolean;
  amount_paid: number | null;
  debt_id: string | null;
  paid_month: string | null;
  created_at: string;
}

export interface DebtMonthlySnapshot {
  id: string;
  debt_id: string;
  year_month: string;
  balance_before: number;
  interest_applied: number;
  payments_applied: number;
  balance_after: number;
  created_at: string;
}

export interface Savings {
  id: string;
  user_id: string;
  goal_name: string;
  monthly_contribution: number;
  balance: number;
  created_at: string;
}
