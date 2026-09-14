import { useNavigate } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { navigateToProductPageDefaults } from "../../../lib/bundle-config/product-page-admin-sections";
import { translateAdmin } from "~/i18n/config";
import { QuestionHelpTooltip } from "./ConfigureBundleFlow.helpers";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

const CART_DISCOUNT_DISPLAY_OPTIONS = [
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
];

export type PpbCartDiscountDisplaySettingsProps = Pick<
  PpbConfigureFlow,
  "markAsDirty" | "setTextOverrides" | "textOverrides"
>;

export function PpbCartDiscountDisplaySettings({
  markAsDirty,
  setTextOverrides,
  textOverrides,
}: PpbCartDiscountDisplaySettingsProps) {
  const navigate = useNavigate();
  const shopify = useAppBridge();

  return (
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
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingstemplate.cartLineItemDiscountDisplay"
            )}
          </h3>
          <QuestionHelpTooltip tooltipKey="cartLineItemDiscountDisplay" />
          <s-button
            variant="secondary"
            onClick={() => {
              void navigateToProductPageDefaults(
                () => shopify.saveBar.leaveConfirmation(),
                navigate
              );
            }}
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
          {CART_DISCOUNT_DISPLAY_OPTIONS.map(({ value, label, description }) => (
            <s-choice key={value} value={value}>
              {`${label}. ${description}`}
            </s-choice>
          ))}
        </s-choice-list>
      </s-stack>
    </s-section>
  );
}
