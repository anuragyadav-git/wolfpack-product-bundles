import { CommonStepCategoryAccordion } from "../_shared/bundle-configure/CommonStepCategoryAccordion";
import { updatePpbCategoryVariantFlag } from "../../../lib/bundle-config/common-configure-page-model";
import { type VariantSelectorMode } from "../../../lib/bundle-config/variant-selector-config";
import { ConfigureVariantSelectorControls } from "../_shared/bundle-configure/ConfigureVariantSelectorControls";
import { translateAdmin } from "~/i18n/config";
import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";
import {
  hidePolarisModal,
  showPolarisModal,
} from "../_shared/bundle-configure/modal-utils";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export type PpbCategoryAdapter = Pick<
  PpbConfigureFlow,
  | "categoryActiveTabs"
  | "categoryOpen"
  | "clearValidationError"
  | "draggedCatKey"
  | "dragOverCatKey"
  | "handleCatDragEnd"
  | "handleCatDragStart"
  | "handleCatDrop"
  | "markAsDirty"
  | "openStepCategoryMultiLanguageModal"
  | "setCategoryActiveTabs"
  | "setCategoryOpen"
  | "setDragOverCatKey"
  | "shopify"
  | "shopLocales"
  | "stepsState"
  | "validationErrors"
>;

type PpbCategory = {
  id?: string;
  displayVariantsAsIndividualProducts?: boolean;
  swatchTooltipEnabled?: boolean;
  variantSelectorMode?: VariantSelectorMode;
  [key: string]: unknown;
};

type PpbCategoryStep = {
  id: string;
  StepCategory?: PpbCategory[];
  [key: string]: unknown;
};

export type PpbCategoryAccordionProps = {
  adapter: PpbCategoryAdapter;
  step: PpbCategoryStep;
  cat: PpbCategory;
  catIndex: number;
};

export function PpbCategoryAccordion({
  adapter,
  step,
  cat,
  catIndex,
}: PpbCategoryAccordionProps) {
  const categories = Array.isArray(step.StepCategory) ? step.StepCategory : [];
  const selectorMode: VariantSelectorMode =
    cat.variantSelectorMode ?? "dropdown";
  const categoryBase = `steps.${step.id}.categories.${cat.id}`;

  const updateCategory = (patch: Record<string, unknown>) => {
    adapter.stepsState.updateStepField(
      step.id,
      "StepCategory",
      categories.map((category, index) =>
        index === catIndex ? { ...category, ...patch } : category
      )
    );
    adapter.markAsDirty();
  };

  return (
    <CommonStepCategoryAccordion
      adapter={{
        categoryActiveTabs: adapter.categoryActiveTabs,
        categoryOpen: adapter.categoryOpen,
        draggedCatKey: adapter.draggedCatKey,
        dragOverCatKey: adapter.dragOverCatKey,
        handleCatDragEnd: adapter.handleCatDragEnd,
        handleCatDragStart: adapter.handleCatDragStart,
        handleCatDrop: adapter.handleCatDrop,
        hidePolarisModal,
        markAsDirty: adapter.markAsDirty,
        openStepCategoryMultiLanguageModal:
          adapter.openStepCategoryMultiLanguageModal,
        setCategoryActiveTabs: adapter.setCategoryActiveTabs,
        setCategoryOpen: adapter.setCategoryOpen,
        setDragOverCatKey: adapter.setDragOverCatKey,
        shopify: adapter.shopify,
        showPolarisModal,
        stepsState: adapter.stepsState,
        styles: productPageBundleStyles,
        translationActionsDisabled: (adapter.shopLocales?.length ?? 0) === 0,
        validationErrors: adapter.validationErrors,
        clearValidationError: adapter.clearValidationError,
      }}
      step={step}
      cat={cat}
      catIndex={catIndex}
      categoryControls={
        <s-stack gap="base">
          <s-checkbox
            label={translateAdmin(
              "adminAttributes.displayVariantsAsIndividualProducts2"
            )}
            checked={cat.displayVariantsAsIndividualProducts || undefined}
            onChange={(event) => {
              const checked = (event.target as HTMLInputElement).checked;
              adapter.stepsState.updateStepField(
                step.id,
                "StepCategory",
                updatePpbCategoryVariantFlag(categories, catIndex, checked)
              );
              adapter.markAsDirty();
            }}
          />
          <ConfigureVariantSelectorControls
            disabled={cat.displayVariantsAsIndividualProducts === true}
            error={adapter.validationErrors?.[`${categoryBase}.variantSelectorMode`]}
            mode={selectorMode}
            swatchTooltipEnabled={cat.swatchTooltipEnabled === true}
            onChange={updateCategory}
            onClearError={() =>
              adapter.clearValidationError?.(`${categoryBase}.variantSelectorMode`)
            }
          />
        </s-stack>
      }
    />
  );
}
