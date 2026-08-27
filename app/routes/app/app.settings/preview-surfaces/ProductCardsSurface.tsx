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

function PreviewCardImage({
  product = DESIGN_PREVIEW_FIXTURE.products[0],
  compact = false,
}: {
  product?: DesignPreviewFixtureProduct;
  compact?: boolean;
}) {
  return (
    <span className={compact ? styles.previewProductImageCompact : styles.previewProductImage}>
      <OptimisedImage
        src={product.imageUrl}
        width={compact ? 52 : 320}
        height={compact ? 52 : 320}
        loading="lazy"
        alt=""
      />
    </span>
  );
}

export function ProductCardsSurface({
  descriptor,
  limit,
  t,
  interaction,
  onProductQuantityChange,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  limit?: number;
  t: Translate;
  interaction: PreviewInteractionState;
  onProductQuantityChange: (productId: string, delta: number) => void;
}) {
  const mode = descriptor.productCard.mode;
  const region = mode === "row" ? "product-rows" : "product-grid";
  const columnsDesktop = descriptor.productCard.columns.desktop;
  const columnsMobile = descriptor.productCard.columns.mobile;
  const products = DESIGN_PREVIEW_FIXTURE.products.slice(0, limit);

  return (
    <section className={styles.productCardsSurface} data-preview-component="product-card">
      <div
        className={styles.productGridContainer}
        data-product-mode={mode}
        data-columns-desktop={columnsDesktop}
        data-columns-mobile={columnsMobile}
        data-preview-region={region}
      >
        {products.map((product) => {
          const quantity = interaction.quantities[product.id] ?? 0;

          if (mode === "row") {
            return (
              <article key={product.id} className={styles.rowProductCard} data-selected={quantity > 0 || undefined}>
                <PreviewCardImage product={product} compact />
                <div className={styles.rowProductDetails}>
                  <strong>{t(`${product.translationKey}.name`)}</strong>
                  <small>{t("settingsDcp.preview.surface.variant")}</small>
                  <div className={styles.priceRow}>
                    <strong>{t(`${product.translationKey}.price`)}</strong>
                    <del>{t(`${product.translationKey}.compareAt`)}</del>
                  </div>
                </div>
                <div className={styles.rowProductAction}>
                  {quantity > 0 ? (
                    <div className={styles.quantityStepper} aria-label={t("settingsDcp.preview.previewOnly")}>
                      <button type="button" onClick={() => onProductQuantityChange(product.id, -1)}>−</button>
                      <strong>{quantity}</strong>
                      <button type="button" onClick={() => onProductQuantityChange(product.id, 1)}>+</button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={styles.cardActionButton}
                      onClick={() => onProductQuantityChange(product.id, 1)}
                    >
                      {t("settingsDcp.preview.surface.add")}
                    </button>
                  )}
                </div>
              </article>
            );
          }

          // Grid & Compact Card
          return (
            <article key={product.id} className={styles.gridProductCard} data-card-variant={mode} data-selected={quantity > 0 || undefined}>
              <PreviewCardImage product={product} compact={mode === "compact"} />
              <div className={styles.gridProductCopy}>
                <strong>{t(`${product.translationKey}.name`)}</strong>
                <small>{t("settingsDcp.preview.surface.variant")}</small>
                <div className={styles.priceRow}>
                  <strong>{t(`${product.translationKey}.price`)}</strong>
                  <del>{t(`${product.translationKey}.compareAt`)}</del>
                </div>
              </div>
              {quantity > 0 ? (
                <div className={styles.quantityStepper} aria-label={t("settingsDcp.preview.previewOnly")}>
                  <button type="button" onClick={() => onProductQuantityChange(product.id, -1)}>−</button>
                  <strong>{quantity}</strong>
                  <button type="button" onClick={() => onProductQuantityChange(product.id, 1)}>+</button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.cardActionButton}
                  onClick={() => onProductQuantityChange(product.id, 1)}
                >
                  {t("settingsDcp.preview.surface.add")}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
