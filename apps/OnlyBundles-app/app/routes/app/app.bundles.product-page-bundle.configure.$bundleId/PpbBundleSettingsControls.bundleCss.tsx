import { translateAdmin } from "~/i18n/config";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export type PpbBundleLevelCssSettingsProps = Pick<
  PpbConfigureFlow,
  | "bundleLevelCss"
  | "bundleLevelCssExpanded"
  | "markAsDirty"
  | "setBundleLevelCss"
  | "setBundleLevelCssExpanded"
>;

export function PpbBundleLevelCssSettings({
  bundleLevelCss,
  bundleLevelCssExpanded,
  markAsDirty,
  setBundleLevelCss,
  setBundleLevelCssExpanded,
}: PpbBundleLevelCssSettingsProps) {

  return (
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
  );
}
