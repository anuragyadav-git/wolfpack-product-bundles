import {
  getBogoDiscountInputValue,
  getBogoDiscountStoredValue,
} from "../../../../lib/pricing-progress-tier-defaults";
import type { PricingRule } from "../../../../types/pricing";
import { translateAdmin } from "~/i18n/config";

type PricingState = {
  currencySymbol: string;
  updateDiscountRule: (ruleId: string, updates: Partial<PricingRule>) => void;
};

type FpbBxyDiscountRuleFieldsProps = {
  bodyClassName: string;
  rewardGridClassName: string;
  pricingState: PricingState;
  rule: PricingRule;
  validationErrors: Record<string, string>;
};

export function FpbBxyDiscountRuleFields({
  bodyClassName,
  rewardGridClassName,
  pricingState,
  rule,
  validationErrors,
}: FpbBxyDiscountRuleFieldsProps) {
  return (
    <div className={bodyClassName}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.customerBuys"
        )}
      </p>
      <s-number-field
        id={`configure-discount-rules-${rule.id}-customerBuys`}
        label={translateAdmin("adminAttributes.minimumQuantityOfItems")}
        required
        error={validationErrors[`discount.rules.${rule.id}.customerBuys`]}
        value={String(rule.customerBuys ?? 2)}
        onInput={(event) =>
          pricingState.updateDiscountRule(rule.id, {
            customerBuys: Math.max(
              1,
              Number((event.target as HTMLInputElement).value) || 1
            ),
          })
        }
        min={1}
      />
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.customerGets"
        )}
      </p>
      <s-number-field
        id={`configure-discount-rules-${rule.id}-customerGets`}
        label={translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.quantity"
        )}
        required
        error={validationErrors[`discount.rules.${rule.id}.customerGets`]}
        value={String(rule.customerGets ?? 1)}
        onInput={(event) =>
          pricingState.updateDiscountRule(rule.id, {
            customerGets: Math.max(
              1,
              Number((event.target as HTMLInputElement).value) || 1
            ),
          })
        }
        min={1}
      />
      <div className={rewardGridClassName}>
        <s-number-field
          id={`configure-discount-rules-${rule.id}-discountValue`}
          label={translateAdmin("adminAttributes.discountValue")}
          required
          error={validationErrors[`discount.rules.${rule.id}.discountValue`]}
          value={String(
            getBogoDiscountInputValue(
              rule.discountValue ?? 0,
              rule.bxyDiscountType ?? "percentage"
            )
          )}
          onInput={(event) =>
            pricingState.updateDiscountRule(rule.id, {
              discountValue: (() => {
                const nextValue =
                  Number((event.target as HTMLInputElement).value) || 0;
                return (rule.bxyDiscountType ?? "percentage") === "percentage"
                  ? nextValue
                  : getBogoDiscountStoredValue(
                      Math.max(0, nextValue),
                      "fixed_amount"
                    );
              })(),
            })
          }
          min={0}
          suffix={
            (rule.bxyDiscountType ?? "percentage") === "percentage"
              ? "%"
              : undefined
          }
          prefix={
            (rule.bxyDiscountType ?? "percentage") === "fixed_amount"
              ? pricingState.currencySymbol
              : undefined
          }
          max={
            (rule.bxyDiscountType ?? "percentage") === "percentage"
              ? 100
              : undefined
          }
          step={
            (rule.bxyDiscountType ?? "percentage") === "percentage"
              ? 1
              : undefined
          }
          inputMode={
            (rule.bxyDiscountType ?? "percentage") === "percentage"
              ? "numeric"
              : "decimal"
          }
        />
        <s-select
          label={translateAdmin("adminAttributes.discountType")}
          value={rule.bxyDiscountType ?? "percentage"}
          onChange={(event) => {
            const bxyDiscountType = (event.target as HTMLSelectElement)
              .value as "percentage" | "fixed_amount";
            const currentValue = getBogoDiscountInputValue(
              Number(rule.discountValue ?? 0) || 0,
              rule.bxyDiscountType ?? "percentage"
            );
            pricingState.updateDiscountRule(rule.id, {
              bxyDiscountType,
              discountValue:
                bxyDiscountType === "percentage"
                  ? currentValue
                  : getBogoDiscountStoredValue(
                      Math.max(0, currentValue),
                      "fixed_amount"
                    ),
            });
          }}
        >
          <s-option value="percentage">
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.off"
            )}
          </s-option>
          <s-option value="fixed_amount">
            {translateAdmin("adminDynamic.amountOff", {
              amount: pricingState.currencySymbol,
            })}
          </s-option>
        </s-select>
        <s-select
          label={translateAdmin("adminAttributes.applyDiscountTo")}
          value={rule.bxyApplyMode ?? "lowest_priced"}
          onChange={(event) =>
            pricingState.updateDiscountRule(rule.id, {
              bxyApplyMode: (event.target as HTMLSelectElement).value as
                | "lowest_priced"
                | "latest_added",
            })
          }
        >
          <s-option value="lowest_priced">
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.theLowestPricedItems"
            )}
          </s-option>
          <s-option value="latest_added">
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.theLatestAddedItems"
            )}
          </s-option>
        </s-select>
      </div>
    </div>
  );
}
