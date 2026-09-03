import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { translateAdmin } from "~/i18n/config";

export function FpbProgressBarOptions({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    fullPageBundleStyles,
    markAsDirty,
    pricingState,
    QuestionHelpTooltip,
    setIsProgressBarMultiLangModalOpen,
    setTierTextByRuleId,
    shopLocales,
    tierTextByRuleId,
  } = flow;

  return (
    <>
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
                {translateAdmin("tooltips.discountProgressBar.title")}
              </p>
              <p className={fullPageBundleStyles.displayOptionDescription}>
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
            disabled={
              !pricingState.showDiscountProgressBar ||
              (pricingState.pricingDisplayOptions.progressBar.type ||
                "step_based") !== "step_based" ||
              shopLocales.length === 0 ||
              undefined
            }
            onClick={() => setIsProgressBarMultiLangModalOpen(true)}
          >
            {translateAdmin(
              "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
            )}
          </s-button>
        </s-stack>
        <DisabledConfigurationRegion
          disabled={!pricingState.showDiscountProgressBar}
        >
          <div className={fullPageBundleStyles.nestedDisplayOptions}>
            <s-stack direction="block" gap="small">
              <s-stack direction="inline" gap="small" alignItems="center">
                <s-choice-list
                  label={translateAdmin("adminAttributes.simpleProgressBar")}
                  labelAccessibilityVisibility="exclusive"
                  values={
                    (pricingState.pricingDisplayOptions.progressBar.type ||
                      "step_based") === "simple"
                      ? ["simple"]
                      : []
                  }
                  onChange={() => {
                    pricingState.setProgressBarType("simple");
                  }}
                >
                  <s-choice value="simple">
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountprogressbaroptions.simpleBar"
                    )}
                  </s-choice>
                </s-choice-list>
                <s-choice-list
                  label={translateAdmin("adminAttributes.stepBasedProgressBar")}
                  labelAccessibilityVisibility="exclusive"
                  values={
                    (pricingState.pricingDisplayOptions.progressBar.type ||
                      "step_based") === "step_based"
                      ? ["step_based"]
                      : []
                  }
                  onChange={() => {
                    pricingState.setProgressBarType("step_based");
                  }}
                >
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
                      <div
                        key={rule.id}
                        className={fullPageBundleStyles.discountRuleCard}
                      >
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
                          >
                            <s-text-field
                              label={translateAdmin("adminAttributes.tierText")}
                              value={tierTextByRuleId[rule.id]?.tierText ?? ""}
                              onInput={(e) => {
                                const val = (e.target as HTMLInputElement)
                                  .value;
                                setTierTextByRuleId(
                                  (prev: Record<string, any>) => ({
                                    ...prev,
                                    [rule.id]: {
                                      tierText: val,
                                      tierSubtext:
                                        prev[rule.id]?.tierSubtext ?? "",
                                    },
                                  })
                                );
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
                                setTierTextByRuleId(
                                  (prev: Record<string, any>) => ({
                                    ...prev,
                                    [rule.id]: {
                                      tierText: prev[rule.id]?.tierText ?? "",
                                      tierSubtext: val,
                                    },
                                  })
                                );
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
