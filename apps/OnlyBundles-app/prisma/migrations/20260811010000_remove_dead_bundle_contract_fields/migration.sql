UPDATE "StepCategory"
SET "products" = "selectedProducts"
WHERE jsonb_array_length(COALESCE("products", '[]'::jsonb)) = 0
  AND jsonb_array_length(COALESCE("selectedProducts", '[]'::jsonb)) > 0;

UPDATE "StepCategory"
SET "collections" = CASE
  WHEN jsonb_array_length(COALESCE("collectionsSelectedData", '[]'::jsonb)) > 0
    THEN "collectionsSelectedData"
  ELSE "collectionsData"
END
WHERE jsonb_array_length(COALESCE("collections", '[]'::jsonb)) = 0
  AND (
    jsonb_array_length(COALESCE("collectionsSelectedData", '[]'::jsonb)) > 0
    OR jsonb_array_length(COALESCE("collectionsData", '[]'::jsonb)) > 0
  );

UPDATE "StepCategory"
SET "sortOrder" = "categoryRank"
WHERE "categoryRank" IS NOT NULL
  AND "sortOrder" = 0;

UPDATE "BundlePricing"
SET "displayOptions" = "messages"->'displayOptions'
WHERE "displayOptions" IS NULL
  AND jsonb_typeof("messages"->'displayOptions') = 'object';

UPDATE "BundlePricing"
SET "messages" = "messages" - 'displayOptions'
WHERE "messages" ? 'displayOptions';

ALTER TABLE "StepCategory"
  DROP COLUMN "selectedProducts",
  DROP COLUMN "collectionsData",
  DROP COLUMN "collectionsSelectedData",
  DROP COLUMN "categoryRank";

DROP TABLE "BundleCustomField";

ALTER TABLE "Bundle" DROP COLUMN "fullPageLayout";
DROP TYPE "FullPageLayout";

ALTER TABLE "DesignSettings"
  DROP COLUMN "productPriceVisibility",
  DROP COLUMN "loadingOverlayBgColor",
  DROP COLUMN "loadingOverlayTextColor",
  DROP COLUMN "emptySlotBorderColor";
