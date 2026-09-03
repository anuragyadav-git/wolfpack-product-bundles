-- Replace the ambiguous StepCategory swatch boolean with one canonical selector contract.
CREATE TYPE "VariantSelectorMode" AS ENUM ('dropdown', 'pill', 'color_swatch', 'image_swatch');

ALTER TABLE "StepCategory"
DROP COLUMN "displayVariantsAsSwatches",
ADD COLUMN "variantSelectorMode" "VariantSelectorMode" NOT NULL DEFAULT 'dropdown',
ADD COLUMN "swatchTooltipEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "variantColorMap" JSONB NOT NULL DEFAULT '{}';
