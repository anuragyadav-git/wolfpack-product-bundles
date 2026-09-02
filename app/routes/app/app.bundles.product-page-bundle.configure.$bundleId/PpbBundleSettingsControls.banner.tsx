import { usePpbConfigureContext } from "./PpbConfigureContext";
import { translateAdmin } from "~/i18n/config";

export function PpbBundleBannerSettings() {
  const {
    bundleBannerDesktopUrl,
    bundleBannerMobileUrl,
    FilePicker,
    markAsDirty,
    setBundleBannerDesktopUrl,
    setBundleBannerMobileUrl,
  } = usePpbConfigureContext();

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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 500 }}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.bannerImageDesktop"
              )}
            </p>
            <FilePicker
              value={bundleBannerDesktopUrl || null}
              uploadButtonAction="openPicker"
              fitPreviewToTrigger
              onChange={(url) => {
                setBundleBannerDesktopUrl(url ?? "");
                markAsDirty();
              }}
            />
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6d7175" }}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.recommendedSize"
              )}
              <span style={{ color: "#202223" }}>
                {translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.1900x230"
                )}
              </span>
            </p>
          </div>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 500 }}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.bannerImageMobile"
              )}
            </p>
            <FilePicker
              value={bundleBannerMobileUrl || null}
              triggerIcon="mobile"
              uploadButtonAction="openPicker"
              fitPreviewToTrigger
              onChange={(url) => {
                setBundleBannerMobileUrl(url ?? "");
                markAsDirty();
              }}
            />
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6d7175" }}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.recommendedSize"
              )}
              <span style={{ color: "#202223" }}>
                {translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstimeline.1100x500"
                )}
              </span>
            </p>
          </div>
        </div>
      </s-stack>
    </s-section>
  );
}
