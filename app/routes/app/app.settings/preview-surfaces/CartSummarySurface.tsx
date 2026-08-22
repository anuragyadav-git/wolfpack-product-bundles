import React from "react";
import { OptimisedImage } from "../../../../components/OptimisedImage";
import {
  DESIGN_PREVIEW_FIXTURE,
  type DesignPreviewFixtureProduct,
  type DesignPreviewTemplateDescriptor,
  type DesignPreviewViewport,
} from "../design-preview-model";
import type { PreviewInteractionState } from "../DesignLivePreview";
import styles from "./PreviewSurfaces.module.css";

type Translate = (key: string) => string;

function SummaryProductThumb({ product }: { product: DesignPreviewFixtureProduct }) {
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

export function CartSummarySurface({
  descriptor,
  viewport,
  t,
  interaction,
  onToggleMobileSummary,
  onAdvanceProgress,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  viewport: DesignPreviewViewport;
  t: Translate;
  interaction: PreviewInteractionState;
  onToggleMobileSummary: () => void;
  onAdvanceProgress: () => void;
}) {
  const isFullPage = descriptor.family === "full-page";
  const progressPercent = Math.min(100, 25 + interaction.progressStep * 25);
  const selectedProducts = DESIGN_PREVIEW_FIXTURE.products.filter((p) => p.selected);

  // PPB In-Page and Slot Templates
  if (!isFullPage) {
    const region = descriptor.summary === "modal-footer" ? "modal-footer" : "pdp-footer";
    return (
      <section className={styles.cartSummarySurface} data-preview-region="neutral-pdp-shell">
        <div className={styles.summarySidebarCard}>
          <div className={styles.summaryHeader}>
            <span>{t("settingsDcp.preview.surface.summary")}</span>
            <small>{t("settingsDcp.preview.surface.selectedCount")}</small>
          </div>
          <div className={styles.summaryItemsList}>
            {selectedProducts.map((p) => (
              <div key={p.id} className={styles.summaryItemRow}>
                <SummaryProductThumb product={p} />
                <strong>{t(`${p.translationKey}.name`)}</strong>
                <span>{t(`${p.translationKey}.price`)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PDP Checkout Sticky Footer */}
        <footer className={styles.pdpStickyFooter} data-preview-region={region}>
          <div className={styles.pdpTotalBlock}>
            <small>{t("settingsDcp.preview.surface.totalLabel")}</small>
            <strong>{t("settingsDcp.preview.surface.totalPrice")}</strong>
          </div>
          <button type="button" className={styles.pdpAddBundleButton} disabled>
            {t("settingsDcp.preview.surface.addBundle")}
          </button>
        </footer>
      </section>
    );
  }

  // Full-Page Bundle (FPB) Sidebar & Mobile Summary
  const viewportRegions = viewport === "mobile"
    ? descriptor.sceneRegions.mobile
    : descriptor.sceneRegions.desktop;
  const region = viewportRegions.at(-1) ?? "summary-sidebar";
  const usesSlots = descriptor.summary === "slot-grid" || descriptor.summary === "compact-slots";

  return (
    <section className={styles.cartSummarySurface}>
      <aside className={styles.summarySidebarCard} data-summary={descriptor.summary} data-preview-region={region}>
        <div className={styles.summaryHeader}>
          <button
            type="button"
            onClick={viewport === "mobile" ? onToggleMobileSummary : undefined}
            style={{ border: 0, background: "transparent", font: "inherit", fontWeight: "bold", cursor: "pointer" }}
          >
            {t("settingsDcp.preview.surface.summary")}
          </button>
          <small>{t("settingsDcp.preview.surface.selectedCount")}</small>
        </div>

        {/* Discount Progress */}
        <button
          type="button"
          className={styles.discountProgressBar}
          onClick={onAdvanceProgress}
          aria-label={t("settingsDcp.preview.surface.discount")}
        >
          <span className={styles.discountProgressLabelRow}>
            <span>{t("settingsDcp.preview.surface.discount")}</span>
            <span className={styles.discountProgressTiers}>
              {DESIGN_PREVIEW_FIXTURE.discountTiers.map((tier) => `${tier.percentage}%`).join(" · ")}
            </span>
          </span>
          <span className={styles.discountProgressTrack}>
            <span className={styles.discountProgressFill} style={{ width: `${progressPercent}%` }} />
          </span>
        </button>

        {/* Slot vs Row Items */}
        {usesSlots ? (
          <div className={styles.horizontalSlotsGrid}>
            <div className={styles.slotCard} data-filled="true">
              <SummaryProductThumb product={DESIGN_PREVIEW_FIXTURE.products[0]} />
              <small>{t(`${DESIGN_PREVIEW_FIXTURE.products[0].translationKey}.name`)}</small>
            </div>
            {DESIGN_PREVIEW_FIXTURE.emptySlots.map((slot) => (
              <div key={slot.id} className={styles.slotCard}>
                <span className={styles.slotEmptyIcon}>+</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.summaryItemsList}>
            {selectedProducts.map((p) => (
              <div key={p.id} className={styles.summaryItemRow}>
                <SummaryProductThumb product={p} />
                <strong>{t(`${p.translationKey}.name`)}</strong>
                <span>{t(`${p.translationKey}.price`)}</span>
              </div>
            ))}
          </div>
        )}

        <div className={styles.summaryFooterRow}>
          <small>{t("settingsDcp.preview.surface.totalLabel")}</small>
          <strong>{t("settingsDcp.preview.surface.totalPrice")}</strong>
        </div>

        <div className={styles.summaryNavButtons}>
          <button type="button" className={styles.summaryBackButton} disabled>
            {t("settingsDcp.preview.surface.back")}
          </button>
          <button type="button" className={styles.summaryNextButton} disabled>
            {t("settingsDcp.preview.surface.next")}
          </button>
        </div>
      </aside>
    </section>
  );
}
