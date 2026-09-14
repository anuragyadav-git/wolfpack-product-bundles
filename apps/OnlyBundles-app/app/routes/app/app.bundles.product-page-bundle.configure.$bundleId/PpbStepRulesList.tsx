import { translateAdmin } from "~/i18n/config";
import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";
import {
  STEP_CONDITION_OPERATOR_OPTIONS,
  STEP_CONDITION_TYPE_OPTIONS,
} from "../../../constants/bundle";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export type PpbStepRulesListProps = Pick<
  PpbConfigureFlow,
  "conditionsState"
> & { step: { id: string } };

export function PpbStepRulesList({
  conditionsState,
  step,
}: PpbStepRulesListProps) {
  const rules = conditionsState.stepConditions[step.id] || [];

  return (
    <>
      {rules.length === 0 ? (
        <div className={productPageBundleStyles.emptyState}>
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.noRulesDefinedYet"
          )}
        </div>
      ) : (
        <div className={productPageBundleStyles.rulesList}>
          {rules.map((rule, ruleIndex) => (
            <div key={rule.id} className={productPageBundleStyles.ruleCard}>
              <div className={productPageBundleStyles.ruleHeader}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>
                  {translateAdmin("adminDynamic.ruleNumber", {
                    number: ruleIndex + 1,
                  })}
                </h4>
                <s-button
                  variant="tertiary"
                  tone="critical"
                  icon="delete"
                  accessibilityLabel={translateAdmin(
                    "adminExtracted.shared.filePicker.filepickertrigger.remove"
                  )}
                  onClick={() =>
                    conditionsState.removeConditionRule(step.id, rule.id)
                  }
                >
                  {translateAdmin(
                    "adminExtracted.shared.filePicker.filepickertrigger.remove"
                  )}
                </s-button>
              </div>
              <div className={productPageBundleStyles.ruleFields}>
                <s-select
                  label={translateAdmin("dashboard.table.type")}
                  labelAccessibilityVisibility="exclusive"
                  placeholder={translateAdmin("dashboard.table.type")}
                  value={rule.type || undefined}
                  onChange={(e: Event) =>
                    conditionsState.updateConditionRule(
                      step.id,
                      rule.id,
                      "type",
                      (e.currentTarget as HTMLSelectElement).value
                    )
                  }
                >
                  {[...STEP_CONDITION_TYPE_OPTIONS].map((opt) => (
                    <s-option key={opt.value} value={opt.value}>
                      {opt.label}
                    </s-option>
                  ))}
                </s-select>
                <s-select
                  label={translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.condition"
                  )}
                  labelAccessibilityVisibility="exclusive"
                  placeholder={translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.condition"
                  )}
                  value={rule.operator || undefined}
                  onChange={(e: Event) =>
                    conditionsState.updateConditionRule(
                      step.id,
                      rule.id,
                      "operator",
                      (e.currentTarget as HTMLSelectElement).value
                    )
                  }
                >
                  {[...STEP_CONDITION_OPERATOR_OPTIONS].map((opt) => (
                    <s-option key={opt.value} value={opt.value}>
                      {opt.label}
                    </s-option>
                  ))}
                </s-select>
                <s-number-field
                  label={translateAdmin("adminAttributes.value")}
                  labelAccessibilityVisibility="exclusive"
                  min={0}
                  placeholder="0"
                  value={String(rule.value ?? "")}
                  onInput={(e: Event) =>
                    conditionsState.updateConditionRule(
                      step.id,
                      rule.id,
                      "value",
                      (e.currentTarget as HTMLInputElement).value
                    )
                  }
                  autocomplete="off"
                />
              </div>
              {rules.length === 1 && (
                <s-checkbox
                  label={translateAdmin(
                    "adminAttributes.autoNextWhenRuleIsMet"
                  )}
                  checked={
                    rule.autoNext === true ||
                    rule.autoNext === "true" ||
                    undefined
                  }
                  onChange={(e) => {
                    conditionsState.updateConditionRule(
                      step.id,
                      rule.id,
                      "autoNext",
                      (e.target as HTMLInputElement).checked ? "true" : "false"
                    );
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
      <s-button
        variant="secondary"
        icon="plus"
        accessibilityLabel={translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.addRule"
        )}
        disabled={rules.length >= 2 || undefined}
        onClick={() => conditionsState.addConditionRule(step.id)}
      >
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.addRule"
        )}
      </s-button>
      {rules.length >= 2 ? (
        <s-stack direction="inline" alignItems="center" gap="small">
          <s-icon type="alert-triangle" tone="caution" />
          <s-text>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.aStepCanHaveAtMost2Rules"
            )}
          </s-text>
        </s-stack>
      ) : null}
    </>
  );
}
