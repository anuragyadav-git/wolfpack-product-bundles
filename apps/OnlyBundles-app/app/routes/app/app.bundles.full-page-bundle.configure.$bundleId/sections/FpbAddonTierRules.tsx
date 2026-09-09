import { CATEGORY_CONDITION_OPERATOR_OPTIONS } from "../../../../constants/bundle";
import { translateAdmin } from "~/i18n/config";

type AddonCondition = {
  id?: string | number;
  type?: string;
  condition?: string;
  value?: string | number;
};

type FpbAddonTierRulesProps = {
  actionClassName: string;
  ruleCardClassName: string;
  ruleFieldsClassName: string;
  ruleHeaderClassName: string;
  rules: AddonCondition[];
  rulesListClassName: string;
  tierIndex: number;
  tierRulesClassName: string;
  onAdd: (tierIndex: number) => void;
  onRemove: (tierIndex: number, ruleId: string) => void;
  onUpdate: (
    tierIndex: number,
    ruleId: string,
    field: string,
    value: string
  ) => void;
};

export function FpbAddonTierRules({
  actionClassName,
  ruleCardClassName,
  ruleFieldsClassName,
  ruleHeaderClassName,
  rules,
  rulesListClassName,
  tierIndex,
  tierRulesClassName,
  onAdd,
  onRemove,
  onUpdate,
}: FpbAddonTierRulesProps) {
  return (
    <div className={tierRulesClassName}>
      <h5>
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddontiereditor.tierRules"
        )}
      </h5>
      <p>
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddontiereditor.createRulesBasedOnQuantityOfProductsAddedOnThisTier"
        )}
      </p>
      <p>
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddontiereditor.noteRulesAreOnlyValidOnThisTier"
        )}
      </p>
      {rules.length > 0 ? (
        <div className={rulesListClassName}>
          {rules.map((rule, ruleIndex) => {
            const ruleId = String(rule.id ?? ruleIndex);
            return (
              <div key={ruleId} className={ruleCardClassName}>
                <div className={ruleHeaderClassName}>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>
                    {translateAdmin("adminDynamic.ruleNumber", {
                      number: ruleIndex + 1,
                    })}
                  </h4>
                  <s-button
                    variant="tertiary"
                    tone="critical"
                    icon="delete"
                    onClick={() => onRemove(tierIndex, ruleId)}
                  >
                    {translateAdmin(
                      "adminExtracted.shared.filePicker.filepickertrigger.remove"
                    )}
                  </s-button>
                </div>
                <div className={ruleFieldsClassName}>
                  <s-select
                    label={translateAdmin("dashboard.table.type")}
                    value={rule.type || "quantity"}
                    onChange={(event) =>
                      onUpdate(
                        tierIndex,
                        ruleId,
                        "type",
                        (event.target as HTMLSelectElement).value
                      )
                    }
                  >
                    <s-option value="quantity">
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.quantity"
                      )}
                    </s-option>
                    <s-option value="amount">
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.amount"
                      )}
                    </s-option>
                  </s-select>
                  <s-select
                    label={translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.condition"
                    )}
                    value={rule.condition || "lessThanOrEqualTo"}
                    onChange={(event) =>
                      onUpdate(
                        tierIndex,
                        ruleId,
                        "condition",
                        (event.target as HTMLSelectElement).value
                      )
                    }
                  >
                    {CATEGORY_CONDITION_OPERATOR_OPTIONS.map((option) => (
                      <s-option key={option.value} value={option.value}>
                        {option.label}
                      </s-option>
                    ))}
                  </s-select>
                  <s-number-field
                    label={translateAdmin("adminAttributes.value")}
                    value={String(rule.value ?? "")}
                    onInput={(event) =>
                      onUpdate(
                        tierIndex,
                        ruleId,
                        "value",
                        (event.target as HTMLInputElement).value
                      )
                    }
                    autocomplete="off"
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      <div className={actionClassName}>
        <s-button
          variant="secondary"
          onClick={() => onAdd(tierIndex)}
        >
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddontiereditor.addTierRule"
          )}
        </s-button>
      </div>
    </div>
  );
}
