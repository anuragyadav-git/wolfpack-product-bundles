import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { FpbAddonTierEditor } from "./FreeGiftAddonTierEditor";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";

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
              Add-Ons with Bundles
            </h3>
            <s-switch
              accessibilityLabel="Enable add-ons with bundles"
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
              accessibilityLabel="How to setup?"
              onClick={() =>
                window.open(
                  ADDONS_HELP_ARTICLE_URL,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              How to setup?
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
              Multi Language
            </s-button>
          </div>
        </div>
        <DisabledConfigurationRegion
          disabled={!addonDraft.addonProductsEnabled}
        >
          <s-stack direction="block" gap="small">
            <p className={fullPageBundleStyles.panelDescription}>
              Enable customers to add extra items to their bundles at a
              discounted price, for free, or at full price.
            </p>
            <div className={fullPageBundleStyles.addonsFormStack}>
              <s-text-field
                label="Add on Section title"
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
