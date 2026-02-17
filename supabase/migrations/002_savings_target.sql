-- Optional target amount for savings goals (null = no target)
ALTER TABLE savings ADD COLUMN IF NOT EXISTS target_amount DECIMAL(12, 2) CHECK (target_amount IS NULL OR target_amount >= 0);
