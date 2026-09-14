import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { translateAdmin } from "~/i18n/config";

export function FpbAddonFooterMessaging({
  enabled,
  hasTiers,
  messages,
  styles,
  translationsAvailable,
  onMessagesChange,
  onOpenTranslations,
  onShowVariables,
}: {
  enabled: boolean;
  hasTiers: boolean;
  messages: { discountText: string; successMessage: string };
  styles: Record<string, string>;
  translationsAvailable: boolean;
  onMessagesChange: (messages: {
    discountText: string;
    successMessage: string;
  }) => void;
  onOpenTranslations: () => void;
  onShowVariables: () => void;
}) {
  if (!hasTiers) {
    return null;
  }

  return (
    <>
      <DisabledConfigurationRegion disabled={!enabled}>
        <div className={`${styles.card} ${styles.addonsFooterCard}`}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonfootermessaging.footerMessaging"
              )}
            </h3>
            <s-stack direction="inline" gap="small-100">
              <s-button
                variant="tertiary"
                icon="code"
                onClick={onShowVariables}
              >
                {translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountmessagingoptions.showVariables"
                )}
              </s-button>
              <s-button
                variant="secondary"
                icon="language-translate"
                disabled={!enabled || !translationsAvailable || undefined}
                onClick={onOpenTranslations}
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
              value={messages.discountText}
              placeholder={translateAdmin(
                "adminAttributes.addAddonsConditionDiffMoreProductSToClaimAddonsDiscountValueAddonsDiscountValueUnit"
              )}
              onInput={(e) => {
                const value = (e.target as HTMLInputElement).value;
                onMessagesChange({ ...messages, discountText: value });
              }}
              autocomplete="off"
            />
            <s-text-field
              label={translateAdmin(
                "adminExtracted.appBundlesProductPageBundleConfigure.ppbdiscountmessagerulefields.successMessage"
              )}
              value={messages.successMessage}
              placeholder={translateAdmin(
                "adminAttributes.congratsYouAreEligibleForAddonsDiscountValueAddonsDiscountValueUnitOffOn"
              )}
              onInput={(e) => {
                const value = (e.target as HTMLInputElement).value;
                onMessagesChange({ ...messages, successMessage: value });
              }}
              autocomplete="off"
            />
          </s-stack>
        </div>
      </DisabledConfigurationRegion>
    </>
  );
}
