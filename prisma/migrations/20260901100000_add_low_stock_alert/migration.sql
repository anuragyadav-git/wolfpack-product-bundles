ALTER TABLE "Bundle"
ADD COLUMN "lowStockAlertEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "lowStockAlertThreshold" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN "lowStockAlertMessage" TEXT NOT NULL DEFAULT 'Only {{stock}} left';
