import { useEffect, useState } from "react";

import { CommonStepCategoryAccordion } from "../_shared/bundle-configure/CommonStepCategoryAccordion";
import { updatePpbCategoryVariantFlag } from "../../../lib/bundle-config/common-configure-page-model";
import {
  parseVariantColorMapText,
  serializeVariantColorMap,
  type VariantSelectorMode,
} from "../../../lib/bundle-config/variant-selector-config";
import { usePpbConfigureContext } from "./PpbConfigureContext";

export function PpbCategoryAccordion({
  step,
  cat,
  catIndex,
}: {
  step: any;
  cat: any;
  catIndex: number;
}) {
  const flow = usePpbConfigureContext();
  const categories = ((step.StepCategory as any[]) ?? []);
  const persistedColorMapText = serializeVariantColorMap(cat.variantColorMap);
  const [colorMapText, setColorMapText] = useState(persistedColorMapText);
  const [colorMapError, setColorMapError] = useState<string | undefined>();
  const selectorMode: VariantSelectorMode = cat.variantSelectorMode ?? "dropdown";
  const categoryBase = `steps.${step.id}.categories.${cat.id}`;

  useEffect(() => {
    setColorMapText(persistedColorMapText);
    setColorMapError(undefined);
  }, [cat.id, persistedColorMapText]);

  const updateCategory = (patch: Record<string, unknown>) => {
    flow.stepsState.updateStepField(
      step.id,
      "StepCategory",
      categories.map((category, index) =>
        index === catIndex ? { ...category, ...patch } : category,
      ),
    );
    flow.markAsDirty();
  };

  return (
    <CommonStepCategoryAccordion
      adapter={{
        categoryActiveTabs: flow.categoryActiveTabs,
        categoryOpen: flow.categoryOpen,
        draggedCatKey: flow.draggedCatKey,
        dragOverCatKey: flow.dragOverCatKey,
        handleCatDragEnd: flow.handleCatDragEnd,
        handleCatDragStart: flow.handleCatDragStart,
        handleCatDrop: flow.handleCatDrop,
        hidePolarisModal: flow.hidePolarisModal,
        markAsDirty: flow.markAsDirty,
        openStepCategoryMultiLanguageModal:
          flow.openStepCategoryMultiLanguageModal,
        setCategoryActiveTabs: flow.setCategoryActiveTabs,
        setCategoryOpen: flow.setCategoryOpen,
        setDragOverCatKey: flow.setDragOverCatKey,
        shopify: flow.shopify,
        showPolarisModal: flow.showPolarisModal,
        stepsState: flow.stepsState,
        styles: flow.productPageBundleStyles,
        translationActionsDisabled: (flow.shopLocales?.length ?? 0) === 0,
        validationErrors: flow.validationErrors,
        clearValidationError: flow.clearValidationError,
      }}
      step={step}
      cat={cat}
      catIndex={catIndex}
      categoryControls={
        <s-stack gap="base">
          <s-checkbox
            label="Display variants as individual products"
            checked={cat.displayVariantsAsIndividualProducts || undefined}
            onChange={(event) => {
              const checked = (event.target as HTMLInputElement).checked;
              flow.stepsState.updateStepField(
                step.id,
                "StepCategory",
                updatePpbCategoryVariantFlag(categories, catIndex, checked),
              );
              flow.markAsDirty();
            }}
          />
          <s-select
            label="Variant selector style"
            value={selectorMode}
            disabled={cat.displayVariantsAsIndividualProducts || undefined}
            error={flow.validationErrors?.[`${categoryBase}.variantSelectorMode`]}
            onChange={(event) => {
              const variantSelectorMode = event.currentTarget.value as VariantSelectorMode;
              updateCategory({
                variantSelectorMode,
                ...(variantSelectorMode === "color_swatch"
                  ? {}
                  : { swatchTooltipEnabled: false }),
              });
              flow.clearValidationError?.(`${categoryBase}.variantSelectorMode`);
            }}
          >
            <s-option value="dropdown">Dropdown</s-option>
            <s-option value="pill">Pills</s-option>
            <s-option value="color_swatch">Color swatches</s-option>
            <s-option value="image_swatch">Image swatches</s-option>
          </s-select>
          {selectorMode === "color_swatch" ? (
            <>
              <s-switch
                label="Show color name on hover and focus"
                checked={cat.swatchTooltipEnabled || undefined}
                disabled={cat.displayVariantsAsIndividualProducts || undefined}
                onChange={(event) =>
                  updateCategory({
                    swatchTooltipEnabled: event.currentTarget.checked,
                  })
                }
              />
              <s-stack gap="small">
                <s-text-area
                  label="Color mappings"
                  value={colorMapText}
                  disabled={cat.displayVariantsAsIndividualProducts || undefined}
                  error={
                    colorMapError ??
                    flow.validationErrors?.[`${categoryBase}.variantColorMap`]
                  }
                  onInput={(event) => {
                    const value = event.currentTarget.value ?? "";
                    setColorMapText(value);
                    try {
                      const variantColorMap = parseVariantColorMapText(value);
                      setColorMapError(undefined);
                      updateCategory({ variantColorMap });
                      flow.clearValidationError?.(`${categoryBase}.variantColorMap`);
                    } catch (error) {
                      const message = error instanceof Error
                        ? error.message
                        : "Enter valid color mappings.";
                      setColorMapError(message);
                      updateCategory({ variantColorMap: value });
                    }
                  }}
                />
                <s-paragraph>
                  Use one mapping per line: option value = #RRGGBB.
                </s-paragraph>
              </s-stack>
            </>
          ) : null}
        </s-stack>
      }
    />
  );
}
