-- AlterTable
ALTER TABLE "OrderAttribution"
ADD COLUMN "offerPolicyId" TEXT,
ADD COLUMN "offerRuleVersion" INTEGER,
ADD COLUMN "offerTierId" TEXT,
ADD COLUMN "offerEligibilitySource" TEXT;

-- AlterTable
ALTER TABLE "BundleEngagement"
ADD COLUMN "offerPolicyId" TEXT,
ADD COLUMN "offerRuleVersion" INTEGER,
ADD COLUMN "offerTierId" TEXT,
ADD COLUMN "offerEligibilitySource" TEXT;

-- CreateIndex
CREATE INDEX "OrderAttribution_shopId_offerPolicyId_createdAt_idx"
ON "OrderAttribution"("shopId", "offerPolicyId", "createdAt");

-- CreateIndex
CREATE INDEX "BundleEngagement_shopId_offerPolicyId_createdAt_idx"
ON "BundleEngagement"("shopId", "offerPolicyId", "createdAt");
