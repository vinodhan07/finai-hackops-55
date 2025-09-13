-- Add tenant_id column to existing tables that don't have it
ALTER TABLE budget_categories ADD COLUMN tenant_id TEXT NOT NULL DEFAULT gen_random_uuid()::text;
ALTER TABLE income_sources ADD COLUMN tenant_id TEXT NOT NULL DEFAULT gen_random_uuid()::text;
ALTER TABLE transactions ADD COLUMN tenant_id TEXT NOT NULL DEFAULT gen_random_uuid()::text;