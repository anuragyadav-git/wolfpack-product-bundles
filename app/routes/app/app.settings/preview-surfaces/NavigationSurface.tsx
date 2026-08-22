import React from "react";
import { DESIGN_PREVIEW_FIXTURE, type DesignPreviewTemplateDescriptor } from "../design-preview-model";
import styles from "./PreviewSurfaces.module.css";

type Translate = (key: string) => string;

export function NavigationSurface({
  descriptor,
  t,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  t: Translate;
}) {
  if (descriptor.navigation === "none") return null;

  const region = descriptor.navigation === "list-steps"
    ? "product-list-step-flow"
    : descriptor.navigation === "grid-steps"
      ? "product-grid-step-headers"
      : descriptor.navigation;

  // PPB Step Headers
  if (descriptor.navigation === "list-steps" || descriptor.navigation === "grid-steps") {
    return (
      <section className={styles.navigationSurface} data-preview-component="navigation">
        <div className={styles.ppbStepHeaders} data-preview-region={region}>
          {DESIGN_PREVIEW_FIXTURE.steps.map((step, index) => (
            <div key={step.id} className={styles.ppbStepHeaderCard} data-active={index === 0 || undefined}>
              <span className={styles.ppbStepNumberBadge}>{index + 1}</span>
              <div className={styles.ppbStepInfo}>
                <strong>{t(step.translationKey)}</strong>
                <small>{t("settingsDcp.preview.surface.selectionRule")}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // FPB Compact Timeline
  if (descriptor.navigation === "compact-timeline") {
    return (
      <section className={styles.navigationSurface} data-preview-component="navigation">
        <nav
          className={styles.compactTimeline}
          data-navigation="compact-timeline"
          data-preview-region={region}
          aria-label={t("settingsDcp.preview.surface.navigationLabel")}
        >
          <span className={styles.compactStepDot} data-complete="true">
            <i className={styles.compactStepDotCircle} />
            <span>{t("settingsDcp.preview.surface.stepOneShort")}</span>
          </span>
          <span className={styles.compactStepDot} data-active="true">
            <i className={styles.compactStepDotCircle} />
            <span>{t("settingsDcp.preview.surface.stepTwoShort")}</span>
          </span>
          <span className={styles.compactStepDot}>
            <i className={styles.compactStepDotCircle} />
            <span>{t("settingsDcp.preview.surface.stepThreeShort")}</span>
          </span>
        </nav>
      </section>
    );
  }

  // FPB Horizontal Timeline
  if (descriptor.navigation === "horizontal-timeline") {
    return (
      <section className={styles.navigationSurface} data-preview-component="navigation">
        <nav
          className={styles.horizontalTimeline}
          data-navigation="horizontal-timeline"
          data-preview-region={region}
          aria-label={t("settingsDcp.preview.surface.navigationLabel")}
        >
          <div className={styles.horizontalTimelineFill} style={{ width: "66%" }} />
        </nav>
      </section>
    );
  }

  // FPB Standard & Classic Timeline
  return (
    <section className={styles.navigationSurface} data-preview-component="navigation">
      <nav
        className={styles.stepTimeline}
        data-navigation="timeline"
        data-preview-region={region}
        aria-label={t("settingsDcp.preview.surface.navigationLabel")}
      >
        <span className={styles.stepBubble} data-complete="true">
          <span className={styles.stepBubbleCircle}>✓</span>
          <span>{t("settingsDcp.preview.surface.stepOneShort")}</span>
        </span>
        <span className={styles.stepConnector} />
        <span className={styles.stepBubble} data-active="true">
          <span className={styles.stepBubbleCircle}>2</span>
          <span>{t("settingsDcp.preview.surface.stepTwoShort")}</span>
        </span>
        <span className={styles.stepConnector} />
        <span className={styles.stepBubble}>
          <span className={styles.stepBubbleCircle}>3</span>
          <span>{t("settingsDcp.preview.surface.stepThreeShort")}</span>
        </span>
      </nav>
    </section>
  );
}
