import React from "react";
import { OptimisedImage } from "../../../../components/OptimisedImage";
import {
  DESIGN_PREVIEW_FIXTURE,
  type DesignPreviewFixtureProduct,
  type DesignPreviewTemplateDescriptor,
} from "../design-preview-model";
import type { PreviewInteractionState } from "../DesignLivePreview";
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
  interaction,
  onRemoveProduct,
  onOpenPicker,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  t: Translate;
  interaction: PreviewInteractionState;
  onRemoveProduct: (productId: string) => void;
  onOpenPicker: () => void;
}) {
  const orientation = descriptor.slotOrientation ?? "horizontal";
  const slotsRegion = `${orientation}-slots`;
  const slotProducts = DESIGN_PREVIEW_FIXTURE.products.slice(0, 3);
  const renderSlot = (product: DesignPreviewFixtureProduct, index: number) => {
    const isFilled = (interaction.quantities[product.id] ?? 0) > 0;
    return isFilled ? (
      <div key={product.id} className={styles.slotCard} data-filled="true">
        <SlotProductThumbnail product={product} />
        <span className={styles.slotLabel}>{t(`${product.translationKey}.name`)}</span>
        <button
          type="button"
          className={styles.slotClearButton}
          aria-label={t("settingsDcp.preview.surface.removeProduct")}
          onClick={() => onRemoveProduct(product.id)}
        >×</button>
      </div>
    ) : (
      <button key={product.id} type="button" className={styles.slotCard} onClick={onOpenPicker}>
        <span className={styles.slotEmptyIcon} aria-hidden="true" />
        <span className={styles.slotLabel}>
          {t("settingsDcp.preview.surface.slotNumber").replace("{{number}}", String(index + 1))}
        </span>
      </button>
    );
  };

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
              {slotProducts.map((product, index) => renderSlot(product, index))}
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
        {slotProducts.map((product, index) => renderSlot(product, index))}
      </div>
    </section>
  );
}
