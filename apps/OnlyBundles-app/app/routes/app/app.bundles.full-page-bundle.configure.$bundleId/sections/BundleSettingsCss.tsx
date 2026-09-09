import { BundleStatusSection } from "../../_shared/bundle-configure/BundleStatusSection";
import type { BundleStatus } from "../../../../constants/bundle";
import { translateAdmin } from "~/i18n/config";

export interface FpbBundleCssSettingsProps {
  bundleLevelCss: string;
  bundleLevelCssExpanded: boolean;
  bundleStatus: BundleStatus;
  markAsDirty: () => void;
  setBundleLevelCss: (value: string) => void;
  setBundleLevelCssExpanded: (update: (previous: boolean) => boolean) => void;
  setBundleStatus: (status: BundleStatus) => void;
}

export function FpbBundleCssSettings({
  bundleLevelCss,
  bundleLevelCssExpanded,
  bundleStatus,
  markAsDirty,
  setBundleLevelCss,
  setBundleLevelCssExpanded,
  setBundleStatus,
}: FpbBundleCssSettingsProps) {
  return (
    <>
      {/* Bundle Level CSS — collapsible */}
      <s-section>
        <s-stack direction="block" gap="small">
          <s-clickable
            inlineSize="100%"
            padding="none"
            aria-expanded={bundleLevelCssExpanded}
            onClick={() => setBundleLevelCssExpanded((prev) => !prev)}
          >
            <s-stack
              direction="inline"
              alignItems="center"
              justifyContent="space-between"
            >
              <s-heading>
                {translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingscss.bundleLevelCss"
                )}
              </s-heading>
              <s-icon
                type={bundleLevelCssExpanded ? "chevron-up" : "chevron-down"}
                tone="neutral"
              />
            </s-stack>
          </s-clickable>
          {bundleLevelCssExpanded && (
            <s-text-area
              label={translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingscss.bundleLevelCss"
              )}
              value={bundleLevelCss}
              placeholder={translateAdmin(
                "adminAttributes.addCustomCSSForThisBundle"
              )}
              rows={6}
              onInput={(e: Event) => {
                setBundleLevelCss((e.currentTarget as HTMLTextAreaElement).value);
                markAsDirty();
              }}
            />
          )}
        </s-stack>
      </s-section>
      <div data-tour-target="fpb-bundle-status">
        <s-section>
          <BundleStatusSection
            status={bundleStatus}
            onChange={setBundleStatus}
            showHeading={false}
          />
        </s-section>
      </div>
    </>
  );
}
