import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { translateAdmin } from "~/i18n/config";
import { AssetUpload } from "../../../../components/shared/AssetUpload";

export interface FpbImagesGifsPanelProps {
  activeSection: string;
  bundleBannerDesktopUrl: string;
  bundleBannerMobileUrl: string;
  floatingBadgeEnabled: boolean;
  floatingBadgeText: string;
  markAsDirty: () => void;
  setBundleBannerDesktopUrl: (url: string) => void;
  setBundleBannerMobileUrl: (url: string) => void;
  setFloatingBadgeEnabled: (enabled: boolean) => void;
  setFloatingBadgeText: (text: string) => void;
}

export function FpbImagesGifsPanel({
  activeSection,
  bundleBannerDesktopUrl,
  bundleBannerMobileUrl,
  floatingBadgeEnabled,
  floatingBadgeText,
  markAsDirty,
  setBundleBannerDesktopUrl,
  setBundleBannerMobileUrl,
  setFloatingBadgeEnabled,
  setFloatingBadgeText,
}: FpbImagesGifsPanelProps) {
  return (
    <>
      {activeSection === "images_gifs" && (
        <>
          <s-section>
            <s-stack direction="block" gap="base">
              <s-grid
                gridTemplateColumns="auto minmax(0, 1fr) auto"
                gap="base"
                alignItems="start"
              >
                <s-icon type="upload" />
                <s-stack direction="block" gap="small-400">
                  <s-text type="strong">
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.promoBanner"
                    )}
                  </s-text>
                  <s-text color="subdued">
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.wideBannerDisplayedAtTheTopOfTheFullPageBundle"
                    )}
                  </s-text>
                </s-stack>
                <s-badge tone="info">
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.pageHeader"
                  )}
                </s-badge>
              </s-grid>
              <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                <AssetUpload
                  label={translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.bannerImageDesktop"
                  )}
                  hint={`${translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.recommendedSize"
                  )} ${translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.1900x230"
                  )}`}
                  value={bundleBannerDesktopUrl || null}
                  dropZoneContent={<s-icon type="desktop" size="base" />}
                  onChange={(url) => {
                    setBundleBannerDesktopUrl(url ?? "");
                    markAsDirty();
                  }}
                />
                <AssetUpload
                  label={translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.bannerImageMobile"
                  )}
                  hint={`${translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.recommendedSize"
                  )} ${translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.1100x500"
                  )}`}
                  value={bundleBannerMobileUrl || null}
                  dropZoneContent={<s-icon type="mobile" size="base" />}
                  onChange={(url) => {
                    setBundleBannerMobileUrl(url ?? "");
                    markAsDirty();
                  }}
                />
              </s-grid>
            </s-stack>
          </s-section>
          <s-section>
            <s-stack direction="block" gap="base">
              <s-grid
                gridTemplateColumns="auto minmax(0, 1fr) auto"
                gap="base"
                alignItems="start"
              >
                <s-icon type="note" />
                <s-stack direction="block" gap="small-400">
                  <s-text type="strong">
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.floatingPromoBadge"
                    )}
                  </s-text>
                  <s-text color="subdued">
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.fixedBadgeAtBottomLeftOfThePageSessionDismissedWhenShopperClicks"
                    )}
                  </s-text>
                </s-stack>
                <s-badge tone="info">
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.imagesgifspanel.storefront"
                  )}
                </s-badge>
              </s-grid>
              <s-checkbox
                label={translateAdmin("adminAttributes.showFloatingPromoBadge")}
                checked={floatingBadgeEnabled || undefined}
                onChange={(e) => {
                  setFloatingBadgeEnabled(
                    (e.target as HTMLInputElement).checked
                  );
                  markAsDirty();
                }}
              />
              <DisabledConfigurationRegion disabled={!floatingBadgeEnabled}>
                <s-text-field
                  label={translateAdmin("adminAttributes.badgeText")}
                  value={floatingBadgeText}
                  disabled={!floatingBadgeEnabled || undefined}
                  onInput={(e) => {
                    setFloatingBadgeText(
                      (e.target as HTMLInputElement).value.slice(0, 60)
                    );
                    markAsDirty();
                  }}
                  placeholder={translateAdmin(
                    "adminAttributes.eGSave20TodayOnly"
                  )}
                  autocomplete="off"
                />
              </DisabledConfigurationRegion>
            </s-stack>
          </s-section>
        </>
      )}
    </>
  );
}
