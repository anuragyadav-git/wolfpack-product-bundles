import { translateAdmin } from "~/i18n/config";
import { QuestionHelpTooltip } from "../SmallComponents";

export interface FpbBundleTemplateSettingsProps {
  handleSectionChange: (section: string) => void;
  markAsDirty: () => void;
  setTextOverrides: (
    update: (previous: Record<string, string>) => Record<string, string>,
  ) => void;
  textOverrides: Record<string, string>;
}

export function FpbBundleTemplateSettings({
  handleSectionChange,
  markAsDirty,
  setTextOverrides,
  textOverrides,
}: FpbBundleTemplateSettingsProps) {

  return (
    <>
      <s-section>
        <s-stack direction="block" gap="small">
          <s-stack direction="inline" alignItems="center" gap="small">
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 600,
                flex: 1,
              }}
            >
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstemplate.cartLineItemDiscountDisplay"
              )}
            </p>
            <QuestionHelpTooltip tooltipKey="cartLineItemDiscountDisplay" />
            <s-button
              variant="secondary"
              icon="edit"
              onClick={() => handleSectionChange("discount_pricing")}
            >
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstemplate.editDefaults"
              )}
            </s-button>
          </s-stack>
          <p style={{ margin: 0, fontSize: 13, color: "#6d7175" }}>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstemplate.showsHowMuchTheCustomerIsSavingOnTheBundleInCart"
            )}
          </p>
          <s-choice-list
            name="cartDiscountDisplay"
            label={translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstemplate.cartLineItemDiscountDisplay"
            )}
            labelAccessibilityVisibility="exclusive"
            values={[textOverrides.cartDiscountDisplay ?? "defaults"]}
            onChange={(event: Event) => {
              const value = (event.currentTarget as any).values?.[0];
              if (!value) return;
              setTextOverrides((prev) => ({
                ...prev,
                cartDiscountDisplay: value,
              }));
              markAsDirty();
            }}
          >
          {[
            {
              value: "defaults",
              label: "Use app defaults",
              description:
                "Uses the discount format and label configured in your app settings.",
            },
            {
              value: "custom",
              label: "Customize for this bundle",
              description:
                "Set a different discount format or label for this bundle only.",
            },
          ].map(({ value, label, description }) => (
            <s-choice key={value} value={value}>
              {`${label}. ${description}`}
            </s-choice>
          ))}
          </s-choice-list>
        </s-stack>
      </s-section>
      {/* Bundle Banner — 2-column side-by-side layout */}
    </>
  );
}
