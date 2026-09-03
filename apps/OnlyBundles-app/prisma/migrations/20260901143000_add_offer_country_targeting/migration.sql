CREATE TYPE "OfferCountryTargetingMode" AS ENUM ('include', 'exclude');

ALTER TABLE "OfferPolicy"
ADD COLUMN "countryTargetingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "countryTargetingMode" "OfferCountryTargetingMode" NOT NULL DEFAULT 'include',
ADD COLUMN "countryCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "OfferPolicy"
ALTER COLUMN "countryCodes" SET NOT NULL;
