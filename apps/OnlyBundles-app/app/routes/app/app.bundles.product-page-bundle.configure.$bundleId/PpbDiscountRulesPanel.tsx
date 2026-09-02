import { usePpbConfigureContext } from "./PpbConfigureContext";
import {
  getBogoDiscountInputValue,
  getBogoDiscountStoredValue,
} from "../../../lib/pricing-progress-tier-defaults";
import { DiscountPricingTipBanner } from "../_shared/bundle-configure/DiscountPricingTipBanner";
import { DisabledConfigurationRegion } from "../_shared/bundle-configure/DisabledConfigurationRegion";
import { PricingTierBadgeFields } from "../_shared/bundle-configure/PricingTierBadgeFields";
import { translateAdmin } from "~/i18n/config";

export function PpbDiscountRulesPanel() {
  const {
    DISCOUNT_METHOD_OPTIONS,
    DiscountMethod,
    pricingState,
    setGlobalSuccessMessage,
    setRuleMessages,
    setRuleMessagesByLocale,
    setSuccessMessageByLocale,
  } = usePpbConfigureContext();

  return (
    <s-section>
      <s-stack direction="block" gap="base">
        <s-stack direction="block" gap="small-400">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.discountAmpPricing"
              )}
            </h3>
            <s-switch
              accessibilityLabel={translateAdmin(
                "adminAttributes.enableDiscountPricing"
              )}
              checked={pricingState.discountEnabled || undefined}
              onChange={(e) =>
                pricingState.setDiscountEnabled(
                  (e.target as HTMLInputElement).checked
                )
              }
            />
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "#6d7175" }}>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.setUpDiscountRulesAppliedFromLowestToHighest"
            )}
          </p>
        </s-stack>
        <DiscountPricingTipBanner />
        <DisabledConfigurationRegion disabled={!pricingState.discountEnabled}>
          <s-stack direction="block" gap="base">
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600 }}>
                {translateAdmin(
                  "adminExtracted.appBundlesProductPageBundleConfigure.ppbdiscountrulespanel.discountType"
                )}
              </p>
              <s-select
                value={pricingState.discountType}
                onChange={(e) => {
                  const nextDiscountType = (e.target as HTMLSelectElement)
                    .value as typeof pricingState.discountType;
                  pricingState.replaceDiscountMethod(nextDiscountType);
                  setRuleMessages({});
                  setRuleMessagesByLocale({});
                  setGlobalSuccessMessage("");
                  setSuccessMessageByLocale({});
                }}
              >
                {[...DISCOUNT_METHOD_OPTIONS].map((opt) => (
                  <s-option key={opt.value} value={opt.value}>
                    {opt.label}
                  </s-option>
                ))}
              </s-select>
            </div>
            {pricingState.discountType === DiscountMethod.BUY_X_GET_Y ? (
              <PpbBuyXGetYRules />
            ) : (
              <PpbStandardDiscountRules />
            )}
          </s-stack>
        </DisabledConfigurationRegion>
      </s-stack>
    </s-section>
  );
}

function PpbBuyXGetYRules() {
  const {
    pricingState,
    productPageBundleStyles,
    validationErrors = {},
  } = usePpbConfigureContext();

  return (
    <s-stack direction="block" gap="small">
      {pricingState.discountRules.map((rule, index) => (
        <div key={rule.id} className={productPageBundleStyles.discountRuleCard}>
          <s-stack direction="block" gap="small">
            <div className={productPageBundleStyles.discountRuleHeader}>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                {translateAdmin("adminDynamic.ruleNumber", {
                  number: index + 1,
                })}
              </h4>
              <s-button
                variant="tertiary"
                tone="critical"
                icon="delete"
                onClick={() => pricingState.removeDiscountRule(rule.id)}
              >
                {translateAdmin(
                  "adminExtracted.shared.filePicker.filepickertrigger.remove"
                )}
              </s-button>
            </div>
            <div className={productPageBundleStyles.bxyRuleBody}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                {translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.customerBuys"
                )}
              </p>
              <s-number-field
                id={`configure-discount-rules-${rule.id}-customerBuys`}
                label={translateAdmin("adminAttributes.minimumQuantityOfItems")}
                required
                error={
                  validationErrors[`discount.rules.${rule.id}.customerBuys`]
                }
                value={String(rule.customerBuys ?? 2)}
                onInput={(e) =>
                  pricingState.updateDiscountRule(rule.id, {
                    customerBuys: Math.max(
                      1,
                      Number((e.target as HTMLInputElement).value) || 1
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
                error={
                  validationErrors[`discount.rules.${rule.id}.customerGets`]
                }
                value={String(rule.customerGets ?? 1)}
                onInput={(e) =>
                  pricingState.updateDiscountRule(rule.id, {
                    customerGets: Math.max(
                      1,
                      Number((e.target as HTMLInputElement).value) || 1
                    ),
                  })
                }
                min={1}
              />
              <div className={productPageBundleStyles.bxyRewardGrid}>
                <s-number-field
                  id={`configure-discount-rules-${rule.id}-discountValue`}
                  label={translateAdmin("adminAttributes.discountValue")}
                  required
                  error={
                    validationErrors[`discount.rules.${rule.id}.discountValue`]
                  }
                  value={String(
                    getBogoDiscountInputValue(
                      rule.discountValue ?? 0,
                      rule.bxyDiscountType ?? "percentage"
                    )
                  )}
                  onInput={(e) =>
                    pricingState.updateDiscountRule(rule.id, {
                      discountValue: (() => {
                        const nextValue =
                          Number((e.target as HTMLInputElement).value) || 0;
                        return (rule.bxyDiscountType ?? "percentage") ===
                          "percentage"
                          ? Math.min(100, Math.max(0, nextValue))
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
                />
                <s-select
                  label={translateAdmin("adminAttributes.discountType")}
                  value={rule.bxyDiscountType ?? "percentage"}
                  onChange={(e) => {
                    const bxyDiscountType = (e.target as HTMLSelectElement)
                      .value as "percentage" | "fixed_amount";
                    const currentValue = getBogoDiscountInputValue(
                      Number(rule.discountValue ?? 0) || 0,
                      rule.bxyDiscountType ?? "percentage"
                    );
                    pricingState.updateDiscountRule(rule.id, {
                      bxyDiscountType,
                      discountValue:
                        bxyDiscountType === "percentage"
                          ? Math.min(100, Math.max(0, currentValue))
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
                  onChange={(e) =>
                    pricingState.updateDiscountRule(rule.id, {
                      bxyApplyMode: (e.target as HTMLSelectElement).value as
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
            <PricingTierBadgeFields
              rule={rule}
              validationErrors={validationErrors}
              onChange={(updates) =>
                pricingState.updateDiscountRule(rule.id, updates)
              }
            />
          </s-stack>
        </div>
      ))}
      <PpbAddDiscountRuleButton />
    </s-stack>
  );
}

function PpbStandardDiscountRules() {
  const {
    amountToCents,
    centsToAmount,
    DiscountMethod,
    pricingState,
    productPageBundleStyles,
    validationErrors = {},
  } = usePpbConfigureContext();

  return (
    <s-stack direction="block" gap="small">
      {pricingState.discountRules.map((rule, index) => (
        <div key={rule.id} className={productPageBundleStyles.discountRuleCard}>
          <s-stack direction="block" gap="small">
            <div className={productPageBundleStyles.discountRuleHeader}>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                {translateAdmin("adminDynamic.ruleNumber", {
                  number: index + 1,
                })}
              </h4>
              <s-button
                variant="tertiary"
                tone="critical"
                icon="delete"
                onClick={() => pricingState.removeDiscountRule(rule.id)}
              >
                {translateAdmin(
                  "adminExtracted.shared.filePicker.filepickertrigger.remove"
                )}
              </s-button>
            </div>
            {pricingState.discountType === DiscountMethod.FIXED_BUNDLE_PRICE ? (
              <div className={productPageBundleStyles.discountFieldsRowPair}>
                <s-number-field
                  id={`configure-discount-rules-${rule.id}-conditionValue`}
                  label={translateAdmin(
                    "adminAttributes.numberOfProductsInBundle"
                  )}
                  required
                  error={
                    validationErrors[`discount.rules.${rule.id}.conditionValue`]
                  }
                  value={String(rule.conditionValue ?? 0)}
                  onInput={(e) =>
                    pricingState.updateDiscountRule(rule.id, {
                      conditionValue:
                        Number((e.target as HTMLInputElement).value) || 0,
                    })
                  }
                  min={0}
                />
                <s-number-field
                  id={`configure-discount-rules-${rule.id}-discountValue`}
                  label={translateAdmin("adminAttributes.price")}
                  required
                  error={
                    validationErrors[`discount.rules.${rule.id}.discountValue`]
                  }
                  value={String(centsToAmount(rule.discountValue))}
                  onInput={(e) =>
                    pricingState.updateDiscountRule(rule.id, {
                      discountValue: amountToCents(
                        Number((e.target as HTMLInputElement).value) || 0
                      ),
                    })
                  }
                  min={0}
                  prefix={pricingState.currencySymbol}
                />
              </div>
            ) : (
              <div className={productPageBundleStyles.discountFieldsRow}>
                <s-select
                  label={translateAdmin("adminAttributes.discountOn")}
                  value={rule.conditionType ?? "quantity"}
                  onChange={(e) =>
                    pricingState.updateDiscountRule(rule.id, {
                      conditionType: (e.target as HTMLSelectElement).value as
                        | "quantity"
                        | "amount",
                    })
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
                <s-number-field
                  id={`configure-discount-rules-${rule.id}-conditionValue`}
                  label={translateAdmin(
                    "adminAttributes.isGreaterThanOrEqualTo"
                  )}
                  required
                  error={
                    validationErrors[`discount.rules.${rule.id}.conditionValue`]
                  }
                  value={String(
                    rule.conditionType === "amount"
                      ? centsToAmount(rule.conditionValue)
                      : rule.conditionValue
                  )}
                  onInput={(e) => {
                    const numValue =
                      Number((e.target as HTMLInputElement).value) || 0;
                    const finalValue =
                      rule.conditionType === "amount"
                        ? amountToCents(numValue)
                        : numValue;
                    pricingState.updateDiscountRule(rule.id, {
                      conditionValue: finalValue,
                    });
                  }}
                  min={0}
                  prefix={
                    rule.conditionType === "amount"
                      ? pricingState.currencySymbol
                      : undefined
                  }
                />
                <s-number-field
                  id={`configure-discount-rules-${rule.id}-discountValue`}
                  label={
                    pricingState.discountType === DiscountMethod.PERCENTAGE_OFF
                      ? "Percentage Off"
                      : "Fixed Amount Off"
                  }
                  required
                  error={
                    validationErrors[`discount.rules.${rule.id}.discountValue`]
                  }
                  value={String(
                    pricingState.discountType === DiscountMethod.PERCENTAGE_OFF
                      ? rule.discountValue
                      : centsToAmount(rule.discountValue)
                  )}
                  onInput={(e) => {
                    const numValue =
                      Number((e.target as HTMLInputElement).value) || 0;
                    const finalValue =
                      pricingState.discountType ===
                      DiscountMethod.PERCENTAGE_OFF
                        ? numValue
                        : amountToCents(Math.max(0, numValue));
                    const safeValue =
                      pricingState.discountType ===
                      DiscountMethod.PERCENTAGE_OFF
                        ? Math.min(100, Math.max(0, finalValue))
                        : finalValue;
                    pricingState.updateDiscountRule(rule.id, {
                      discountValue: safeValue,
                    });
                  }}
                  min={0}
                  max={
                    pricingState.discountType === DiscountMethod.PERCENTAGE_OFF
                      ? 100
                      : undefined
                  }
                  suffix={
                    pricingState.discountType === DiscountMethod.PERCENTAGE_OFF
                      ? "%"
                      : undefined
                  }
                  prefix={
                    pricingState.discountType !== DiscountMethod.PERCENTAGE_OFF
                      ? pricingState.currencySymbol
                      : undefined
                  }
                />
              </div>
            )}
            <PricingTierBadgeFields
              rule={rule}
              validationErrors={validationErrors}
              onChange={(updates) =>
                pricingState.updateDiscountRule(rule.id, updates)
              }
            />
          </s-stack>
        </div>
      ))}
      <PpbAddDiscountRuleButton />
    </s-stack>
  );
}

function PpbAddDiscountRuleButton() {
  const { pricingState } = usePpbConfigureContext();

  if (pricingState.discountRules.length < 4) {
    return (
      <s-button
        variant="secondary"
        icon="plus"
        inlineSize="fill"
        onClick={pricingState.addDiscountRule}
      >
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.addRule"
        )}
      </s-button>
    );
  }

  return (
    <p
      style={{ margin: 0, fontSize: 14, color: "#6d7175", textAlign: "center" }}
    >
      {translateAdmin(
        "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.maximum4DiscountRulesReached"
      )}
    </p>
  );
}
