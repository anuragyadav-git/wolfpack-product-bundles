import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { translateAdmin } from "~/i18n/config";

export function FpbBundleQuantityOptions({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    bundleQuantityOptionsEligible,
    DiscountMethod,
    fullPageBundleStyles,
    normalizedPricingDisplayOptions,
    pricingState,
    QuestionHelpTooltip,
    setIsBundleQuantityMultiLangModalOpen,
    shopLocales,
  } = flow;

  return (
    <>
      {pricingState.discountType !== DiscountMethod.BUY_X_GET_Y && (
        <div className={fullPageBundleStyles.displayOptionRow}>
          <s-stack
            direction="inline"
            gap="small"
            alignItems="center"
            justifyContent="space-between"
          >
            <s-stack direction="inline" gap="small" alignItems="center">
              <div className={fullPageBundleStyles.displayOptionText}>
                <p className={fullPageBundleStyles.displayOptionTitle}>
                  {translateAdmin("tooltips.bundleQuantityOptions.title")}
                </p>
                <p className={fullPageBundleStyles.displayOptionDescription}>
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountbundlequantityoptions.configureThisSectionToEnableQuantityOptions"
                  )}
                </p>
              </div>
              <QuestionHelpTooltip tooltipKey="bundleQuantityOptions" />
              <s-switch
                checked={
                  pricingState.pricingDisplayOptions.bundleQuantityOptions
                    .enabled || undefined
                }
                disabled={!bundleQuantityOptionsEligible || undefined}
                onChange={(e) =>
                  pricingState.setBundleQuantityOptionsEnabled(
                    (e.target as HTMLInputElement).checked
                  )
                }
              />
            </s-stack>
            <s-button
              variant="secondary"
              icon="language-translate"
              disabled={
                !pricingState.pricingDisplayOptions.bundleQuantityOptions
                  .enabled ||
                shopLocales.length === 0 ||
                undefined
              }
              onClick={() => setIsBundleQuantityMultiLangModalOpen(true)}
            >
              {translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
              )}
            </s-button>
          </s-stack>
          <p className={fullPageBundleStyles.optionNote}>
            <strong>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountbundlequantityoptions.note"
              )}
            </strong>{" "}
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountbundlequantityoptions.bundleQuantityOptionsCanOnlyBeEnabledWhenDiscountRulesAreBasedOn"
            )}
          </p>
          <DisabledConfigurationRegion
            disabled={
              !pricingState.pricingDisplayOptions.bundleQuantityOptions
                .enabled || !bundleQuantityOptionsEligible
            }
          >
            <div className={fullPageBundleStyles.nestedDisplayOptions}>
              <s-stack direction="block" gap="small">
                {normalizedPricingDisplayOptions.bundleQuantityOptions.options
                  .length === 0 ? (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: "#6d7175",
                    }}
                  >
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountbundlequantityoptions.addQuantityBasedDiscountRulesToConfigureBundleQuantityOptions"
                    )}
                  </p>
                ) : (
                  normalizedPricingDisplayOptions.bundleQuantityOptions.options.map(
                    (option: any, index: number) => (
                      <div
                        key={option.ruleId}
                        className={fullPageBundleStyles.discountRuleCard}
                      >
                        <s-stack direction="block" gap="small-100">
                          <s-stack
                            direction="inline"
                            gap="small"
                            alignItems="center"
                          >
                            <h5
                              style={{
                                margin: 0,
                                fontSize: 13,
                                fontWeight: 600,
                                flex: 1,
                              }}
                            >
                              {translateAdmin("adminDynamic.ruleNumber", {
                                number: index + 1,
                              })}
                            </h5>
                            <s-press-button
                              variant="tertiary"
                              tone="neutral"
                              pressed={option.isDefault}
                              accessibilityLabel={translateAdmin(
                                "adminAttributes.makeThisRuleDefault"
                              )}
                              onClick={() =>
                                pricingState.setBundleQuantityDefaultRule(
                                  option.ruleId
                                )
                              }
                            >
                              <s-text
                                tone={option.isDefault ? "success" : "neutral"}
                              >
                                {option.isDefault ? "\u2605" : "\u2606"}{" "}
                                {translateAdmin("adminDynamic.makeRuleDefault")}
                              </s-text>
                            </s-press-button>
                          </s-stack>
                          {option.compatibility.status === "blocked" && (
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
                                color: "#8a6116",
                              }}
                            >
                              {option.compatibility.reason}
                            </p>
                          )}
                          <s-stack direction="inline" gap="small">
                            <s-text-field
                              label={translateAdmin("adminAttributes.boxLabel")}
                              value={option.label}
                              onInput={(e) =>
                                pricingState.updateBundleQuantityOption(
                                  option.ruleId,
                                  {
                                    label: (e.target as HTMLInputElement).value,
                                  }
                                )
                              }
                              autocomplete="off"
                            />
                            <s-text-field
                              label={translateAdmin(
                                "adminAttributes.boxSubtext"
                              )}
                              value={option.subtext}
                              onInput={(e) =>
                                pricingState.updateBundleQuantityOption(
                                  option.ruleId,
                                  {
                                    subtext: (e.target as HTMLInputElement)
                                      .value,
                                  }
                                )
                              }
                              autocomplete="off"
                            />
                          </s-stack>
                        </s-stack>
                      </div>
                    )
                  )
                )}
              </s-stack>
            </div>
          </DisabledConfigurationRegion>
        </div>
      )}
    </>
  );
}
