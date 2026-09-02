import { DisabledConfigurationRegion } from "../_shared/bundle-configure/DisabledConfigurationRegion";
import { usePpbConfigureContext } from "./PpbConfigureContext";
import { ConfigureHelpPopover } from "../_shared/bundle-configure/ConfigureHelpPopover";
import { translateAdmin } from "~/i18n/config";

export function PpbStickyAddToCartSettings() {
  const {
    markAsDirty,
    stickyAddToCartAction,
    stickyAddToCartEnabled,
    stickyAddToCartShowDesktop,
    stickyAddToCartShowMobile,
    setStickyAddToCartAction,
    setStickyAddToCartEnabled,
    setStickyAddToCartShowDesktop,
    setStickyAddToCartShowMobile,
  } = usePpbConfigureContext();

  return (
    <s-section>
      <s-stack direction="block" gap="small">
        <s-stack
          direction="inline"
          alignItems="center"
          justifyContent="space-between"
          gap="base"
        >
          <s-stack direction="block" gap="small-100">
            <s-stack direction="inline" gap="small" alignItems="center">
              <s-heading>
                {translateAdmin("tooltips.stickyAddToCart.title")}
              </s-heading>
              <ConfigureHelpPopover tooltipKey="stickyAddToCart" />
            </s-stack>
            <s-text color="subdued">
              {translateAdmin(
                "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundlesettingscontrolsStickyaddtocart.keepABundleActionAvailableAfterTheMainBundleButtonLeavesTheViewp"
              )}
            </s-text>
          </s-stack>
          <s-switch
            accessibilityLabel={translateAdmin(
              "tooltips.stickyAddToCart.title"
            )}
            checked={stickyAddToCartEnabled || undefined}
            onChange={(event) => {
              setStickyAddToCartEnabled(
                (event.target as HTMLInputElement).checked
              );
              markAsDirty();
            }}
          />
        </s-stack>

        <DisabledConfigurationRegion disabled={!stickyAddToCartEnabled}>
          <s-stack direction="block" gap="small">
            <s-checkbox
              label={translateAdmin("adminAttributes.showOnDesktop")}
              checked={stickyAddToCartShowDesktop || undefined}
              disabled={!stickyAddToCartEnabled || undefined}
              onChange={(event) => {
                setStickyAddToCartShowDesktop(
                  (event.target as HTMLInputElement).checked
                );
                markAsDirty();
              }}
            />
            <s-checkbox
              label={translateAdmin("adminAttributes.showOnMobile")}
              checked={stickyAddToCartShowMobile || undefined}
              disabled={!stickyAddToCartEnabled || undefined}
              onChange={(event) => {
                setStickyAddToCartShowMobile(
                  (event.target as HTMLInputElement).checked
                );
                markAsDirty();
              }}
            />
            <s-select
              label={translateAdmin("adminAttributes.action")}
              value={stickyAddToCartAction}
              disabled={!stickyAddToCartEnabled || undefined}
              onChange={(event) => {
                setStickyAddToCartAction(
                  (event.target as HTMLSelectElement).value ===
                    "add_selected_offer"
                    ? "add_selected_offer"
                    : "scroll_to_offers"
                );
                markAsDirty();
              }}
            >
              <s-option value="scroll_to_offers">
                {translateAdmin(
                  "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundlesettingscontrolsStickyaddtocart.scrollToBundleOffers"
                )}
              </s-option>
              <s-option value="add_selected_offer">
                {translateAdmin(
                  "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundlesettingscontrolsStickyaddtocart.addSelectedBundle"
                )}
              </s-option>
            </s-select>
          </s-stack>
        </DisabledConfigurationRegion>
      </s-stack>
    </s-section>
  );
}
