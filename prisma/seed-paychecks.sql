-- Ensure the user exists (required for Paycheck foreign key)
-- Password for this seed user: "password"
INSERT INTO "public"."users" ("id", "email", "password_hash", "created_at")
VALUES (
  'ffea3e07-4c71-4544-bbfe-48f27eec99fa',
  'seed@flowledger.local',
  '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '2026-02-10 11:47:00+00'
)
ON CONFLICT ("id") DO NOTHING;

-- Insert paychecks for user ffea3e07-4c71-4544-bbfe-48f27eec99fa
INSERT INTO "public"."Paycheck" ("id", "user_id", "pay_date", "net_amount", "created_at")
VALUES
  ('468eb72d-1622-4856-9050-b09434b6ee43', 'ffea3e07-4c71-4544-bbfe-48f27eec99fa', '2026-01-20', 428.93, '2026-02-10 11:50:48.486499+00'),
  ('a83c2242-f417-4adf-b4f4-549181fa3b20', 'ffea3e07-4c71-4544-bbfe-48f27eec99fa', '2026-02-04', 488.66, '2026-02-10 11:50:23.707766+00'),
  ('cb6c7cb5-6758-483e-89b2-edee7efcfd73', 'ffea3e07-4c71-4544-bbfe-48f27eec99fa', '2026-02-11', 438.59, '2026-02-10 11:47:46.467703+00')
ON CONFLICT ("id") DO NOTHING;
