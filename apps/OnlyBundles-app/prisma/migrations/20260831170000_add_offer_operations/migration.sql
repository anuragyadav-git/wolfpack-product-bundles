DROP INDEX IF EXISTS "OfferPolicy_shopId_enabled_idx";

ALTER TABLE "OfferPolicy"
  RENAME COLUMN "enabled" TO "specificLinkRequired";

ALTER TABLE "OfferPolicy"
  ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN "stopLowerPriority" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "startsAt" TIMESTAMP(3),
  ADD COLUMN "endsAt" TIMESTAMP(3);

CREATE INDEX "OfferPolicy_shopId_specificLinkRequired_idx"
  ON "OfferPolicy"("shopId", "specificLinkRequired");

CREATE INDEX "OfferPolicy_shopId_priority_idx"
  ON "OfferPolicy"("shopId", "priority");
