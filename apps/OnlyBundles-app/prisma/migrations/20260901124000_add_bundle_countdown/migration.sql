ALTER TABLE "Bundle"
ADD COLUMN "countdownEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "countdownLayout" TEXT NOT NULL DEFAULT 'compact',
ADD COLUMN "countdownPosition" TEXT NOT NULL DEFAULT 'above',
ADD COLUMN "countdownTitle" TEXT NOT NULL DEFAULT '',
ADD COLUMN "countdownExpiryAction" TEXT NOT NULL DEFAULT 'hide',
ADD COLUMN "countdownExpiredMessage" TEXT NOT NULL DEFAULT '';
