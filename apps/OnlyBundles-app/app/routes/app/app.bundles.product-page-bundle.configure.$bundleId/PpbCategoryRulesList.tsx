import { translateAdmin } from "~/i18n/config";
import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";
import {
  CATEGORY_CONDITION_OPERATOR_OPTIONS,
  STEP_CONDITION_TYPE_OPTIONS,
} from "../../../constants/bundle";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export type PpbCategoryRulesAdapter = Pick<
  PpbConfigureFlow,
  | "addCategoryConditionRule"
  | "categoryRulesOpen"
  | "removeCategoryConditionRule"
  | "setCategoryRulesOpen"
  | "updateCategoryAutoNextRule"
  | "updateCategoryConditionRule"
>;

type CategoryConditionRule = {
  id?: string | number;
  condition?: string;
  operator?: string;
  type?: string;
  value?: string | number;
};

type RuleCategory = {
  id?: string;
  name?: string;
  title?: string;
  conditions?: CategoryConditionRule[];
  autoNextStepOnConditionMet?: boolean;
};

export type PpbCategoryRulesListProps = {
  adapter: PpbCategoryRulesAdapter;
  step: { id: string };
  stepCategories: RuleCategory[];
};

export function PpbCategoryRulesList({
  adapter,
  step,
  stepCategories,
}: PpbCategoryRulesListProps) {
  const { categoryRulesOpen, setCategoryRulesOpen } = adapter;

  return (
    <div className={productPageBundleStyles.categoryRulesList}>
      {stepCategories.map((cat, catIndex) => {
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
                adapter={adapter}
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
  adapter,
  step,
  cat,
  catIndex,
  rules,
}: {
  adapter: PpbCategoryRulesAdapter;
  step: { id: string };
  cat: RuleCategory;
  catIndex: number;
  rules: CategoryConditionRule[];
}) {
  const {
    addCategoryConditionRule,
    removeCategoryConditionRule,
    updateCategoryAutoNextRule,
    updateCategoryConditionRule,
  } = adapter;

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
        {rules.map((rule, ruleIndex) => {
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
                    rule.condition ?? rule.operator ?? "greaterThanOrEqualTo"
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
                  {[...CATEGORY_CONDITION_OPERATOR_OPTIONS].map((opt) => (
                    <s-option key={opt.value} value={opt.value}>
                      {opt.label}
                    </s-option>
                  ))}
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
      <s-button
        variant="secondary"
        icon="plus"
        onClick={() => addCategoryConditionRule(step.id, catIndex)}
      >
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.addRule"
        )}
      </s-button>
    </div>
  );
}
