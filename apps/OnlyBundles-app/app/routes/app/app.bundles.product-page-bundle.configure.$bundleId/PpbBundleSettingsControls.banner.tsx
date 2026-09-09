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
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.bundleBanner"
          )}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: "#6d7175" }}>
          {translateAdmin(
            "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.uploadBannerImagesForDesktopAndMobileViewsThatWillBeDisplayedAtT"
          )}
        </p>
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
