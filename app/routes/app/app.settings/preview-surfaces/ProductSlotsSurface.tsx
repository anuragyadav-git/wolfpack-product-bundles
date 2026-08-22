import React from "react";
import { OptimisedImage } from "../../../../components/OptimisedImage";
import {
  DESIGN_PREVIEW_FIXTURE,
  type DesignPreviewFixtureProduct,
  type DesignPreviewTemplateDescriptor,
} from "../design-preview-model";
import styles from "./PreviewSurfaces.module.css";

type Translate = (key: string) => string;

function SlotProductThumbnail({
  product = DESIGN_PREVIEW_FIXTURE.products[0],
}: {
  product?: DesignPreviewFixtureProduct;
}) {
  return (
    <span className={styles.previewProductImageCompact}>
      <OptimisedImage
        src={product.imageUrl}
        width={52}
        height={52}
        loading="lazy"
        alt=""
      />
    </span>
  );
}

export function ProductSlotsSurface({
  descriptor,
  t,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  t: Translate;
}) {
  if (!descriptor.slotOrientation) return null;

  const orientation = descriptor.slotOrientation;
  const slotsRegion = `${orientation}-slots`;
  const filledProduct = DESIGN_PREVIEW_FIXTURE.products[0];

  if (orientation === "vertical") {
    return (
      <section className={styles.productSlotsSurface} data-preview-component="product-slots">
        <div
          className={styles.verticalSlotsStack}
          data-slot-direction="vertical"
          data-preview-region={slotsRegion}
        >
          {/* Step 1 */}
          <div className={styles.slotStepSection}>
            <div className={styles.slotStepTitle}>{t("settingsDcp.preview.surface.slotNumber").replace("{{number}}", "1")}</div>
            <div className={styles.horizontalSlotsGrid}>
              <div className={styles.slotCard} data-filled="true">
                <SlotProductThumbnail product={filledProduct} />
                <span className={styles.slotLabel}>{t(`${filledProduct.translationKey}.name`)}</span>
                <button type="button" className={styles.slotClearButton} aria-label="Remove item">×</button>
              </div>
              <div className={styles.slotCard}>
                <span className={styles.slotEmptyIcon} aria-hidden="true" />
                <span className={styles.slotLabel}>
                  {t("settingsDcp.preview.surface.slotNumber").replace("{{number}}", "2")}
                </span>
              </div>
              <div className={styles.slotCard}>
                <span className={styles.slotEmptyIcon} aria-hidden="true" />
                <span className={styles.slotLabel}>
                  {t("settingsDcp.preview.surface.slotNumber").replace("{{number}}", "3")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Horizontal Slots Grid
  return (
    <section className={styles.productSlotsSurface} data-preview-component="product-slots">
      <div
        className={styles.horizontalSlotsGrid}
        data-slot-direction="horizontal"
        data-preview-region={slotsRegion}
      >
        {/* Filled Slot */}
        <div className={styles.slotCard} data-filled="true">
          <SlotProductThumbnail product={filledProduct} />
          <span className={styles.slotLabel}>{t(`${filledProduct.translationKey}.name`)}</span>
          <button type="button" className={styles.slotClearButton} aria-label="Remove item">×</button>
        </div>

        {/* Empty Slot 2 */}
        <div className={styles.slotCard}>
          <span className={styles.slotEmptyIcon} aria-hidden="true" />
          <span className={styles.slotLabel}>
            {t("settingsDcp.preview.surface.slotNumber").replace("{{number}}", "2")}
          </span>
        </div>

        {/* Empty Slot 3 */}
        <div className={styles.slotCard}>
          <span className={styles.slotEmptyIcon} aria-hidden="true" />
          <span className={styles.slotLabel}>
            {t("settingsDcp.preview.surface.slotNumber").replace("{{number}}", "3")}
          </span>
        </div>
      </div>
    </section>
  );
}
