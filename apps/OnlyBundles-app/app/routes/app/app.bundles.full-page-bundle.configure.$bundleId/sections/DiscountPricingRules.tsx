import type { useBundlePricing } from "../../../../hooks/useBundlePricing";
import { amountToCents, centsToAmount, DiscountMethod } from "../../../../types/pricing";
import { DISCOUNT_METHOD_OPTIONS } from "../../../../constants/bundle";
import { DiscountPricingTipBanner } from "../../_shared/bundle-configure/DiscountPricingTipBanner";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { PricingTierBadgeFields } from "../../_shared/bundle-configure/PricingTierBadgeFields";
import { translateAdmin } from "~/i18n/config";
import { FpbBxyDiscountRuleFields } from "./FpbBxyDiscountRuleFields";

export function fixedBundlePriceInputToCents(value: string): number {
  return amountToCents(Number(value) || 0);
}

export function FpbDiscountRulesSection({
  pricingState,
  styles,
  validationErrors = {},
  onDiscountMethodChange,
}: {
  pricingState: ReturnType<typeof useBundlePricing>;
  styles: Record<string, string>;
  validationErrors?: Record<string, string>;
  onDiscountMethodChange: (discountMethod: DiscountMethod) => void;
}) {
  return (
    <>
      <s-section>
        <s-stack direction="block" gap="base">
          {/* Q1: Header with s-switch */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <s-stack direction="block" gap="small-400">
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                {translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.discountAmpPricing"
                )}
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: "#6d7175" }}>
                {translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.setUpDiscountRulesAppliedFromLowestToHighest"
                )}
              </p>
            </s-stack>
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
          <DiscountPricingTipBanner />
          {/* Q2: Discount Type — always visible, grayed when disabled */}
          <DisabledConfigurationRegion disabled={!pricingState.discountEnabled}>
            <s-select
              label={translateAdmin(
                "adminExtracted.appBundlesProductPageBundleConfigure.ppbdiscountrulespanel.discountType"
              )}
              value={pricingState.discountType}
              onChange={(e) => {
                const nextDiscountType = (e.target as HTMLSelectElement)
                  .value as DiscountMethod;
                onDiscountMethodChange(nextDiscountType);
              }}
            >
              {[...DISCOUNT_METHOD_OPTIONS].map((opt) => (
                <s-option key={opt.value} value={opt.value}>
                  {opt.label}
                </s-option>
              ))}
            </s-select>
          </DisabledConfigurationRegion>
          {/* Q2: Discount Rules — always visible, grayed when disabled */}
          <DisabledConfigurationRegion disabled={!pricingState.discountEnabled}>
            <s-stack direction="block" gap="small">
              {pricingState.discountRules.map((rule, index) => (
                <div
                  key={rule.id}
                  className={styles.discountRuleCard}
                >
                  <s-stack direction="block" gap="small">
                    <div className={styles.discountRuleHeader}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
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
                    {pricingState.discountType ===
                    DiscountMethod.BUY_X_GET_Y ? (
                      <FpbBxyDiscountRuleFields
                        bodyClassName={styles.bxyRuleBody}
                        rewardGridClassName={
                          styles.bxyRewardGrid
                        }
                        pricingState={pricingState}
                        rule={rule}
                        validationErrors={validationErrors}
                      />
                    ) : (
                      <s-stack direction="block" gap="small-100">
                        {pricingState.discountType ===
                        DiscountMethod.FIXED_BUNDLE_PRICE ? (
                          <div
                            className={
                              styles.discountFieldsRowPair
                            }
                          >
                            <s-number-field
                              id={`configure-discount-rules-${rule.id}-conditionValue`}
                              label={translateAdmin(
                                "adminAttributes.numberOfProductsInBundle"
                              )}
                              required
                              error={
                                validationErrors[
                                  `discount.rules.${rule.id}.conditionValue`
                                ]
                              }
                              value={String(rule.conditionValue ?? 0)}
                              onInput={(e) =>
                                pricingState.updateDiscountRule(rule.id, {
                                  conditionValue:
                                    Number(
                                      (e.target as HTMLInputElement).value
                                    ) || 0,
                                })
                              }
                              min={0}
                            />
                            <s-number-field
                              id={`configure-discount-rules-${rule.id}-discountValue`}
                              label={translateAdmin("adminAttributes.price")}
                              required
                              error={
                                validationErrors[
                                  `discount.rules.${rule.id}.discountValue`
                                ]
                              }
                              value={String(centsToAmount(rule.discountValue))}
                              onChange={(e) =>
                                pricingState.updateDiscountRule(rule.id, {
                                  discountValue: fixedBundlePriceInputToCents(
                                    (e.target as HTMLInputElement).value
                                  ),
                                })
                              }
                              min={0}
                              prefix={pricingState.currencySymbol}
                            />
                          </div>
                        ) : (
                          <div
                            className={styles.discountFieldsRow}
                          >
                            <s-select
                              label={translateAdmin(
                                "adminAttributes.discountOn"
                              )}
                              value={rule.conditionType ?? "quantity"}
                              onChange={(e) =>
                                pricingState.updateDiscountRule(rule.id, {
                                  conditionType: (e.target as HTMLSelectElement)
                                    .value as "quantity" | "amount",
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
                                validationErrors[
                                  `discount.rules.${rule.id}.conditionValue`
                                ]
                              }
                              value={String(
                                rule.conditionType === "amount"
                                  ? centsToAmount(rule.conditionValue)
                                  : rule.conditionValue
                              )}
                              onInput={(e) => {
                                const numValue =
                                  Number(
                                    (e.target as HTMLInputElement).value
                                  ) || 0;
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
                                pricingState.discountType ===
                                DiscountMethod.PERCENTAGE_OFF
                                  ? "Percentage Off"
                                  : "Fixed Amount Off"
                              }
                              required
                              error={
                                validationErrors[
                                  `discount.rules.${rule.id}.discountValue`
                                ]
                              }
                              value={String(
                                pricingState.discountType ===
                                  DiscountMethod.PERCENTAGE_OFF
                                  ? rule.discountValue
                                  : centsToAmount(rule.discountValue)
                              )}
                              onInput={(e) => {
                                const numValue =
                                  Number(
                                    (e.target as HTMLInputElement).value
                                  ) || 0;
                                const finalValue =
                                  pricingState.discountType ===
                                  DiscountMethod.PERCENTAGE_OFF
                                    ? numValue
                                    : amountToCents(Math.max(0, numValue));
                                pricingState.updateDiscountRule(rule.id, {
                                  discountValue: finalValue,
                                });
                              }}
                              min={0}
                              max={
                                pricingState.discountType ===
                                DiscountMethod.PERCENTAGE_OFF
                                  ? 100
                                  : undefined
                              }
                              suffix={
                                pricingState.discountType ===
                                DiscountMethod.PERCENTAGE_OFF
                                  ? "%"
                                  : undefined
                              }
                              step={
                                pricingState.discountType ===
                                DiscountMethod.PERCENTAGE_OFF
                                  ? 1
                                  : undefined
                              }
                              inputMode={
                                pricingState.discountType ===
                                DiscountMethod.PERCENTAGE_OFF
                                  ? "numeric"
                                  : "decimal"
                              }
                              prefix={
                                pricingState.discountType !==
                                DiscountMethod.PERCENTAGE_OFF
                                  ? pricingState.currencySymbol
                                  : undefined
                              }
                            />
                          </div>
                        )}
                      </s-stack>
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
              {pricingState.discountRules.length < 4 ? (
                <s-button
                  variant="secondary"
                  icon="plus"
                  onClick={pricingState.addDiscountRule}
                >
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.addRule"
                  )}
                </s-button>
              ) : (
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "#6d7175",
                    textAlign: "center",
                  }}
                >
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.maximum4DiscountRulesReached"
                  )}
                </p>
              )}
            </s-stack>
          </DisabledConfigurationRegion>
        </s-stack>
      </s-section>
    </>
  );
}
