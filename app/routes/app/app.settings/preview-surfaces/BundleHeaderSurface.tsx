import React from "react";
import { DESIGN_PREVIEW_FIXTURE } from "../design-preview-model";
import styles from "./PreviewSurfaces.module.css";

type Translate = (key: string) => string;

export function BundleHeaderSurface({
  t,
  progressStep = 0,
  onAdvanceProgress,
}: {
  t: Translate;
  progressStep?: number;
  onAdvanceProgress?: () => void;
}) {
  const progressPercent = Math.min(100, 25 + progressStep * 25);

  return (
    <section className={styles.bundleHeaderSurface} data-preview-region="bundle-header">
      <span className={styles.bundleHeaderEyebrow}>
        {t("settingsDcp.preview.bundleType.productPage")}
      </span>
      <h3 className={styles.bundleHeaderTitle}>
        {t("settingsDcp.preview.surface.bundleName")}
      </h3>
      <p className={styles.bundleHeaderDescription}>
        {t("settingsDcp.preview.surface.description")}
      </p>
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
          <span
            className={styles.discountProgressFill}
            style={{ width: `${progressPercent}%` }}
          />
        </span>
      </button>
    </section>
  );
}
