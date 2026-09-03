import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { amountToCents, DiscountMethod } from "../../../../types/pricing";
import {
  getBogoDiscountInputValue,
  getBogoDiscountStoredValue,
} from "../../../../lib/pricing-progress-tier-defaults";
import { DiscountPricingTipBanner } from "../../_shared/bundle-configure/DiscountPricingTipBanner";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { PricingTierBadgeFields } from "../../_shared/bundle-configure/PricingTierBadgeFields";
import { translateAdmin } from "~/i18n/config";

export function fixedBundlePriceInputToCents(value: string): number {
  return amountToCents(Number(value) || 0);
}

export function FpbDiscountRulesSection({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    amountToCents,
    centsToAmount,
    DISCOUNT_METHOD_OPTIONS,
    fullPageBundleStyles,
    pricingState,
    setGlobalSuccessMessage,
    setRuleMessages,
    setRuleMessagesByLocale,
    setSuccessMessageByLocale,
    validationErrors = {},
  } = flow;

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
          </DisabledConfigurationRegion>
          {/* Q2: Discount Rules — always visible, grayed when disabled */}
          <DisabledConfigurationRegion disabled={!pricingState.discountEnabled}>
            <s-stack direction="block" gap="small">
              {pricingState.discountRules.map((rule, index) => (
                <div
                  key={rule.id}
                  className={fullPageBundleStyles.discountRuleCard}
                >
                  <s-stack direction="block" gap="small">
                    <div className={fullPageBundleStyles.discountRuleHeader}>
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
                      <div className={fullPageBundleStyles.bxyRuleBody}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {translateAdmin(
                            "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountpricingrules.customerBuys"
                          )}
                        </p>
                        <s-number-field
                          id={`configure-discount-rules-${rule.id}-customerBuys`}
                          label={translateAdmin(
                            "adminAttributes.minimumQuantityOfItems"
                          )}
                          required
                          error={
                            validationErrors[
                              `discount.rules.${rule.id}.customerBuys`
                            ]
                          }
                          value={String(rule.customerBuys ?? 2)}
                          onInput={(e) =>
                            pricingState.updateDiscountRule(rule.id, {
                              customerBuys: Math.max(
                                1,
                                Number((e.target as HTMLInputElement).value) ||
                                  1
                              ),
                            })
                          }
                          min={1}
                        />
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
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
                            validationErrors[
                              `discount.rules.${rule.id}.customerGets`
                            ]
                          }
                          value={String(rule.customerGets ?? 1)}
                          onInput={(e) =>
                            pricingState.updateDiscountRule(rule.id, {
                              customerGets: Math.max(
                                1,
                                Number((e.target as HTMLInputElement).value) ||
                                  1
                              ),
                            })
                          }
                          min={1}
                        />
                        <div className={fullPageBundleStyles.bxyRewardGrid}>
                          <s-number-field
                            id={`configure-discount-rules-${rule.id}-discountValue`}
                            label={translateAdmin(
                              "adminAttributes.discountValue"
                            )}
                            required
                            error={
                              validationErrors[
                                `discount.rules.${rule.id}.discountValue`
                              ]
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
                                    Number(
                                      (e.target as HTMLInputElement).value
                                    ) || 0;
                                  return (rule.bxyDiscountType ??
                                    "percentage") === "percentage"
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
                              (rule.bxyDiscountType ?? "percentage") ===
                              "percentage"
                                ? "%"
                                : undefined
                            }
                            prefix={
                              (rule.bxyDiscountType ?? "percentage") ===
                              "fixed_amount"
                                ? pricingState.currencySymbol
                                : undefined
                            }
                            max={
                              (rule.bxyDiscountType ?? "percentage") ===
                              "percentage"
                                ? 100
                                : undefined
                            }
                          />
                          <s-select
                            label={translateAdmin(
                              "adminAttributes.discountType"
                            )}
                            value={rule.bxyDiscountType ?? "percentage"}
                            onChange={(e) => {
                              const bxyDiscountType = (
                                e.target as HTMLSelectElement
                              ).value as "percentage" | "fixed_amount";
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
                            label={translateAdmin(
                              "adminAttributes.applyDiscountTo"
                            )}
                            value={rule.bxyApplyMode ?? "lowest_priced"}
                            onChange={(e) =>
                              pricingState.updateDiscountRule(rule.id, {
                                bxyApplyMode: (e.target as HTMLSelectElement)
                                  .value as "lowest_priced" | "latest_added",
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
                    ) : (
                      <s-stack direction="block" gap="small-100">
                        {pricingState.discountType ===
                        DiscountMethod.FIXED_BUNDLE_PRICE ? (
                          <div
                            className={
                              fullPageBundleStyles.discountFieldsRowPair
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
                            className={fullPageBundleStyles.discountFieldsRow}
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
                  inlineSize="fill"
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
