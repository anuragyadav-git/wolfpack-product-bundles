ALTER TABLE "Bundle"
ADD COLUMN "publicNumber" INTEGER;

ALTER TABLE "Shop"
ADD COLUMN "lastFpbPublicNumber" INTEGER NOT NULL DEFAULT 0;

WITH ranked_bundles AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "shopId"
      ORDER BY "createdAt" ASC, "id" ASC
    )::INTEGER AS "publicNumber"
  FROM "Bundle"
  WHERE "bundleType" = 'full_page'
)
UPDATE "Bundle" AS bundle
SET "publicNumber" = ranked_bundles."publicNumber"
FROM ranked_bundles
WHERE bundle."id" = ranked_bundles."id";

UPDATE "Shop" AS shop
SET "lastFpbPublicNumber" = COALESCE((
  SELECT MAX(bundle."publicNumber")
  FROM "Bundle" AS bundle
  WHERE bundle."shopId" = shop."shopDomain"
    AND bundle."bundleType" = 'full_page'
), 0);

CREATE UNIQUE INDEX "Bundle_shopId_publicNumber_key"
ON "Bundle"("shopId", "publicNumber");

ALTER TABLE "Bundle"
ADD CONSTRAINT "Bundle_publicNumber_bundleType_check"
CHECK (
  ("bundleType" = 'full_page' AND "publicNumber" IS NOT NULL AND "publicNumber" > 0)
  OR
  ("bundleType" <> 'full_page' AND "publicNumber" IS NULL)
);
