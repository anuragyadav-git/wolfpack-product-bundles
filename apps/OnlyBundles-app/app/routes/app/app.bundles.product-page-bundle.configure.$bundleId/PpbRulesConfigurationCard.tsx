import { PpbCategoryRulesList } from "./PpbCategoryRulesList";
import { usePpbConfigureContext } from "./PpbConfigureContext";
import { getStepCategories } from "./PpbStepSetupShared";
import { PpbStepRulesList } from "./PpbStepRulesList";
import { APP_BRAND } from "../../../lib/app-brand";
import { translateAdmin } from "~/i18n/config";

export function PpbRulesConfigurationCard({ step }: { step: any }) {
  const {
    addCategoryConditionRule,
    clearCategoryConditionRules,
    conditionsState,
    deriveControlDependencies,
    productPageBundleStyles,
    QuestionHelpTooltip,
  } = usePpbConfigureContext();
  const stepCategories = getStepCategories(step);
  const categoryRulesAvailable = deriveControlDependencies({
    categoryCount: stepCategories.length,
  }).categoryRulesVisible;
  const hasStepRules =
    (conditionsState.stepConditions[step.id] || []).length > 0;
  const hasCategoryRules = stepCategories.some(
    (category: any) => (category.conditions || []).length > 0
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
      <button
        type="button"
        className={productPageBundleStyles.linkButton}
        style={{ marginBottom: 12, display: "inline-block" }}
        onClick={() => window.open(APP_BRAND.links.company, "_blank")}
      >
        {translateAdmin("common.actions.learnMore")}
      </button>
      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 12,
        }}
      >
        {ruleModeOptions.map((opt) => (
          <s-choice-list
            key={opt.value}
            label={`${opt.label} rule mode`}
            labelAccessibilityVisibility="exclusive"
            name={`step-rule-mode-${step.id}`}
            values={activeRuleMode === opt.value ? [opt.value] : []}
            onChange={() => handleRuleModeChange(opt.value)}
          >
            <s-choice value={opt.value}>{opt.label}</s-choice>
          </s-choice-list>
        ))}
      </div>
      {activeRuleMode === "category" ? (
        <PpbCategoryRulesList step={step} stepCategories={stepCategories} />
      ) : (
        <PpbStepRulesList step={step} />
      )}
    </div>
  );
}
