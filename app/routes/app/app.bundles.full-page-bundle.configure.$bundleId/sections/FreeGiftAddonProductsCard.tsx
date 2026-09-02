import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { FpbAddonTierEditor } from "./FreeGiftAddonTierEditor";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { translateAdmin } from "~/i18n/config";

export function FpbAddonProductsCard({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    addonDraft,
    ADDONS_HELP_ARTICLE_URL,
    fullPageBundleStyles,
    openAddonSectionMultiLanguageModal,
    shopLocales,
    updateAddonDraft,
  } = flow;

  return (
    <>
      <div
        className={`${fullPageBundleStyles.card} ${fullPageBundleStyles.addonsCard}`}
      >
        <div className={fullPageBundleStyles.addonsHeaderLine}>
          <div className={fullPageBundleStyles.addonsTitleCluster}>
            <h3 className={fullPageBundleStyles.panelTitle}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonproductscard.addOnsWithBundles"
              )}
            </h3>
            <s-switch
              accessibilityLabel={translateAdmin(
                "adminAttributes.enableAddOnsWithBundles"
              )}
              checked={addonDraft.addonProductsEnabled === true || undefined}
              onChange={(e) => {
                updateAddonDraft({
                  addonProductsEnabled: (e.target as HTMLInputElement).checked,
                });
              }}
            />
            <s-press-button
              variant="tertiary"
              tone="neutral"
              icon="play"
              accessibilityLabel={translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.howToSetup"
              )}
              onClick={() =>
                window.open(
                  ADDONS_HELP_ARTICLE_URL,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              {translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.howToSetup"
              )}
            </s-press-button>
          </div>
          <div className={fullPageBundleStyles.addonsHeaderActions}>
            <s-button
              variant="secondary"
              icon="language-translate"
              disabled={
                !addonDraft.addonProductsEnabled ||
                shopLocales.length === 0 ||
                undefined
              }
              onClick={openAddonSectionMultiLanguageModal}
            >
              {translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
              )}
            </s-button>
          </div>
        </div>
        <DisabledConfigurationRegion
          disabled={!addonDraft.addonProductsEnabled}
        >
          <s-stack direction="block" gap="small">
            <p className={fullPageBundleStyles.panelDescription}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonproductscard.enableCustomersToAddExtraItemsToTheirBundlesAtADiscountedPriceFo"
              )}
            </p>
            <div className={fullPageBundleStyles.addonsFormStack}>
              <s-text-field
                label={translateAdmin("adminAttributes.addOnSectionTitle")}
                value={addonDraft.addonProductsTitle ?? ""}
                disabled={!addonDraft.addonProductsEnabled || undefined}
                onInput={(e) => {
                  updateAddonDraft({
                    addonProductsTitle: (e.target as HTMLInputElement).value,
                  });
                }}
                autocomplete="off"
              />
              <FpbAddonTierEditor flow={flow} />
            </div>
          </s-stack>
        </DisabledConfigurationRegion>
      </div>
    </>
  );
}
