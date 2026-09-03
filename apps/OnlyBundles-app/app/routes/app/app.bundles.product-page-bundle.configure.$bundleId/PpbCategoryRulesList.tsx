import { usePpbConfigureContext } from "./PpbConfigureContext";
import { PlusIcon } from "./PpbStepSetupShared";
import { translateAdmin } from "~/i18n/config";

export function PpbCategoryRulesList({
  step,
  stepCategories,
}: {
  step: any;
  stepCategories: any[];
}) {
  const { categoryRulesOpen, productPageBundleStyles, setCategoryRulesOpen } =
    usePpbConfigureContext();

  return (
    <div className={productPageBundleStyles.categoryRulesList}>
      {stepCategories.map((cat: any, catIndex: number) => {
        const catKey = `${step.id}__${cat.id ?? catIndex}`;
        const rules = Array.isArray(cat.conditions) ? cat.conditions : [];
        const isRulesOpen = categoryRulesOpen[catKey] ?? catIndex === 0;
        const categoryLabel =
          cat.name || cat.title || `Category ${catIndex + 1}`;

        return (
          <div
            key={cat.id ?? catIndex}
            className={productPageBundleStyles.categoryRuleAccordion}
          >
            <button
              type="button"
              className={productPageBundleStyles.categoryRuleHeader}
              aria-expanded={isRulesOpen}
              onClick={() =>
                setCategoryRulesOpen((prev) => ({
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
              <PpbCategoryRuleBody
                step={step}
                cat={cat}
                catIndex={catIndex}
                rules={rules}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PpbCategoryRuleBody({
  step,
  cat,
  catIndex,
  rules,
}: {
  step: any;
  cat: any;
  catIndex: number;
  rules: any[];
}) {
  const {
    addCategoryConditionRule,
    CATEGORY_CONDITION_OPERATOR_OPTIONS,
    productPageBundleStyles,
    removeCategoryConditionRule,
    STEP_CONDITION_TYPE_OPTIONS,
    updateCategoryAutoNextRule,
    updateCategoryConditionRule,
  } = usePpbConfigureContext();

  return (
    <div className={productPageBundleStyles.categoryRuleBody}>
      <p className={productPageBundleStyles.categoryRuleHelp}>
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.createRulesBasedOnAmountOrQuantityOfProductsAddedOnThisCategory"
        )}{" "}
        <br />{" "}
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.noteRulesAreOnlyValidOnThisCategory"
        )}
      </p>
      <div className={productPageBundleStyles.rulesList}>
        {rules.map((rule: any, ruleIndex: number) => {
          const ruleId = String(rule.id ?? ruleIndex);

          return (
            <div
              key={ruleId}
              className={productPageBundleStyles.categoryRuleBlock}
            >
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
                    removeCategoryConditionRule(step.id, catIndex, ruleId)
                  }
                >
                  {translateAdmin(
                    "adminExtracted.shared.filePicker.filepickertrigger.remove"
                  )}
                </s-button>
              </div>
              <div className={productPageBundleStyles.categoryRuleFields}>
                <select
                  className={productPageBundleStyles.ruleInlineSelect}
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
                  aria-label={translateAdmin("dashboard.table.type")}
                >
                  {[...STEP_CONDITION_TYPE_OPTIONS].map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  className={productPageBundleStyles.ruleInlineSelect}
                  value={
                    rule.condition ?? rule.operator ?? "greaterThanOrEqualTo"
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
                  {[...CATEGORY_CONDITION_OPERATOR_OPTIONS].map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className={productPageBundleStyles.ruleInlineNumber}
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
                  aria-label={translateAdmin("adminAttributes.value")}
                />
              </div>
            </div>
          );
        })}
      </div>
      {rules.length === 1 && (
        <s-checkbox
          label={translateAdmin("adminAttributes.autoNextWhenRuleIsMet")}
          checked={cat.autoNextStepOnConditionMet === true || undefined}
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
        className={productPageBundleStyles.addSectionButton}
        onClick={() => addCategoryConditionRule(step.id, catIndex)}
      >
        <PlusIcon />
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.addRule"
        )}
      </button>
    </div>
  );
}
