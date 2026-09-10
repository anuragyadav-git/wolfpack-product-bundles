import type { ComponentProps } from "react";
import { FpbAddonTierEditor } from "./FreeGiftAddonTierEditor";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { translateAdmin } from "~/i18n/config";
import { ADDONS_HELP_ARTICLE_URL } from "../configure-constants";
import { ConfigureHelpPopover } from "../../_shared/bundle-configure/ConfigureHelpPopover";

export function FpbAddonProductsCard({
  enabled,
  title,
  translationsAvailable,
  styles,
  tierEditor,
  onEnabledChange,
  onOpenTranslations,
  onTitleChange,
}: {
  enabled: boolean;
  title: string;
  translationsAvailable: boolean;
  styles: Record<string, string>;
  tierEditor: ComponentProps<typeof FpbAddonTierEditor>;
  onEnabledChange: (enabled: boolean) => void;
  onOpenTranslations: () => void;
  onTitleChange: (title: string) => void;
}) {
  return (
    <>
      <div className={`${styles.card} ${styles.addonsCard}`}>
        <div className={styles.addonsHeaderLine}>
          <div className={styles.addonsTitleCluster}>
            <h3 className={styles.panelTitle}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonproductscard.addOnsWithBundles"
              )}
            </h3>
            <s-switch
              accessibilityLabel={translateAdmin(
                "adminAttributes.enableAddOnsWithBundles"
              )}
              checked={enabled || undefined}
              onChange={(e) =>
                onEnabledChange((e.target as HTMLInputElement).checked)
              }
            />
            <ConfigureHelpPopover tooltipKey="freeGiftAddons" />
          </div>
          <div className={styles.addonsHeaderActions}>
            <s-link href={ADDONS_HELP_ARTICLE_URL} target="_blank">
              {translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.howToSetup"
              )}
            </s-link>
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
          </div>
        </div>
        <DisabledConfigurationRegion disabled={!enabled}>
          <s-stack direction="block" gap="small">
            <p className={styles.panelDescription}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonproductscard.enableCustomersToAddExtraItemsToTheirBundlesAtADiscountedPriceFo"
              )}
            </p>
            <div className={styles.addonsFormStack}>
              <s-text-field
                label={translateAdmin("adminAttributes.addOnSectionTitle")}
                value={title}
                disabled={!enabled || undefined}
                onInput={(e) =>
                  onTitleChange((e.target as HTMLInputElement).value)
                }
                autocomplete="off"
              />
              <FpbAddonTierEditor {...tierEditor} />
            </div>
          </s-stack>
        </DisabledConfigurationRegion>
      </div>
    </>
  );
}
