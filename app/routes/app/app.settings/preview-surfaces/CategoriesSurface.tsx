import React from "react";
import { DESIGN_PREVIEW_FIXTURE, type DesignPreviewTemplateDescriptor } from "../design-preview-model";
import styles from "./PreviewSurfaces.module.css";

type Translate = (key: string) => string;

export function CategoriesSurface({
  descriptor,
  t,
}: {
  descriptor: DesignPreviewTemplateDescriptor;
  t: Translate;
}) {
  if (descriptor.categories === "none") return null;

  const region = descriptor.categories === "accordion"
    ? "category-accordion"
    : descriptor.categories === "pills"
      ? "pill-categories"
      : descriptor.categories === "underline"
        ? "underline-categories"
        : "category-tabs";

  return (
    <section className={styles.categoriesSurface} data-preview-component="categories">
      <div className={styles.categorySectionHeading}>
        <span>
          <strong>{t("settingsDcp.preview.surface.categoryOne")}</strong>{" "}
          <small>{t("settingsDcp.preview.surface.selectionRule")}</small>
        </span>
        <small>{t("settingsDcp.preview.surface.progressCount")}</small>
      </div>

      {descriptor.categories === "accordion" ? (
        <div className={styles.categoryAccordion} data-preview-region={region}>
          <span>{t("settingsDcp.preview.surface.categoryOne")}</span>
          <span>⌃</span>
        </div>
      ) : descriptor.categories === "pills" ? (
        <nav
          className={styles.categoryPills}
          data-category-mode="pills"
          data-preview-region={region}
          aria-label={t("settingsDcp.preview.surface.navigationLabel")}
        >
          {DESIGN_PREVIEW_FIXTURE.categories.map((category, index) => (
            <button
              key={category.id}
              type="button"
              className={styles.categoryPillItem}
              data-active={index === 0 || undefined}
            >
              {t(category.translationKey)}
            </button>
          ))}
        </nav>
      ) : descriptor.categories === "underline" ? (
        <nav
          className={styles.categoryUnderline}
          data-category-mode="underline"
          data-preview-region={region}
          aria-label={t("settingsDcp.preview.surface.navigationLabel")}
        >
          {DESIGN_PREVIEW_FIXTURE.categories.map((category, index) => (
            <span
              key={category.id}
              className={styles.categoryUnderlineItem}
              data-active={index === 0 || undefined}
            >
              {t(category.translationKey)}
            </span>
          ))}
        </nav>
      ) : (
        <nav
          className={styles.categoryTabs}
          data-category-mode="tabs"
          data-preview-region={region}
          aria-label={t("settingsDcp.preview.surface.navigationLabel")}
        >
          {DESIGN_PREVIEW_FIXTURE.categories.map((category, index) => (
            <button
              key={category.id}
              type="button"
              className={styles.categoryTabItem}
              data-active={index === 0 || undefined}
            >
              {t(category.translationKey)}
            </button>
          ))}
        </nav>
      )}
    </section>
  );
}
