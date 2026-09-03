import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { translateAdmin } from "~/i18n/config";

export function FpbAddonFooterMessaging({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    ADDON_MESSAGE_KEY,
    bundle,
    addonDraft,
    fullPageBundleStyles,
    markAsDirty,
    openAddonFooterMultiLanguageModal,
    ruleMessages,
    setIsAddonVariablesModalOpen,
    setRuleMessages,
    shopLocales,
  } = flow;
  const savedAddonMessages =
    (bundle as any).personalizationData?.addonProducts?.addonsMessaging
      ?.tier1 || {};
  const addonMessages = ruleMessages[ADDON_MESSAGE_KEY] || {
    discountText: savedAddonMessages.ineligibleState || "",
    successMessage: savedAddonMessages.eligibleState || "",
  };
  const hasAddonTiers =
    Array.isArray(addonDraft.addonTiers) && addonDraft.addonTiers.length > 0;

  if (!hasAddonTiers) {
    return null;
  }

  return (
    <>
      <DisabledConfigurationRegion disabled={!addonDraft.addonProductsEnabled}>
        <div
          className={`${fullPageBundleStyles.card} ${fullPageBundleStyles.addonsFooterCard}`}
        >
          <div className={fullPageBundleStyles.panelHeader}>
            <h3 className={fullPageBundleStyles.panelTitle}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonfootermessaging.footerMessaging"
              )}
            </h3>
            <s-stack direction="inline" gap="small-100">
              <s-button
                variant="tertiary"
                icon="code"
                onClick={() => setIsAddonVariablesModalOpen(true)}
              >
                {translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountmessagingoptions.showVariables"
                )}
              </s-button>
              <s-button
                variant="secondary"
                icon="language-translate"
                disabled={
                  !addonDraft.addonProductsEnabled ||
                  shopLocales.length === 0 ||
                  undefined
                }
                onClick={openAddonFooterMultiLanguageModal}
              >
                {translateAdmin(
                  "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
                )}
              </s-button>
            </s-stack>
          </div>
          <s-stack direction="block" gap="small">
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonfootermessaging.tier1"
              )}
            </h4>
            <s-text-field
              label={translateAdmin("adminAttributes.messageWhenRuleNotMet")}
              value={addonMessages.discountText}
              placeholder={translateAdmin(
                "adminAttributes.addAddonsConditionDiffMoreProductSToClaimAddonsDiscountValueAddonsDiscountValueUnit"
              )}
              onInput={(e) => {
                const value = (e.target as HTMLInputElement).value;
                setRuleMessages((prev: Record<string, any>) => ({
                  ...prev,
                  [ADDON_MESSAGE_KEY]: {
                    ...(prev[ADDON_MESSAGE_KEY] || addonMessages),
                    discountText: value,
                  },
                }));
                markAsDirty();
              }}
              autocomplete="off"
            />
            <s-text-field
              label={translateAdmin(
                "adminExtracted.appBundlesProductPageBundleConfigure.ppbdiscountmessagerulefields.successMessage"
              )}
              value={addonMessages.successMessage}
              placeholder={translateAdmin(
                "adminAttributes.congratsYouAreEligibleForAddonsDiscountValueAddonsDiscountValueUnitOffOn"
              )}
              onInput={(e) => {
                const value = (e.target as HTMLInputElement).value;
                setRuleMessages((prev: Record<string, any>) => ({
                  ...prev,
                  [ADDON_MESSAGE_KEY]: {
                    ...(prev[ADDON_MESSAGE_KEY] || addonMessages),
                    successMessage: value,
                  },
                }));
                markAsDirty();
              }}
              autocomplete="off"
            />
          </s-stack>
        </div>
      </DisabledConfigurationRegion>
    </>
  );
}
