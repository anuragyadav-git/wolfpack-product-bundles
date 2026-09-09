import {
  PpbCategoryAccordion,
  type PpbCategoryAccordionProps,
  type PpbCategoryAdapter,
} from "./PpbCategoryAccordion";
import { getStepCategories } from "./PpbStepSetupShared";
import { translateAdmin } from "~/i18n/config";
import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";
import { QuestionHelpTooltip } from "./ConfigureBundleFlow.helpers";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export type PpbStepCategoriesCardProps = Pick<
  PpbConfigureFlow,
  "markAsDirty" | "stepsState"
> & {
  categoryAdapter: PpbCategoryAdapter;
  step: PpbCategoryAccordionProps["step"];
};

export function PpbStepCategoriesCard({
  categoryAdapter,
  markAsDirty,
  step,
  stepsState,
}: PpbStepCategoriesCardProps) {
  const stepCategories = getStepCategories(step);

  return (
    <div className={productPageBundleStyles.card}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 4,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
          {translateAdmin("tooltips.category.title")}
        </h3>
        <QuestionHelpTooltip tooltipKey="category" />
      </div>
      <p
        style={{
          margin: "0 0 16px",
          fontSize: 14,
          color: "#6d7175",
        }}
      >
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupcategorycard.addAllProductSelectionsInThisStepToASingleCategoryOrSeparateThem"
        )}
      </p>
      {stepCategories.length === 0 && (
        <div className={productPageBundleStyles.emptyState}>
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupcategorycard.noCategoryDefinedYet"
          )}
        </div>
      )}
      {stepCategories.map((cat, catIndex) => (
        <PpbCategoryAccordion
          adapter={categoryAdapter}
          key={cat.id ?? catIndex}
          step={step}
          cat={cat}
          catIndex={catIndex}
        />
      ))}
      <s-button
        variant="secondary"
        icon="plus"
        onClick={() => {
          const displayVariantsForAllCategories =
            stepCategories.length > 0 &&
            stepCategories.every(
              (category) =>
                category.displayVariantsAsIndividualProducts === true
            );
          stepsState.updateStepField(step.id, "StepCategory", [
            ...stepCategories,
            {
              id: `cat-${Date.now()}`,
              name: "",
              title: "",
              sortOrder: stepCategories.length,
              products: [],
              collections: [],
              displayVariantsAsIndividualProducts:
                displayVariantsForAllCategories,
              variantSelectorMode: "dropdown",
              swatchTooltipEnabled: false,
            },
          ]);
          markAsDirty();
        }}
      >
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupcategoryfooter.addCategory"
        )}
      </s-button>
    </div>
  );
}
