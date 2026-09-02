import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { FpbStepCategoryAccordion } from "./StepSetupCategoryAccordion";
import { FpbStepCategoryFooter } from "./StepSetupCategoryFooter";
import { translateAdmin } from "~/i18n/config";

export function FpbStepCategoryCard({
  flow,
  step,
}: {
  flow: ConfigureBundleFlowContext;
  step: any;
}) {
  const { fullPageBundleStyles, QuestionHelpTooltip } = flow;
  const categories = (step.StepCategory as any[] | undefined) ?? [];

  return (
    <>
      <div className={fullPageBundleStyles.card}>
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
        {categories.length === 0 && (
          <div className={fullPageBundleStyles.emptyState}>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupcategorycard.noCategoryDefinedYet"
            )}
          </div>
        )}
        {categories.map((cat: any, catIndex: number) => (
          <FpbStepCategoryAccordion
            key={cat.id ?? catIndex}
            flow={flow}
            step={step}
            cat={cat}
            catIndex={catIndex}
          />
        ))}
        <FpbStepCategoryFooter flow={flow} step={step} />
      </div>
    </>
  );
}
