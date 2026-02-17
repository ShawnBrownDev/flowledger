# FlowLedger

Personal finance web app (mobile-friendly): track weekly paychecks, monthly bills, savings, and debts with automatic monthly interest.

## Tech stack

- **Next.js** (App Router)
- **Neon** (Postgres) + **Prisma** (ORM)
- **NextAuth.js v5** (Auth.js – credentials provider, email/password)
- **Tailwind CSS**

## Setup

### 1. Neon (database)

1. Create a project at [neon.tech](https://neon.tech).
2. In the dashboard, get your connection string and set it as `DATABASE_URL` in `.env`.
3. Create the schema: run `bun run db:push` (or `bun run db:migrate` for a first migration). This applies the Prisma schema (including `users` table) to Neon.

### 2. Environment

Copy `.env.example` to `.env` and set:

- `AUTH_SECRET` – required for NextAuth; generate with `openssl rand -base64 32`
- `DATABASE_URL` – Neon connection string (see `.env.example`)

### 3. Install and run

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up with email/password (stored in Neon via Prisma), then use the app.

## Pages

- **/login**, **/signup** – Sign in / create account
- **/dashboard** – Overview with month picker, income vs last month %, 4 metric cards, cash flow chart, spending breakdown, debts. Use the month dropdown to view past months.
- **/paychecks** – Add, edit (date/amount), or delete weekly paychecks
- **/bills** – Add, edit, or delete bills; mark paid with amount; link Debt bills to a debt; “Due soon” badge when due within 7 days
- **/debts** – Add, edit, or delete debts; payoff estimate (“Paid off by …”); interest and payments this month
- **/savings** – Add, edit, or delete goals; optional target amount with progress bar
- **/settings** – Dark mode toggle, signed-in email

## Logic

- **Monthly income** = sum of paychecks in the current calendar month.
- **Remaining cash** = income − total bills (monthly_amount) − total savings (monthly_contribution).
- **Bills** are the source of truth: when a bill with category "Debt" is marked paid, set `amount_paid` and `paid_month`; the monthly job applies that payment to the linked debt.
- **Monthly interest**: `interest = balance * (apr / 12)`. New balance = balance + interest − payments (from bills for that month). Applied once per month by the backend job.

## Monthly interest job

The app applies monthly interest in TypeScript (see `src/lib/apply-monthly-interest.ts`):

- Runs once per month (e.g. 1st at 00:00).
- For each debt: computes interest, sums payments from bills where `paid = true` and `paid_month` is in the current month, updates `debts.balance`, and inserts a row into `debt_monthly_snapshots`.

**Vercel Cron**

1. `vercel.json` is set with a monthly cron (`0 0 1 * *` = 1st of month at midnight).
2. In Vercel, set `CRON_SECRET` (optional). The route `/api/cron/apply-interest` runs the job. If `CRON_SECRET` is set, call the route with `Authorization: Bearer <CRON_SECRET>`.

## Project structure

- `src/app/(auth)/` – Protected routes (dashboard, paychecks, bills, debts, savings)
- `src/app/actions/` – Server actions (mutations via Prisma)
- `src/app/login/` – Login page
- `src/auth.ts` – NextAuth config (credentials provider)
- `src/lib/auth.ts` – `getAuthUserId()` for server actions and RSC
- `src/lib/db.ts` – Prisma client (Neon)
- `src/lib/aggregations.ts` – Dashboard and debt aggregation queries (Prisma)
- `src/lib/apply-monthly-interest.ts` – Monthly interest job (Prisma)
- `src/lib/types.ts` – Shared types
- `prisma/schema.prisma` – Database schema
