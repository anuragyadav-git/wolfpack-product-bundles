import type { ComponentProps } from "react";
import { FpbAddonTierEditor } from "./FreeGiftAddonTierEditor";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { translateAdmin } from "~/i18n/config";
import { ADDONS_HELP_ARTICLE_URL } from "../configure-constants";

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
            <s-button
              variant="tertiary"
              tone="neutral"
              icon="info"
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
            </s-button>
          </div>
          <div className={styles.addonsHeaderActions}>
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
