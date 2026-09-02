import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { translateAdmin } from "~/i18n/config";

export function FpbStepCategoryFooter({
  flow,
  step,
}: {
  flow: ConfigureBundleFlowContext;
  step: any;
}) {
  const { fullPageBundleStyles, markAsDirty, stepsState } = flow;

  return (
    <>
      <button
        type="button"
        className={fullPageBundleStyles.addSectionButton}
        onClick={() => {
          const cats = (step.StepCategory as any[]) ?? [];
          stepsState.updateStepField(step.id, "StepCategory", [
            ...cats,
            {
              id: `cat-${Date.now()}`,
              name: "",
              title: "",
              sortOrder: cats.length,
              products: [],
              collections: [],
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
      <div style={{ margin: "12px 0" }}>
        <s-divider />
      </div>
      <s-checkbox
        label={translateAdmin(
          "adminAttributes.displayVariantsAsIndividualProducts2"
        )}
        checked={step.displayVariantsAsIndividual ?? undefined}
        onChange={(e) => {
          const checked = (e.target as HTMLInputElement).checked;
          stepsState.updateStepField(
            step.id,
            "displayVariantsAsIndividual",
            checked
          );
          markAsDirty();
        }}
      />
    </>
  );
}
