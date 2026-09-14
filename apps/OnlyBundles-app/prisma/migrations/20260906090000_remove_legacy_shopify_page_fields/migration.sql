DROP INDEX IF EXISTS "Bundle_shopifyPageHandle_idx";

ALTER TABLE "Bundle"
  DROP COLUMN "shopifyPageId",
  DROP COLUMN "shopifyPreviewPageId",
  DROP COLUMN "shopifyPageHandle",
  DROP COLUMN "shopifyPreviewPageHandle";
