import type { MultiLanguageField } from "../../../../components/bundle-configure/MultiLanguageTextModal";
import { translateAdmin } from "~/i18n/config";

export interface FpbBundleCartSettingsProps {
  fullPageBundleStyles: Record<string, string>;
  markAsDirty: () => void;
  openMultiLanguageModal: (
    title: string,
    fields: MultiLanguageField[],
  ) => void;
  setTextOverrides: (
    update: (previous: Record<string, string>) => Record<string, string>,
  ) => void;
  shopLocales: Array<{locale: string; name: string; primary: boolean}>;
  textOverrides: Record<string, string>;
}

export function FpbBundleCartSettings({
  fullPageBundleStyles,
  markAsDirty,
  openMultiLanguageModal,
  setTextOverrides,
  shopLocales,
  textOverrides,
}: FpbBundleCartSettingsProps) {

  return (
    <>
      <s-section>
        <s-stack direction="block" gap="small">
          <s-stack direction="inline" alignItems="center" gap="small">
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                flex: 1,
              }}
            >
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingsbundlecart.bundleCart"
              )}
            </h3>
            <s-button
              variant="secondary"
              icon="language-translate"
              disabled={shopLocales.length === 0 || undefined}
              onClick={() =>
                openMultiLanguageModal("Bundle Cart", [
                  {
                    key: "yourBundle",
                    label: "Bundle Cart Title",
                    fallback: textOverrides.yourBundle ?? "Your Bundle",
                  },
                  {
                    key: "reviewBundle",
                    label: "Bundle Cart Subtitle",
                    fallback:
                      textOverrides.reviewBundle ?? "Review your bundle",
                  },
                ])
              }
            >
              {translateAdmin(
                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
              )}
            </s-button>
          </s-stack>
          <div className={fullPageBundleStyles.settingsNestedFields}>
            <s-text-field
              label={translateAdmin("adminAttributes.bundleCartTitle")}
              value={textOverrides.yourBundle ?? ""}
              placeholder={translateAdmin("adminAttributes.yourBundle")}
              autocomplete="off"
              onInput={(e) => {
                setTextOverrides((prev) => ({
                  ...prev,
                  yourBundle: (e.target as HTMLInputElement).value,
                }));
                markAsDirty();
              }}
            />
            <s-text-field
              label={translateAdmin("adminAttributes.bundleCartSubtitle")}
              value={textOverrides.reviewBundle ?? ""}
              placeholder={translateAdmin("adminAttributes.reviewYourBundle")}
              autocomplete="off"
              onInput={(e) => {
                setTextOverrides((prev) => ({
                  ...prev,
                  reviewBundle: (e.target as HTMLInputElement).value,
                }));
                markAsDirty();
              }}
            />
          </div>
        </s-stack>
      </s-section>
      {/* Cart line item discount display */}
    </>
  );
}
