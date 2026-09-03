CREATE TYPE "OfferConditionType" AS ENUM ('specific_link');

CREATE TABLE "OfferPolicy" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "ruleVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfferPolicy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OfferCondition" (
    "id" TEXT NOT NULL,
    "offerPolicyId" TEXT NOT NULL,
    "type" "OfferConditionType" NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "tokenIdentifier" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfferCondition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OfferPolicy_bundleId_key" ON "OfferPolicy"("bundleId");
CREATE INDEX "OfferPolicy_shopId_enabled_idx" ON "OfferPolicy"("shopId", "enabled");
CREATE UNIQUE INDEX "OfferCondition_tokenIdentifier_key" ON "OfferCondition"("tokenIdentifier");
CREATE UNIQUE INDEX "OfferCondition_tokenHash_key" ON "OfferCondition"("tokenHash");
CREATE UNIQUE INDEX "OfferCondition_offerPolicyId_type_key" ON "OfferCondition"("offerPolicyId", "type");
CREATE INDEX "OfferCondition_offerPolicyId_position_idx" ON "OfferCondition"("offerPolicyId", "position");
CREATE INDEX "OfferCondition_expiresAt_idx" ON "OfferCondition"("expiresAt");

ALTER TABLE "OfferPolicy"
ADD CONSTRAINT "OfferPolicy_bundleId_fkey"
FOREIGN KEY ("bundleId") REFERENCES "Bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OfferCondition"
ADD CONSTRAINT "OfferCondition_offerPolicyId_fkey"
FOREIGN KEY ("offerPolicyId") REFERENCES "OfferPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
