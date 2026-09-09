import type { ComponentProps } from "react";
import { FpbStepRuleModeContent } from "./StepSetupRuleModeContent";
import { TUTORIAL_LINKS } from "../../../../lib/tutorial-links";
import { translateAdmin } from "~/i18n/config";
import { QuestionHelpTooltip } from "../SmallComponents";

export function FpbStepRulesCard({
  styles,
  ruleMode,
  step,
}: {
  styles: Record<string, string>;
  ruleMode: Omit<ComponentProps<typeof FpbStepRuleModeContent>, "step">;
  step: any;
}) {
  return (
    <>
      <div className={styles.card}>
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
        <s-box paddingBlockEnd="base">
          <s-link href={TUTORIAL_LINKS.fullPageRules} target="_blank">
            {translateAdmin("common.actions.learnMore")}
          </s-link>
        </s-box>
        <FpbStepRuleModeContent {...ruleMode} step={step} />
      </div>
    </>
  );
}
