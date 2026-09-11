import {
  PpbCategoryRulesList,
  type PpbCategoryRulesAdapter,
  type PpbCategoryRulesListProps,
} from "./PpbCategoryRulesList";
import { getStepCategories } from "./PpbStepSetupShared";
import { PpbStepRulesList } from "./PpbStepRulesList";
import { TUTORIAL_LINKS } from "../../../lib/tutorial-links";
import { translateAdmin } from "~/i18n/config";
import { deriveControlDependencies } from "../../../lib/bundle-config/control-dependencies";
import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";
import { QuestionHelpTooltip } from "./ConfigureBundleFlow.helpers";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

type RulesStep = {
  id: string;
  StepCategory?: PpbCategoryRulesListProps["stepCategories"];
  [key: string]: unknown;
};

export type PpbRulesConfigurationCardProps = Pick<
  PpbConfigureFlow,
  "addCategoryConditionRule" | "clearCategoryConditionRules" | "conditionsState"
> & {
  categoryRulesAdapter: PpbCategoryRulesAdapter;
  step: RulesStep;
};

export function PpbRulesConfigurationCard({
  addCategoryConditionRule,
  categoryRulesAdapter,
  clearCategoryConditionRules,
  conditionsState,
  step,
}: PpbRulesConfigurationCardProps) {
  const stepCategories = getStepCategories(
    step
  ) as PpbCategoryRulesListProps["stepCategories"];
  const categoryRulesAvailable = deriveControlDependencies({
    categoryCount: stepCategories.length,
  }).categoryRulesVisible;
  const hasStepRules =
    (conditionsState.stepConditions[step.id] || []).length > 0;
  const hasCategoryRules = stepCategories.some(
    (category) => (category.conditions ?? []).length > 0
  );
  const activeRuleMode = hasCategoryRules
    ? "category"
    : hasStepRules
    ? "step"
    : "none";
  const ruleModeOptions = [
    { label: "No rules", value: "none" },
    { label: "Step rules", value: "step" },
    ...(categoryRulesAvailable
      ? [{ label: "Category rules", value: "category" }]
      : []),
  ];

  const handleRuleModeChange = (nextMode: string) => {
    if (nextMode === "none") {
      conditionsState.clearStepConditions(step.id);
      clearCategoryConditionRules(step.id);
      return;
    }
    if (nextMode === "step") {
      clearCategoryConditionRules(step.id);
      if ((conditionsState.stepConditions[step.id] || []).length === 0) {
        conditionsState.addConditionRule(step.id);
      }
      return;
    }
    if (nextMode === "category" && categoryRulesAvailable) {
      conditionsState.clearStepConditions(step.id);
      if (!hasCategoryRules) {
        addCategoryConditionRule(step.id, 0);
      }
    }
  };

  return (
    <div className={productPageBundleStyles.card}>
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
          <s-link href={TUTORIAL_LINKS.productPageRules} target="_blank">
            {translateAdmin("common.actions.learnMore")}
          </s-link>
        </s-grid>
        <s-text color="subdued">
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulescard.applyRulesToTheEntireStepOrToSpecificCategoriesToGuideYourCustom"
          )}
        </s-text>
        <div
          role="radiogroup"
          aria-label={translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulescard.rulesConfiguration"
          )}
        >
          <s-stack direction="inline" gap="base">
            {ruleModeOptions.map((opt) => (
              <label key={opt.value}>
                <input
                  type="radio"
                  name={`step-rule-mode-${step.id}`}
                  value={opt.value}
                  checked={activeRuleMode === opt.value}
                  onChange={() => handleRuleModeChange(opt.value)}
                />{" "}
                {opt.label}
              </label>
            ))}
          </s-stack>
        </div>
        {activeRuleMode === "category" ? (
          <PpbCategoryRulesList
            adapter={categoryRulesAdapter}
            step={step}
            stepCategories={stepCategories}
          />
        ) : (
          <PpbStepRulesList conditionsState={conditionsState} step={step} />
        )}
      </s-stack>
    </div>
  );
}
