import { PpbCategoryAccordion } from "./PpbCategoryAccordion";
import { usePpbConfigureContext } from "./PpbConfigureContext";
import { getStepCategories } from "./PpbStepSetupShared";
import { translateAdmin } from "~/i18n/config";

export function PpbStepCategoriesCard({ step }: { step: any }) {
  const {
    markAsDirty,
    productPageBundleStyles,
    QuestionHelpTooltip,
    stepsState,
  } = usePpbConfigureContext();
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
      {stepCategories.map((cat: any, catIndex: number) => (
        <PpbCategoryAccordion
          key={cat.id ?? catIndex}
          step={step}
          cat={cat}
          catIndex={catIndex}
        />
      ))}
      <button
        type="button"
        className={productPageBundleStyles.addSectionButton}
        onClick={() => {
          const displayVariantsForAllCategories =
            stepCategories.length > 0 &&
            stepCategories.every(
              (category: any) =>
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
        <span aria-hidden="true">
          <s-icon type="plus" />
        </span>
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupcategoryfooter.addCategory"
        )}
      </button>
    </div>
  );
}
