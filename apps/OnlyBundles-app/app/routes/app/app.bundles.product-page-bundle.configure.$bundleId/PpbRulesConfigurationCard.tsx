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
        <s-link href={TUTORIAL_LINKS.productPageRules} target="_blank">
          {translateAdmin("common.actions.learnMore")}
        </s-link>
      </s-box>
      <s-choice-list
        label={translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulescard.rulesConfiguration"
        )}
        labelAccessibilityVisibility="exclusive"
        name={`step-rule-mode-${step.id}`}
        values={[activeRuleMode]}
        onChange={(event) => {
          const nextMode = (
            event.currentTarget as HTMLElement & { values?: string[] }
          ).values?.[0];
          if (nextMode) handleRuleModeChange(nextMode);
        }}
      >
        {ruleModeOptions.map((opt) => (
          <s-choice key={opt.value} value={opt.value}>
            {opt.label}
          </s-choice>
        ))}
      </s-choice-list>
      {activeRuleMode === "category" ? (
        <PpbCategoryRulesList
          adapter={categoryRulesAdapter}
          step={step}
          stepCategories={stepCategories}
        />
      ) : (
        <PpbStepRulesList conditionsState={conditionsState} step={step} />
      )}
    </div>
  );
}
