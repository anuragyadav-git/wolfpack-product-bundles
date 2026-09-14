import type { Dispatch, SetStateAction } from "react";
import type { useBundlePricing } from "../../../../hooks/useBundlePricing";
import type { PricingRuleTierText } from "../../../../types/pricing";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { translateAdmin } from "~/i18n/config";
import { QuestionHelpTooltip } from "../SmallComponents";

export function FpbProgressBarOptions({
  markAsDirty,
  pricingState,
  setTierTextByRuleId,
  styles,
  tierTextByRuleId,
  translationsAvailable,
  onOpenTranslations,
}: {
  markAsDirty: () => void;
  pricingState: ReturnType<typeof useBundlePricing>;
  setTierTextByRuleId: Dispatch<
    SetStateAction<Record<string, PricingRuleTierText>>
  >;
  styles: Record<string, string>;
  tierTextByRuleId: Record<string, PricingRuleTierText>;
  translationsAvailable: boolean;
  onOpenTranslations: () => void;
}) {
  return (
    <>
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
                {translateAdmin("tooltips.discountProgressBar.title")}
              </p>
              <p className={styles.displayOptionDescription}>
                {translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountprogressbaroptions.editTheProgressBarContentAndSettings"
                )}
              </p>
            </div>
            <QuestionHelpTooltip tooltipKey="discountProgressBar" />
            <s-switch
              checked={pricingState.showDiscountProgressBar || undefined}
              onChange={(e) =>
                pricingState.setShowDiscountProgressBar(
                  (e.target as HTMLInputElement).checked
                )
              }
            />
          </s-stack>
          <s-button
            variant="secondary"
            icon="language-translate"
            accessibilityLabel={translateAdmin(
              "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
            )}
            disabled={
              !pricingState.showDiscountProgressBar ||
              (pricingState.pricingDisplayOptions.progressBar.type ||
                "step_based") !== "step_based" ||
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
        <DisabledConfigurationRegion
          disabled={!pricingState.showDiscountProgressBar}
        >
          <div className={styles.nestedDisplayOptions}>
            <s-stack direction="block" gap="small">
              <s-stack direction="inline" gap="small" alignItems="center">
                <s-choice-list
                  label={translateAdmin("adminAttributes.progressBarType")}
                  labelAccessibilityVisibility="exclusive"
                  name="fpbProgressBarType"
                  values={[
                    pricingState.pricingDisplayOptions.progressBar.type ||
                      "step_based",
                  ]}
                  onChange={(event) => {
                    const nextType = (
                      event.currentTarget as HTMLElement & { values?: string[] }
                    ).values?.[0];
                    if (nextType === "simple" || nextType === "step_based") {
                      pricingState.setProgressBarType(nextType);
                    }
                  }}
                >
                  <s-choice value="simple">
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountprogressbaroptions.simpleBar"
                    )}
                  </s-choice>
                  <s-choice value="step_based">
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountprogressbaroptions.stepBasedBar"
                    )}
                  </s-choice>
                </s-choice-list>
              </s-stack>
              {(pricingState.pricingDisplayOptions.progressBar.type ||
                "step_based") === "step_based" ? (
                <s-stack direction="block" gap="small">
                  {pricingState.discountRules.length === 0 ? (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: "#6d7175",
                      }}
                    >
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountprogressbaroptions.addDiscountRulesToConfigureTierText"
                      )}
                    </p>
                  ) : (
                    pricingState.discountRules.map((rule, index) => (
                      <div key={rule.id} className={styles.discountRuleCard}>
                        <s-stack direction="block" gap="small-100">
                          <p
                            style={{
                              margin: 0,
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            {translateAdmin("adminDynamic.ruleNumber", {
                              number: index + 1,
                            })}
                          </p>
                          <s-grid
                            gridTemplateColumns="repeat(2, minmax(0, 1fr))"
                            gap="small"
                            alignItems="start"
                          >
                            <s-text-field
                              label={translateAdmin("adminAttributes.tierText")}
                              value={tierTextByRuleId[rule.id]?.tierText ?? ""}
                              onInput={(e) => {
                                const val = (e.target as HTMLInputElement)
                                  .value;
                                setTierTextByRuleId((prev) => ({
                                  ...prev,
                                  [rule.id]: {
                                    tierText: val,
                                    tierSubtext:
                                      prev[rule.id]?.tierSubtext ?? "",
                                  },
                                }));
                                markAsDirty();
                              }}
                              autocomplete="off"
                            />
                            <s-text-field
                              label={translateAdmin(
                                "adminAttributes.tierSubtext"
                              )}
                              value={
                                tierTextByRuleId[rule.id]?.tierSubtext ?? ""
                              }
                              onInput={(e) => {
                                const val = (e.target as HTMLInputElement)
                                  .value;
                                setTierTextByRuleId((prev) => ({
                                  ...prev,
                                  [rule.id]: {
                                    tierText: prev[rule.id]?.tierText ?? "",
                                    tierSubtext: val,
                                  },
                                }));
                                markAsDirty();
                              }}
                              autocomplete="off"
                            />
                          </s-grid>
                        </s-stack>
                      </div>
                    ))
                  )}
                </s-stack>
              ) : null}
            </s-stack>
          </div>
        </DisabledConfigurationRegion>
      </div>
    </>
  );
}
