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
        <s-stack direction="block" gap="base">
          <s-grid
            gridTemplateColumns="minmax(0, 1fr) auto"
            gap="base"
            alignItems="center"
          >
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-heading>
                {translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulescard.rulesConfiguration"
                )}
              </s-heading>
              <QuestionHelpTooltip tooltipKey="rulesConfiguration" />
            </s-stack>
            <s-link href={TUTORIAL_LINKS.fullPageRules} target="_blank">
              {translateAdmin("common.actions.learnMore")}
            </s-link>
          </s-grid>
          <s-text color="subdued">
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulescard.applyRulesToTheEntireStepOrToSpecificCategoriesToGuideYourCustom"
            )}
          </s-text>
          <FpbStepRuleModeContent {...ruleMode} step={step} />
        </s-stack>
      </div>
    </>
  );
}
