ALTER TYPE "SubscriptionPlan" RENAME VALUE 'grow' TO 'growth';

CREATE TYPE "SubscriptionBillingInterval" AS ENUM ('none', 'monthly', 'annual');
CREATE TYPE "SubscriptionProvider" AS ENUM ('shopify_app_pricing');

ALTER TABLE "Bundle"
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "planRestrictedAt" TIMESTAMP(3),
  ADD COLUMN "planRestrictionReason" TEXT;

UPDATE "Bundle"
SET "publishedAt" = "updatedAt"
WHERE "status" IN ('active', 'unlisted') AND "publishedAt" IS NULL;

ALTER TABLE "Subscription"
  ADD COLUMN "provider" "SubscriptionProvider" NOT NULL DEFAULT 'shopify_app_pricing',
  ADD COLUMN "billingInterval" "SubscriptionBillingInterval" NOT NULL DEFAULT 'none',
  ADD COLUMN "itemHandles" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "lastVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "verificationErrorCode" TEXT;

TRUNCATE TABLE "Subscription";

ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_legacy";
CREATE TYPE "SubscriptionStatus" AS ENUM ('pending', 'active', 'cancelled', 'frozen', 'expired', 'unknown');
ALTER TABLE "Subscription"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "SubscriptionStatus" USING ("status"::text::"SubscriptionStatus"),
  ALTER COLUMN "status" SET DEFAULT 'pending';
DROP TYPE "SubscriptionStatus_legacy";

ALTER TABLE "Subscription"
  DROP COLUMN "shopifySubscriptionId",
  DROP COLUMN "price",
  DROP COLUMN "currencyCode",
  DROP COLUMN "trialDaysRemaining",
  DROP COLUMN "cancelledAt",
  DROP COLUMN "confirmationUrl",
  DROP COLUMN "returnUrl";

ALTER TABLE "Shop" DROP COLUMN "currentSubscriptionId";

CREATE INDEX "Subscription_provider_idx" ON "Subscription"("provider");
CREATE INDEX "Subscription_lastVerifiedAt_idx" ON "Subscription"("lastVerifiedAt");
