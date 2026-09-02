ALTER TABLE "Bundle"
ADD COLUMN "stickyAddToCartEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "stickyAddToCartShowDesktop" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "stickyAddToCartShowMobile" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "stickyAddToCartAction" TEXT NOT NULL DEFAULT 'scroll_to_offers';
