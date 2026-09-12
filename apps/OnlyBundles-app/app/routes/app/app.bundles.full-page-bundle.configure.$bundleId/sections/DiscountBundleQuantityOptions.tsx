import type { useBundlePricing } from "../../../../hooks/useBundlePricing";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { translateAdmin } from "~/i18n/config";
import { DiscountMethod } from "../../../../types/pricing";
import { QuestionHelpTooltip } from "../SmallComponents";

export function FpbBundleQuantityOptions({
  eligible,
  normalizedOptions,
  pricingState,
  styles,
  translationsAvailable,
  onOpenTranslations,
}: {
  eligible: boolean;
  normalizedOptions: Array<{
    ruleId: string;
    label: string;
    subtext: string;
    isDefault: boolean;
    compatibility: { status: string; reason?: string };
  }>;
  pricingState: ReturnType<typeof useBundlePricing>;
  styles: Record<string, string>;
  translationsAvailable: boolean;
  onOpenTranslations: () => void;
}) {
  return (
    <>
      {pricingState.discountType !== DiscountMethod.BUY_X_GET_Y && (
        <div className={styles.displayOptionRow}>
          <s-stack
            direction="inline"
            gap="small"
            alignItems="center"
            justifyContent="space-between"
          >
            <s-stack direction="inline" gap="small" alignItems="center">
              <div className={styles.displayOptionText}>
                <p className={styles.displayOptionTitle}>
                  {translateAdmin("tooltips.bundleQuantityOptions.title")}
                </p>
                <p className={styles.displayOptionDescription}>
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
                disabled={!eligible || undefined}
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
                !translationsAvailable ||
                undefined
              }
              onClick={onOpenTranslations}
            >
              {translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
              )}
            </s-button>
          </s-stack>
          <p className={styles.optionNote}>
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
                .enabled || !eligible
            }
          >
            <div className={styles.nestedDisplayOptions}>
              <s-stack direction="block" gap="small">
                {normalizedOptions.length === 0 ? (
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
                  normalizedOptions.map(
                    (option, index) => (
                      <div
                        key={option.ruleId}
                        className={styles.discountRuleCard}
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
                            <s-switch
                              label={translateAdmin(
                                "adminDynamic.makeRuleDefault"
                              )}
                              checked={option.isDefault || undefined}
                              onChange={(e: Event) => {
                                const isChecked = (e.target as HTMLInputElement)
                                  .checked;
                                pricingState.setBundleQuantityDefaultRule(
                                  isChecked ? option.ruleId : null
                                );
                              }}
                            />
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
