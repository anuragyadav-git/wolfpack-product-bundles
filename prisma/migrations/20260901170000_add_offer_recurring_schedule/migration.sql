CREATE TYPE "OfferScheduleMode" AS ENUM ('always', 'one_time', 'recurring');
CREATE TYPE "OfferRecurrenceFrequency" AS ENUM ('weekly', 'monthly');
CREATE TYPE "OfferRecurrenceTermination" AS ENUM ('never', 'on_date', 'after_runs');

ALTER TABLE "OfferPolicy"
ADD COLUMN "scheduleMode" "OfferScheduleMode" NOT NULL DEFAULT 'always',
ADD COLUMN "recurrenceFrequency" "OfferRecurrenceFrequency",
ADD COLUMN "recurrenceTimezone" TEXT,
ADD COLUMN "recurrenceAnchorDate" DATE,
ADD COLUMN "recurrenceWindowStartMinute" INTEGER,
ADD COLUMN "recurrenceWindowEndMinute" INTEGER,
ADD COLUMN "recurrenceTermination" "OfferRecurrenceTermination" NOT NULL DEFAULT 'never',
ADD COLUMN "recurrenceEndsOn" DATE,
ADD COLUMN "recurrenceRunCount" INTEGER;

UPDATE "OfferPolicy"
SET "scheduleMode" = 'one_time'
WHERE "startsAt" IS NOT NULL OR "endsAt" IS NOT NULL;
