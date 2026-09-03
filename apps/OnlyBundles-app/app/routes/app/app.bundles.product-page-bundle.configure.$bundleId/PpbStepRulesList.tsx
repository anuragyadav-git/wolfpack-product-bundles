import { usePpbConfigureContext } from "./PpbConfigureContext";
import { PlusIcon } from "./PpbStepSetupShared";
import { translateAdmin } from "~/i18n/config";

export function PpbStepRulesList({ step }: { step: any }) {
  const {
    conditionsState,
    productPageBundleStyles,
    STEP_CONDITION_OPERATOR_OPTIONS,
    STEP_CONDITION_TYPE_OPTIONS,
  } = usePpbConfigureContext();
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
          {rules.map((rule: any, ruleIndex: number) => (
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
                <select
                  className={productPageBundleStyles.ruleInlineSelect}
                  value={rule.type ?? ""}
                  onChange={(e) =>
                    conditionsState.updateConditionRule(
                      step.id,
                      rule.id,
                      "type",
                      (e.target as HTMLSelectElement).value
                    )
                  }
                  aria-label={translateAdmin("dashboard.table.type")}
                >
                  <option value="" disabled>
                    {translateAdmin("dashboard.table.type")}
                  </option>
                  {[...STEP_CONDITION_TYPE_OPTIONS].map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  className={productPageBundleStyles.ruleInlineSelect}
                  value={rule.operator ?? ""}
                  onChange={(e) =>
                    conditionsState.updateConditionRule(
                      step.id,
                      rule.id,
                      "operator",
                      (e.target as HTMLSelectElement).value
                    )
                  }
                  aria-label={translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.condition"
                  )}
                >
                  <option value="" disabled>
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.condition"
                    )}
                  </option>
                  {[...STEP_CONDITION_OPERATOR_OPTIONS].map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className={productPageBundleStyles.ruleInlineNumber}
                  min={0}
                  placeholder="0"
                  value={rule.value ?? ""}
                  onInput={(e) =>
                    conditionsState.updateConditionRule(
                      step.id,
                      rule.id,
                      "value",
                      (e.target as HTMLInputElement).value
                    )
                  }
                  autoComplete="off"
                  aria-label={translateAdmin("adminAttributes.value")}
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
      <button
        type="button"
        className={productPageBundleStyles.addSectionButton}
        disabled={rules.length >= 2}
        onClick={() => conditionsState.addConditionRule(step.id)}
      >
        <PlusIcon />
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.addRule"
        )}
      </button>
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
