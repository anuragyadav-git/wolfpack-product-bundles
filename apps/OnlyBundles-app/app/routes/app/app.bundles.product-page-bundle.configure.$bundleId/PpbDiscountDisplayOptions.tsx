import { usePpbConfigureContext } from "./PpbConfigureContext";
import { PpbDiscountMessagingOptions } from "./PpbDiscountMessagingOptions";
import { DisabledConfigurationRegion } from "../_shared/bundle-configure/DisabledConfigurationRegion";
import { translateAdmin } from "~/i18n/config";

export function PpbDiscountDisplayOptions() {
  const { displayOptionsInactive } = usePpbConfigureContext();

  return (
    <s-section>
      <DisabledConfigurationRegion disabled={displayOptionsInactive}>
        <s-stack direction="block" gap="small">
          <s-stack direction="block" gap="small-400">
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountdisplayoptions.discountDisplayOptions"
              )}
            </h4>
            <p style={{ margin: 0, fontSize: 13, color: "#6d7175" }}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountdisplayoptions.chooseHowDiscountsAreDisplayed"
              )}
            </p>
          </s-stack>
          <PpbBundleQuantityOptions />
          <PpbProgressBarOptions />
          <PpbDiscountMessagingOptions />
        </s-stack>
      </DisabledConfigurationRegion>
    </s-section>
  );
}

function PpbBundleQuantityOptions() {
  const {
    bundleQuantityOptionsEligible,
    DiscountMethod,
    markAsDirty,
    pricingState,
    productPageBundleStyles,
    qtyOptionsDefaultRuleId,
    qtyOptionsEnabled,
    qtyRuleLabels,
    qtyRuleSubtexts,
    QuestionHelpTooltip,
    setIsBundleQuantityMultiLangModalOpen,
    setQtyOptionsDefaultRuleId,
    setQtyOptionsEnabled,
    setQtyRuleLabels,
    setQtyRuleSubtexts,
    shopLocales,
  } = usePpbConfigureContext();

  if (pricingState.discountType === DiscountMethod.BUY_X_GET_Y) {
    return null;
  }

  return (
    <div className={productPageBundleStyles.displayOptionRow}>
      <s-stack
        direction="inline"
        gap="small"
        alignItems="center"
        justifyContent="space-between"
      >
        <s-stack direction="inline" gap="small" alignItems="center">
          <div className={productPageBundleStyles.displayOptionText}>
            <p className={productPageBundleStyles.displayOptionTitle}>
              {translateAdmin("tooltips.bundleQuantityOptions.title")}
            </p>
            <p className={productPageBundleStyles.displayOptionDescription}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountbundlequantityoptions.configureThisSectionToEnableQuantityOptions"
              )}
            </p>
          </div>
          <QuestionHelpTooltip tooltipKey="bundleQuantityOptions" />
          <s-switch
            checked={qtyOptionsEnabled || undefined}
            disabled={!bundleQuantityOptionsEligible || undefined}
            onChange={(e) => {
              setQtyOptionsEnabled((e.target as HTMLInputElement).checked);
              markAsDirty();
            }}
          />
        </s-stack>
        <s-button
          variant="secondary"
          icon="language-translate"
          disabled={!qtyOptionsEnabled || shopLocales.length === 0 || undefined}
          onClick={() => setIsBundleQuantityMultiLangModalOpen(true)}
        >
          {translateAdmin(
            "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
          )}
        </s-button>
      </s-stack>
      <p className={productPageBundleStyles.optionNote}>
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
        disabled={!qtyOptionsEnabled || !bundleQuantityOptionsEligible}
      >
        <div className={productPageBundleStyles.nestedDisplayOptions}>
          <s-stack direction="block" gap="small">
            {pricingState.discountRules.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: "#6d7175" }}>
                {translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountbundlequantityoptions.addQuantityBasedDiscountRulesToConfigureBundleQuantityOptions"
                )}
              </p>
            ) : (
              <s-stack direction="block" gap="small">
                {pricingState.discountRules.map((rule: any, index: number) => (
                  <div
                    key={rule.id}
                    className={productPageBundleStyles.discountRuleCard}
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
                          pressed={rule.id === qtyOptionsDefaultRuleId}
                          accessibilityLabel={translateAdmin(
                            "adminAttributes.makeThisRuleDefault"
                          )}
                          onClick={() => {
                            setQtyOptionsDefaultRuleId(rule.id);
                            markAsDirty();
                          }}
                        >
                          <s-text
                            tone={
                              rule.id === qtyOptionsDefaultRuleId
                                ? "success"
                                : "neutral"
                            }
                          >
                            {rule.id === qtyOptionsDefaultRuleId
                              ? "\u2605"
                              : "\u2606"}{" "}
                            {translateAdmin("adminDynamic.makeRuleDefault")}
                          </s-text>
                        </s-press-button>
                      </s-stack>
                      <s-stack direction="inline" gap="small">
                        <s-text-field
                          label={translateAdmin("adminAttributes.boxLabel")}
                          placeholder={`Box of ${rule.conditionValue ?? ""}`}
                          value={qtyRuleLabels[rule.id] ?? ""}
                          onInput={(e) => {
                            setQtyRuleLabels((prev) => ({
                              ...prev,
                              [rule.id]: (e.target as HTMLInputElement).value,
                            }));
                            markAsDirty();
                          }}
                          autocomplete="off"
                        />
                        <s-text-field
                          label={translateAdmin("adminAttributes.boxSubtext")}
                          placeholder={translateAdmin(
                            "adminAttributes.eG20Off"
                          )}
                          value={qtyRuleSubtexts[rule.id] ?? ""}
                          onInput={(e) => {
                            setQtyRuleSubtexts((prev) => ({
                              ...prev,
                              [rule.id]: (e.target as HTMLInputElement).value,
                            }));
                            markAsDirty();
                          }}
                          autocomplete="off"
                        />
                      </s-stack>
                    </s-stack>
                  </div>
                ))}
              </s-stack>
            )}
          </s-stack>
        </div>
      </DisabledConfigurationRegion>
    </div>
  );
}

function PpbProgressBarOptions() {
  const {
    markAsDirty,
    productPageBundleStyles,
    progressBarEnabled,
    progressBarType,
    QuestionHelpTooltip,
    setIsProgressBarMultiLangModalOpen,
    setProgressBarEnabled,
    setProgressBarType,
    setTierTextByRuleId,
    shopLocales,
    tierTextByRuleId,
  } = usePpbConfigureContext();

  return (
    <div className={productPageBundleStyles.displayOptionRow}>
      <s-stack
        direction="inline"
        gap="small"
        alignItems="center"
        justifyContent="space-between"
      >
        <s-stack direction="inline" gap="small" alignItems="center">
          <div className={productPageBundleStyles.displayOptionText}>
            <p className={productPageBundleStyles.displayOptionTitle}>
              {translateAdmin("tooltips.discountProgressBar.title")}
            </p>
            <p className={productPageBundleStyles.displayOptionDescription}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountprogressbaroptions.editTheProgressBarContentAndSettings"
              )}
            </p>
          </div>
          <QuestionHelpTooltip tooltipKey="discountProgressBar" />
          <s-switch
            checked={progressBarEnabled || undefined}
            onChange={(e) => {
              setProgressBarEnabled((e.target as HTMLInputElement).checked);
              markAsDirty();
            }}
          />
        </s-stack>
        <s-button
          variant="secondary"
          icon="language-translate"
          disabled={
            !progressBarEnabled ||
            progressBarType !== "step_based" ||
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
      <DisabledConfigurationRegion disabled={!progressBarEnabled}>
        <div className={productPageBundleStyles.nestedDisplayOptions}>
          <s-stack direction="block" gap="small">
            <s-choice-list
              label={translateAdmin("adminAttributes.progressBarType")}
              labelAccessibilityVisibility="exclusive"
              values={[progressBarType]}
              onChange={(e) => {
                const value = (
                  (e.currentTarget as any).values as string[] | undefined
                )?.[0];
                if (value) setProgressBarType(value);
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
            {progressBarType === "step_based" ? (
              <PpbProgressTierTextFields
                setTierTextByRuleId={setTierTextByRuleId}
                tierTextByRuleId={tierTextByRuleId}
              />
            ) : null}
          </s-stack>
        </div>
      </DisabledConfigurationRegion>
    </div>
  );
}

function PpbProgressTierTextFields({
  setTierTextByRuleId,
  tierTextByRuleId,
}: {
  setTierTextByRuleId: (updater: any) => void;
  tierTextByRuleId: Record<string, { tierText: string; tierSubtext: string }>;
}) {
  const { markAsDirty, pricingState, productPageBundleStyles } =
    usePpbConfigureContext();

  if (pricingState.discountRules.length === 0) {
    return (
      <p style={{ margin: 0, fontSize: 14, color: "#6d7175" }}>
        {translateAdmin(
          "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountprogressbaroptions.addDiscountRulesToConfigureTierText"
        )}
      </p>
    );
  }

  return (
    <s-stack direction="block" gap="small">
      {pricingState.discountRules.map((rule: any, index: number) => (
        <div key={rule.id} className={productPageBundleStyles.discountRuleCard}>
          <s-stack direction="block" gap="small-100">
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
              {translateAdmin("adminDynamic.ruleNumber", { number: index + 1 })}
            </p>
            <s-grid gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap="small">
              <s-text-field
                label={translateAdmin("adminAttributes.tierText")}
                value={tierTextByRuleId[rule.id]?.tierText ?? ""}
                onInput={(e) => {
                  const value = (e.target as HTMLInputElement).value;
                  setTierTextByRuleId((prev: typeof tierTextByRuleId) => ({
                    ...prev,
                    [rule.id]: {
                      tierText: value,
                      tierSubtext: prev[rule.id]?.tierSubtext ?? "",
                    },
                  }));
                  markAsDirty();
                }}
                autocomplete="off"
              />
              <s-text-field
                label={translateAdmin("adminAttributes.tierSubtext")}
                value={tierTextByRuleId[rule.id]?.tierSubtext ?? ""}
                onInput={(e) => {
                  const value = (e.target as HTMLInputElement).value;
                  setTierTextByRuleId((prev: typeof tierTextByRuleId) => ({
                    ...prev,
                    [rule.id]: {
                      tierText: prev[rule.id]?.tierText ?? "",
                      tierSubtext: value,
                    },
                  }));
                  markAsDirty();
                }}
                autocomplete="off"
              />
            </s-grid>
          </s-stack>
        </div>
      ))}
    </s-stack>
  );
}
