DROP INDEX IF EXISTS "Bundle_shopId_storefrontSyncStatus_idx";

ALTER TABLE "Bundle"
  DROP COLUMN IF EXISTS "storefrontSyncStatus",
  DROP COLUMN IF EXISTS "storefrontSyncQueuedAt",
  DROP COLUMN IF EXISTS "storefrontSyncStartedAt",
  DROP COLUMN IF EXISTS "storefrontSyncedAt",
  DROP COLUMN IF EXISTS "storefrontSyncFailedAt",
  DROP COLUMN IF EXISTS "storefrontSyncLastError",
  DROP COLUMN IF EXISTS "storefrontSyncAttemptId",
  DROP COLUMN IF EXISTS "storefrontSyncStats";

DROP TYPE IF EXISTS "StorefrontSyncStatus";
