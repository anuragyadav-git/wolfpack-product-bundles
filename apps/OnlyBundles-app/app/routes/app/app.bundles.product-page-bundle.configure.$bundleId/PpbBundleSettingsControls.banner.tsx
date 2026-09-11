import { translateAdmin } from "~/i18n/config";
import { AssetUpload } from "../../../components/shared/AssetUpload";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export type PpbBundleBannerSettingsProps = Pick<
  PpbConfigureFlow,
  | "bundleBannerDesktopUrl"
  | "bundleBannerMobileUrl"
  | "markAsDirty"
  | "setBundleBannerDesktopUrl"
  | "setBundleBannerMobileUrl"
>;

export function PpbBundleBannerSettings({
  bundleBannerDesktopUrl,
  bundleBannerMobileUrl,
  markAsDirty,
  setBundleBannerDesktopUrl,
  setBundleBannerMobileUrl,
}: PpbBundleBannerSettingsProps) {
  return (
    <s-section>
      <s-stack direction="block" gap="small">
        <s-text type="strong">
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.bundleBanner"
          )}
        </s-text>
        <s-text color="subdued">
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.uploadBannerImagesForDesktopAndMobileViewsThatWillBeDisplayedAtT"
          )}
        </s-text>
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
  );
}
