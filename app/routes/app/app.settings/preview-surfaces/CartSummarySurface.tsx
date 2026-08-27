import React from "react";
import { OptimisedImage } from "../../../../components/OptimisedImage";
import {
  DESIGN_PREVIEW_FIXTURE,
  type DesignPreviewFixtureProduct,
  type DesignPreviewTemplateDescriptor,
  type DesignPreviewViewport,
} from "../design-preview-model";
import { getPreviewSelectionSummary, type PreviewInteractionState } from "../DesignLivePreview";
import styles from "./PreviewSurfaces.module.css";

type Translate = (key: string, options?: { count?: number }) => string;

function formatPreviewCurrency(totalCents: number, locale?: string) {
  return new Intl.NumberFormat(locale ?? "en", {
    style: "currency",
    currency: "USD",
  }).format(totalCents / 100);
}

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
  onRetreatProgress,
  onComplete,
  locale,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  viewport: DesignPreviewViewport;
  t: Translate;
  interaction: PreviewInteractionState;
  onToggleMobileSummary: () => void;
  onAdvanceProgress: () => void;
  onRetreatProgress: () => void;
  onComplete: () => void;
  locale?: string;
}) {
  const isFullPage = descriptor.family === "full-page";
  const progressPercent = Math.min(100, 25 + interaction.progressStep * 25);
  const selection = getPreviewSelectionSummary(interaction);
  const total = formatPreviewCurrency(selection.totalCents, locale);
  const feedback = interaction.discountFeedback.state;

  // PPB In-Page and Slot Templates
  if (!isFullPage) {
    const region = descriptor.summary === "modal-footer" ? "modal-footer" : "pdp-footer";
    return (
      <section className={styles.cartSummarySurface} data-preview-region="neutral-pdp-shell">
        <div className={styles.summarySidebarCard}>
          <div className={styles.summaryHeader}>
            <span>{t("settingsDcp.preview.surface.summary")}</span>
            <small>{t("settingsDcp.preview.surface.selectedCount", { count: selection.itemCount })}</small>
          </div>
          <div className={styles.summaryItemsList}>
            {selection.products.map(({ product, quantity }) => (
              <div key={product.id} className={styles.summaryItemRow}>
                <SummaryProductThumb product={product} />
                <strong>{t(`${product.translationKey}.name`)} ×{quantity}</strong>
                <span>{formatPreviewCurrency(product.priceCents * quantity, locale)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PDP Checkout Sticky Footer */}
        <footer className={styles.pdpStickyFooter} data-preview-region={region}>
          <div className={styles.pdpTotalBlock}>
            <small>{t("settingsDcp.preview.surface.totalLabel")}</small>
            <strong>{total}</strong>
          </div>
          <button type="button" className={styles.pdpAddBundleButton} onClick={onComplete}>
            {t("settingsDcp.preview.surface.addBundle")}
          </button>
        </footer>
        {feedback ? (
          <div className={styles.discountFeedback} data-preview-discount-feedback={feedback} role="status">
            {t(`settingsDcp.preview.feedback.${feedback === "tier" ? "tierHit" : "complete"}`)}
          </div>
        ) : null}
      </section>
    );
  }

  // Full-Page Bundle (FPB) Sidebar & Mobile Summary
  const viewportRegions = viewport === "mobile"
    ? descriptor.sceneRegions.mobile
    : descriptor.sceneRegions.desktop;
  const region = viewportRegions.at(-1) ?? "summary-sidebar";
  const usesSlots = descriptor.summary === "slot-grid" || descriptor.summary === "compact-slots";
  const isExpanded = viewport !== "mobile" || interaction.isMobileSummaryOpen;

  return (
    <section className={styles.cartSummarySurface}>
      <aside
        className={styles.summarySidebarCard}
        data-summary={descriptor.summary}
        data-preview-region={region}
        data-expanded={isExpanded}
      >
        <div className={styles.summaryHeader}>
          <button
            type="button"
            onClick={viewport === "mobile" ? onToggleMobileSummary : undefined}
            style={{ border: 0, background: "transparent", font: "inherit", fontWeight: "bold", cursor: "pointer" }}
          >
            {t("settingsDcp.preview.surface.summary")}
          </button>
          <small>{t("settingsDcp.preview.surface.selectedCount", { count: selection.itemCount })}</small>
        </div>

        {isExpanded ? <>
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
            {DESIGN_PREVIEW_FIXTURE.products.slice(0, 3).map((product) => (
              (interaction.quantities[product.id] ?? 0) > 0 ? (
                <div key={product.id} className={styles.slotCard} data-filled="true">
                  <SummaryProductThumb product={product} />
                  <small>{t(`${product.translationKey}.name`)}</small>
                </div>
              ) : (
                <div key={product.id} className={styles.slotCard}>
                  <span className={styles.slotEmptyIcon}>+</span>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className={styles.summaryItemsList}>
            {selection.products.map(({ product, quantity }) => (
              <div key={product.id} className={styles.summaryItemRow}>
                <SummaryProductThumb product={product} />
                <strong>{t(`${product.translationKey}.name`)} ×{quantity}</strong>
                <span>{formatPreviewCurrency(product.priceCents * quantity, locale)}</span>
              </div>
            ))}
          </div>
        )}

        <div className={styles.summaryFooterRow}>
          <small>{t("settingsDcp.preview.surface.totalLabel")}</small>
          <strong>{total}</strong>
        </div>

        {feedback ? (
          <div className={styles.discountFeedback} data-preview-discount-feedback={feedback} role="status">
            {t(`settingsDcp.preview.feedback.${feedback === "tier" ? "tierHit" : "complete"}`)}
          </div>
        ) : null}

        <div className={styles.summaryNavButtons}>
          <button
            type="button"
            className={styles.summaryBackButton}
            disabled={interaction.progressStep === 0}
            onClick={onRetreatProgress}
          >
            {t("settingsDcp.preview.surface.back")}
          </button>
          <button type="button" className={styles.summaryNextButton} onClick={onAdvanceProgress}>
            {t("settingsDcp.preview.surface.next")}
          </button>
        </div>
        </> : null}
      </aside>
    </section>
  );
}
