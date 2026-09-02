import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { FpbStepRuleModeContent } from "./StepSetupRuleModeContent";
import { APP_BRAND } from "../../../../lib/app-brand";
import { translateAdmin } from "~/i18n/config";

export function FpbStepRulesCard({
  flow,
  step,
}: {
  flow: ConfigureBundleFlowContext;
  step: any;
}) {
  const { fullPageBundleStyles, QuestionHelpTooltip } = flow;

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
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulescard.rulesConfiguration"
            )}
          </h3>
          <QuestionHelpTooltip tooltipKey="rulesConfiguration" />
        </div>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 14,
            color: "#6d7175",
          }}
        >
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulescard.applyRulesToTheEntireStepOrToSpecificCategoriesToGuideYourCustom"
          )}
        </p>
        <button
          type="button"
          className={fullPageBundleStyles.linkButton}
          style={{ marginBottom: 12, display: "inline-block" }}
          onClick={() => window.open(APP_BRAND.links.company, "_blank")}
        >
          {translateAdmin("common.actions.learnMore")}
        </button>
        <FpbStepRuleModeContent flow={flow} step={step} />
      </div>
    </>
  );
}
