import React from "react";
import { OptimisedImage } from "../../../../components/OptimisedImage";
import { DESIGN_PREVIEW_FIXTURE } from "../design-preview-model";
import styles from "./PreviewSurfaces.module.css";

type Translate = (key: string) => string;

export function LoadingSurface({
  loadingGifUrl,
  t,
}: {
  loadingGifUrl: string;
  t: Translate;
}) {
  return (
    <div className={styles.loadingOverlay} data-preview-region="loading-screen">
      {loadingGifUrl ? (
        <img className={styles.loadingGif} src={loadingGifUrl} alt="" />
      ) : (
        <s-spinner size="large" accessibilityLabel={t("settingsDcp.preview.loading")} />
      )}
    </div>
  );
}

export function ValidationSurface({ t }: { t: Translate }) {
  return (
    <div className={styles.validationToast} data-preview-region="validation-overlay" role="alert">
      <span>⚠️</span>
      <span>{t(DESIGN_PREVIEW_FIXTURE.validationMessage)}</span>
    </div>
  );
}

export function UpsellSurface({ t }: { t: Translate }) {
  const upsellProduct = DESIGN_PREVIEW_FIXTURE.upsell;

  return (
    <section className={styles.upsellCard} data-preview-region="upsell-overlay">
      <span className={styles.previewProductImageCompact}>
        <OptimisedImage
          src={upsellProduct.imageUrl}
          width={52}
          height={52}
          loading="lazy"
          alt=""
        />
      </span>
      <div className={styles.upsellContent}>
        <span className={styles.upsellEyebrow}>
          {t("settingsDcp.preview.surface.upsellEyebrow")}
        </span>
        <h4 className={styles.upsellTitle}>
          {t("settingsDcp.preview.surface.upsellTitle")}
        </h4>
        <p className={styles.upsellBody}>
          {t("settingsDcp.preview.surface.upsellBody")}
        </p>
        <strong>{t(`${upsellProduct.translationKey}.price`)}</strong>
      </div>
      <button type="button" className={styles.upsellButton} disabled>
        {t("settingsDcp.preview.surface.add")}
      </button>
    </section>
  );
}
