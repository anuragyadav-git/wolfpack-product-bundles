import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";

export function FpbBundleCartSettings({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    fullPageBundleStyles,
    markAsDirty,
    openMultiLanguageModal,
    setTextOverrides,
    textOverrides,
  } = flow;

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
              Bundle Cart
            </h3>
            <s-button
              variant="secondary"
              icon="globe"
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
              Multi Language
            </s-button>
          </s-stack>
          <div className={fullPageBundleStyles.settingsNestedFields}>
            <s-text-field
              label="Bundle Cart Title"
              value={textOverrides.yourBundle ?? ""}
              placeholder="Your Bundle"
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
              label="Bundle Cart Subtitle"
              value={textOverrides.reviewBundle ?? ""}
              placeholder="Review your bundle"
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
