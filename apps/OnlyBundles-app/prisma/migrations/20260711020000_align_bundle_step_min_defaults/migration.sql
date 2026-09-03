-- Alter default minimum quantities for step-level records so new records default to 0.
-- This removes implicit required quantity fallback to 1 at creation time.
ALTER TABLE "BundleStep" ALTER COLUMN "minQuantity" SET DEFAULT 0;
ALTER TABLE "StepProduct" ALTER COLUMN "minQuantity" SET DEFAULT 0;
