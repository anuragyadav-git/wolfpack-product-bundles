import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { translateAdmin } from "~/i18n/config";

export function FpbStepRuleModeContent({
  flow,
  step,
}: {
  flow: ConfigureBundleFlowContext;
  step: any;
}) {
  const {
    addCategoryConditionRule,
    CATEGORY_CONDITION_OPERATOR_OPTIONS,
    categoryRulesOpen,
    clearCategoryConditionRules,
    conditionsState,
    deriveControlDependencies,
    fullPageBundleStyles,
    removeCategoryConditionRule,
    setCategoryRulesOpen,
    STEP_CONDITION_OPERATOR_OPTIONS,
    STEP_CONDITION_TYPE_OPTIONS,
    updateCategoryAutoNextRule,
    updateCategoryConditionRule,
  } = flow;
  const stepCategories =
    ((step as any).StepCategory as any[] | undefined) ?? [];
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
      return;
    }
  };
  const ruleModeOptions = [
    { label: "No rules", value: "none" },
    { label: "Step rules", value: "step" },
    ...(categoryRulesAvailable
      ? [{ label: "Category rules", value: "category" }]
      : []),
  ];

  return (
    <>
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
        <div className={fullPageBundleStyles.categoryRulesList}>
          {stepCategories.map((cat: any, catIndex: number) => {
            const catKey = `${step.id}__${cat.id ?? catIndex}`;
            const rules = Array.isArray(cat.conditions) ? cat.conditions : [];
            const isRulesOpen = categoryRulesOpen[catKey] ?? catIndex === 0;
            const categoryLabel =
              cat.name || cat.title || `Category ${catIndex + 1}`;
            return (
              <div
                key={cat.id ?? catIndex}
                className={fullPageBundleStyles.categoryRuleAccordion}
              >
                <button
                  type="button"
                  className={fullPageBundleStyles.categoryRuleHeader}
                  aria-expanded={isRulesOpen}
                  onClick={() =>
                    setCategoryRulesOpen((prev: Record<string, boolean>) => ({
                      ...prev,
                      [catKey]: !isRulesOpen,
                    }))
                  }
                >
                  <span>
                    {translateAdmin("adminDynamic.categoryRules", {
                      category: categoryLabel,
                    })}
                  </span>
                  <span aria-hidden="true">{isRulesOpen ? "⌃" : "⌄"}</span>
                </button>
                {isRulesOpen && (
                  <div className={fullPageBundleStyles.categoryRuleBody}>
                    <p className={fullPageBundleStyles.categoryRuleHelp}>
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.createRulesBasedOnAmountOrQuantityOfProductsAddedOnThisCategory"
                      )}{" "}
                      <br />{" "}
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.noteRulesAreOnlyValidOnThisCategory"
                      )}
                    </p>
                    <div className={fullPageBundleStyles.rulesList}>
                      {rules.map((rule: any, ruleIndex: number) => {
                        const ruleId = String(rule.id ?? ruleIndex);
                        return (
                          <div
                            key={ruleId}
                            className={fullPageBundleStyles.categoryRuleBlock}
                          >
                            <div className={fullPageBundleStyles.ruleHeader}>
                              <h4
                                style={{
                                  margin: 0,
                                  fontSize: 14,
                                  fontWeight: 650,
                                }}
                              >
                                {translateAdmin("adminDynamic.ruleNumber", {
                                  number: ruleIndex + 1,
                                })}
                              </h4>
                              <s-button
                                variant="tertiary"
                                tone="critical"
                                icon="delete"
                                onClick={() =>
                                  removeCategoryConditionRule(
                                    step.id,
                                    catIndex,
                                    ruleId
                                  )
                                }
                              >
                                {translateAdmin(
                                  "adminExtracted.shared.filePicker.filepickertrigger.remove"
                                )}
                              </s-button>
                            </div>
                            <div
                              className={
                                fullPageBundleStyles.categoryRuleFields
                              }
                            >
                              <select
                                className={
                                  fullPageBundleStyles.ruleInlineSelect
                                }
                                value={rule.type ?? "quantity"}
                                onChange={(e) =>
                                  updateCategoryConditionRule(
                                    step.id,
                                    catIndex,
                                    ruleId,
                                    "type",
                                    (e.target as HTMLSelectElement).value
                                  )
                                }
                                aria-label={translateAdmin(
                                  "dashboard.table.type"
                                )}
                              >
                                {[...STEP_CONDITION_TYPE_OPTIONS].map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <select
                                className={
                                  fullPageBundleStyles.ruleInlineSelect
                                }
                                value={
                                  rule.condition ??
                                  rule.operator ??
                                  "greaterThanOrEqualTo"
                                }
                                onChange={(e) =>
                                  updateCategoryConditionRule(
                                    step.id,
                                    catIndex,
                                    ruleId,
                                    "condition",
                                    (e.target as HTMLSelectElement).value
                                  )
                                }
                                aria-label={translateAdmin(
                                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.condition"
                                )}
                              >
                                {[...CATEGORY_CONDITION_OPERATOR_OPTIONS].map(
                                  (opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  )
                                )}
                              </select>
                              <input
                                type="number"
                                className={
                                  fullPageBundleStyles.ruleInlineNumber
                                }
                                min={0}
                                value={rule.value ?? ""}
                                onChange={(e) =>
                                  updateCategoryConditionRule(
                                    step.id,
                                    catIndex,
                                    ruleId,
                                    "value",
                                    (e.target as HTMLInputElement).value
                                  )
                                }
                                autoComplete="off"
                                aria-label={translateAdmin(
                                  "adminAttributes.value"
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {rules.length === 1 && (
                      <s-checkbox
                        label={translateAdmin(
                          "adminAttributes.autoNextWhenRuleIsMet"
                        )}
                        checked={
                          cat.autoNextStepOnConditionMet === true || undefined
                        }
                        onChange={(e) =>
                          updateCategoryAutoNextRule(
                            step.id,
                            catIndex,
                            (e.target as HTMLInputElement).checked
                          )
                        }
                      />
                    )}
                    <button
                      type="button"
                      className={fullPageBundleStyles.addSectionButton}
                      onClick={() =>
                        addCategoryConditionRule(step.id, catIndex)
                      }
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M7 1v12M1 7h12"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.addRule"
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {(conditionsState.stepConditions[step.id] || []).length === 0 ? (
            <div className={fullPageBundleStyles.emptyState}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.noRulesDefinedYet"
              )}
            </div>
          ) : (
            <div className={fullPageBundleStyles.rulesList}>
              {(conditionsState.stepConditions[step.id] || []).map(
                (rule: any, ruleIndex: number) => (
                  <div key={rule.id} className={fullPageBundleStyles.ruleCard}>
                    <div className={fullPageBundleStyles.ruleHeader}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 650,
                        }}
                      >
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
                    <div className={fullPageBundleStyles.ruleFields}>
                      <select
                        className={fullPageBundleStyles.ruleInlineSelect}
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
                        className={fullPageBundleStyles.ruleInlineSelect}
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
                        className={fullPageBundleStyles.ruleInlineNumber}
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
                    {(conditionsState.stepConditions[step.id] || []).length ===
                      1 && (
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
                            (e.target as HTMLInputElement).checked
                              ? "true"
                              : "false"
                          );
                        }}
                      />
                    )}
                  </div>
                )
              )}
            </div>
          )}
          <button
            type="button"
            className={fullPageBundleStyles.addSectionButton}
            disabled={
              (conditionsState.stepConditions[step.id] || []).length >= 2
            }
            onClick={() => conditionsState.addConditionRule(step.id)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 1v12M1 7h12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.addRule"
            )}
          </button>
          {(conditionsState.stepConditions[step.id] || []).length >= 2 ? (
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
      )}
    </>
  );
}
