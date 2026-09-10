import type { Dispatch, SetStateAction } from "react";
import { translateAdmin } from "~/i18n/config";
import {
  CATEGORY_CONDITION_OPERATOR_OPTIONS,
  STEP_CONDITION_OPERATOR_OPTIONS,
  STEP_CONDITION_TYPE_OPTIONS,
} from "../../../../constants/bundle";
import { deriveControlDependencies } from "../../../../lib/bundle-config/control-dependencies";

export function FpbStepRuleModeContent({
  rules,
  step,
}: {
  rules: {
    addCategoryConditionRule: (stepId: string, categoryIndex: number) => void;
    addStepConditionRule: (stepId: string) => void;
    categoryRulesOpen: Record<string, boolean>;
    clearCategoryConditionRules: (stepId: string) => void;
    clearStepConditions: (stepId: string) => void;
    removeCategoryConditionRule: (
      stepId: string,
      categoryIndex: number,
      ruleId: string
    ) => void;
    removeStepConditionRule: (stepId: string, ruleId: string) => void;
    setCategoryRulesOpen: Dispatch<SetStateAction<Record<string, boolean>>>;
    stepConditions: Record<
      string,
      Array<{
        id: string;
        type: string;
        operator: string;
        value: string;
        autoNext?: boolean | string;
      }>
    >;
    styles: Record<string, string>;
    updateCategoryAutoNextRule: (
      stepId: string,
      categoryIndex: number,
      enabled: boolean
    ) => void;
    updateCategoryConditionRule: (
      stepId: string,
      categoryIndex: number,
      ruleId: string,
      field: string,
      value: string
    ) => void;
    updateStepConditionRule: (
      stepId: string,
      ruleId: string,
      field: string,
      value: string
    ) => void;
  };
  step: any;
}) {
  const {
    addCategoryConditionRule,
    addStepConditionRule,
    categoryRulesOpen,
    clearCategoryConditionRules,
    clearStepConditions,
    removeCategoryConditionRule,
    removeStepConditionRule,
    setCategoryRulesOpen,
    stepConditions,
    styles,
    updateCategoryAutoNextRule,
    updateCategoryConditionRule,
    updateStepConditionRule,
  } = rules;
  const stepCategories =
    ((step as any).StepCategory as any[] | undefined) ?? [];
  const categoryRulesAvailable = deriveControlDependencies({
    categoryCount: stepCategories.length,
  }).categoryRulesVisible;
  const hasStepRules = (stepConditions[step.id] || []).length > 0;
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
      clearStepConditions(step.id);
      clearCategoryConditionRules(step.id);
      return;
    }
    if (nextMode === "step") {
      clearCategoryConditionRules(step.id);
      if ((stepConditions[step.id] || []).length === 0) {
        addStepConditionRule(step.id);
      }
      return;
    }
    if (nextMode === "category" && categoryRulesAvailable) {
      clearStepConditions(step.id);
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
        <div className={styles.categoryRulesList}>
          {stepCategories.map((cat: any, catIndex: number) => {
            const catKey = `${step.id}__${cat.id ?? catIndex}`;
            const rules = Array.isArray(cat.conditions) ? cat.conditions : [];
            const isRulesOpen = categoryRulesOpen[catKey] ?? catIndex === 0;
            const categoryLabel =
              cat.name || cat.title || `Category ${catIndex + 1}`;
            return (
              <div
                key={cat.id ?? catIndex}
                className={styles.categoryRuleAccordion}
              >
                <button
                  type="button"
                  className={styles.categoryRuleHeader}
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
                  <div className={styles.categoryRuleBody}>
                    <p className={styles.categoryRuleHelp}>
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.createRulesBasedOnAmountOrQuantityOfProductsAddedOnThisCategory"
                      )}{" "}
                      <br />{" "}
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.noteRulesAreOnlyValidOnThisCategory"
                      )}
                    </p>
                    <div className={styles.rulesList}>
                      {rules.map((rule: any, ruleIndex: number) => {
                        const ruleId = String(rule.id ?? ruleIndex);
                        return (
                          <div
                            key={ruleId}
                            className={styles.categoryRuleBlock}
                          >
                            <div className={styles.ruleHeader}>
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
                                accessibilityLabel={translateAdmin(
                                  "adminExtracted.shared.filePicker.filepickertrigger.remove"
                                )}
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
                            <div className={styles.categoryRuleFields}>
                              <s-select
                                label={translateAdmin("dashboard.table.type")}
                                labelAccessibilityVisibility="exclusive"
                                value={rule.type ?? "quantity"}
                                onChange={(e: Event) =>
                                  updateCategoryConditionRule(
                                    step.id,
                                    catIndex,
                                    ruleId,
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
                                value={
                                  rule.condition ??
                                  rule.operator ??
                                  "greaterThanOrEqualTo"
                                }
                                onChange={(e: Event) =>
                                  updateCategoryConditionRule(
                                    step.id,
                                    catIndex,
                                    ruleId,
                                    "condition",
                                    (e.currentTarget as HTMLSelectElement).value
                                  )
                                }
                              >
                                {[...CATEGORY_CONDITION_OPERATOR_OPTIONS].map(
                                  (opt) => (
                                    <s-option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </s-option>
                                  )
                                )}
                              </s-select>
                              <s-number-field
                                label={translateAdmin("adminAttributes.value")}
                                labelAccessibilityVisibility="exclusive"
                                min={0}
                                value={String(rule.value ?? "")}
                                onInput={(e: Event) =>
                                  updateCategoryConditionRule(
                                    step.id,
                                    catIndex,
                                    ruleId,
                                    "value",
                                    (e.currentTarget as HTMLInputElement).value
                                  )
                                }
                                autocomplete="off"
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
                    <div className={styles.addSectionButton}>
                      <s-button
                        variant="secondary"
                        icon="plus"
                        accessibilityLabel={translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.addRule"
                        )}
                        onClick={() =>
                          addCategoryConditionRule(step.id, catIndex)
                        }
                      >
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.addRule"
                        )}
                      </s-button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {(stepConditions[step.id] || []).length === 0 ? (
            <div className={styles.emptyState}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.noRulesDefinedYet"
              )}
            </div>
          ) : (
            <div className={styles.rulesList}>
              {(stepConditions[step.id] || []).map(
                (rule: any, ruleIndex: number) => (
                  <div key={rule.id} className={styles.ruleCard}>
                    <div className={styles.ruleHeader}>
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
                        accessibilityLabel={translateAdmin(
                          "adminExtracted.shared.filePicker.filepickertrigger.remove"
                        )}
                        onClick={() =>
                          removeStepConditionRule(step.id, rule.id)
                        }
                      >
                        {translateAdmin(
                          "adminExtracted.shared.filePicker.filepickertrigger.remove"
                        )}
                      </s-button>
                    </div>
                    <div className={styles.ruleFields}>
                      <s-select
                        label={translateAdmin("dashboard.table.type")}
                        labelAccessibilityVisibility="exclusive"
                        value={rule.type ?? ""}
                        onChange={(e: Event) =>
                          updateStepConditionRule(
                            step.id,
                            rule.id,
                            "type",
                            (e.currentTarget as HTMLSelectElement).value
                          )
                        }
                      >
                        <s-option value="" disabled>
                          {translateAdmin("dashboard.table.type")}
                        </s-option>
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
                        value={rule.operator ?? ""}
                        onChange={(e: Event) =>
                          updateStepConditionRule(
                            step.id,
                            rule.id,
                            "operator",
                            (e.currentTarget as HTMLSelectElement).value
                          )
                        }
                      >
                        <s-option value="" disabled>
                          {translateAdmin(
                            "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.condition"
                          )}
                        </s-option>
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
                          updateStepConditionRule(
                            step.id,
                            rule.id,
                            "value",
                            (e.currentTarget as HTMLInputElement).value
                          )
                        }
                        autocomplete="off"
                      />
                    </div>
                    {(stepConditions[step.id] || []).length === 1 && (
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
                          updateStepConditionRule(
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
          <div className={styles.addSectionButton}>
            <s-button
              variant="secondary"
              icon="plus"
              accessibilityLabel={translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.addRule"
              )}
              disabled={
                (stepConditions[step.id] || []).length >= 2 || undefined
              }
              onClick={() => addStepConditionRule(step.id)}
            >
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.addRule"
              )}
            </s-button>
          </div>
          {(stepConditions[step.id] || []).length >= 2 ? (
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
