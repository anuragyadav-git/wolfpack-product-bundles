import React from "react";
import type { DesignPreviewTemplateDescriptor, DesignPreviewViewport } from "../design-preview-model";
import { createPreviewInteractionState } from "../DesignLivePreview";
import { ProductCardsSurface } from "./ProductCardsSurface";
import styles from "./PreviewSurfaces.module.css";

type Translate = (key: string) => string;

export function ProductPickerSurface({
  descriptor,
  viewport,
  t,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  viewport: DesignPreviewViewport;
  t: Translate;
}) {
  const region = viewport === "mobile" ? "product-picker-bottom-sheet" : "product-picker-modal";

  return (
    <section className={styles.productPickerSurface} data-preview-region={region}>
      <div className={styles.modalSheetShell}>
        <div className={styles.modalSheetHeader}>
          <strong>{t("settingsDcp.preview.surface.chooseProduct")}</strong>
          <button type="button" className={styles.modalSheetClose} aria-label="Close">×</button>
        </div>
        <ProductCardsSurface
          descriptor={descriptor}
          limit={3}
          t={t}
          interaction={createPreviewInteractionState()}
          onProductQuantityChange={() => undefined}
        />
      </div>
    </section>
  );
}
