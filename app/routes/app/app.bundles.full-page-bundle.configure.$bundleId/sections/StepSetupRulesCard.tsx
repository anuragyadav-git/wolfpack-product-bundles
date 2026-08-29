import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { FpbStepRuleModeContent } from "./StepSetupRuleModeContent";
import { APP_BRAND } from "../../../../lib/app-brand";

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
            Rules Configuration
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
          Apply rules to the entire step or to specific categories to guide your
          customer's selections.
        </p>
        <button
          type="button"
          className={fullPageBundleStyles.linkButton}
          style={{ marginBottom: 12, display: "inline-block" }}
          onClick={() => window.open(APP_BRAND.links.company, "_blank")}
        >
          Learn More
        </button>
        <FpbStepRuleModeContent flow={flow} step={step} />
      </div>
    </>
  );
}
