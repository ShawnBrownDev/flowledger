-- Insert bills for user ffea3e07-4c71-4544-bbfe-48f27eec99fa
-- Run after seed-paychecks.sql (or ensure this user exists).
INSERT INTO "public"."Bill" ("id", "user_id", "name", "category", "due_date", "monthly_amount", "paid", "amount_paid", "debt_id", "paid_month", "created_at")
VALUES
  ('bd008d21-0356-46f1-8376-5b9628dee507', 'ffea3e07-4c71-4544-bbfe-48f27eec99fa', 'Lights', 'Utilities', 20, 252.00, false, NULL, NULL, NULL, '2026-02-10 12:02:05.271123+00'),
  ('c31ff386-3f06-4891-91a6-8a62475da1b6', 'ffea3e07-4c71-4544-bbfe-48f27eec99fa', 'Wow Internet', 'Other', 22, 110.00, false, NULL, NULL, NULL, '2026-02-10 12:01:20.661923+00'),
  ('e312f29d-76ec-43a1-b4be-9d4ebf465061', 'ffea3e07-4c71-4544-bbfe-48f27eec99fa', 'Water', 'Utilities', 22, 80.00, false, NULL, NULL, NULL, '2026-02-10 12:01:43.120199+00')
ON CONFLICT ("id") DO NOTHING;
