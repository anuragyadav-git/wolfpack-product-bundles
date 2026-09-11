import {
  CommonStepCategoryAccordion,
  type CommonStepCategoryAccordionAdapter,
} from "../../_shared/bundle-configure/CommonStepCategoryAccordion";
import { ConfigureVariantSelectorControls } from "../../_shared/bundle-configure/ConfigureVariantSelectorControls";
import type { VariantSelectorMode } from "../../../../lib/bundle-config/variant-selector-config";

export function FpbStepCategoryAccordion({
  adapter,
  step,
  cat,
  catIndex,
}: {
  adapter: CommonStepCategoryAccordionAdapter;
  step: any;
  cat: any;
  catIndex: number;
}) {
  const categories = Array.isArray(step.StepCategory) ? step.StepCategory : [];
  const selectorMode: VariantSelectorMode = cat.variantSelectorMode ?? "dropdown";
  const categoryBase = `steps.${step.id}.categories.${cat.id}`;
  const updateCategory = (patch: Record<string, unknown>) => {
    adapter.stepsState.updateStepField(
      step.id,
      "StepCategory",
      categories.map((category: Record<string, unknown>, index: number) =>
        index === catIndex ? { ...category, ...patch } : category
      )
    );
    adapter.markAsDirty();
  };

  return (
    <CommonStepCategoryAccordion
      adapter={adapter}
      step={step}
      cat={cat}
      catIndex={catIndex}
      categoryControls={
        <ConfigureVariantSelectorControls
          mode={selectorMode}
          swatchTooltipEnabled={cat.swatchTooltipEnabled === true}
          error={adapter.validationErrors?.[`${categoryBase}.variantSelectorMode`]}
          onChange={updateCategory}
          onClearError={() =>
            adapter.clearValidationError?.(`${categoryBase}.variantSelectorMode`)
          }
        />
      }
    />
  );
}
