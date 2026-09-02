import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { areFpbProductSlotsAvailable } from "../../../../lib/fpb-product-slots-availability";
import { translateAdmin } from "~/i18n/config";

export function FpbQuantitySettings({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    activeTabIndex,
    conditionsState,
    FilePicker,
    markAsDirty,
    maxQtyPerProduct,
    productSlotIconUrl,
    productSlotsEnabled,
    quantityValidationEnabled,
    QuestionHelpTooltip,
    setMaxQtyPerProduct,
    setProductSlotIconUrl,
    setProductSlotsEnabled,
    setQuantityValidationEnabled,
    setShowSlotIconPicker,
    showSlotIconPicker,
    stepsState,
    validationErrors = {},
    clearValidationError,
  } = flow;
  const settingsStep = stepsState.steps[activeTabIndex] || stepsState.steps[0];
  const productSlotsAvailable = areFpbProductSlotsAvailable(
    stepsState.steps,
    conditionsState.stepConditions
  );

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
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingsquantity.enableQuantityValidation"
              )}
              <QuestionHelpTooltip tooltipKey="quantityValidation" />
            </h3>
            <s-switch
              accessibilityLabel={translateAdmin(
                "adminAttributes.enableQuantityValidation"
              )}
              checked={quantityValidationEnabled || undefined}
              onChange={(e) => {
                setQuantityValidationEnabled(
                  (e.target as HTMLInputElement).checked
                );
                markAsDirty();
              }}
            />
          </s-stack>
          <DisabledConfigurationRegion disabled={!quantityValidationEnabled}>
            <s-number-field
              id="configure-settings-maxQuantity"
              label={translateAdmin(
                "adminAttributes.maximumAllowedQuantityPerProduct"
              )}
              required={quantityValidationEnabled || undefined}
              error={validationErrors["settings.maxQuantity"]}
              min={1}
              value={maxQtyPerProduct || "1"}
              disabled={!quantityValidationEnabled}
              onInput={(e) => {
                setMaxQtyPerProduct((e.target as HTMLInputElement).value);
                markAsDirty();
                clearValidationError("settings.maxQuantity");
              }}
              autocomplete="off"
            />
          </DisabledConfigurationRegion>
          {/* Product Slots sub-section */}
          {settingsStep && (
            <>
              <s-divider />
              <s-stack direction="block" gap="small-400">
                <s-stack direction="inline" alignItems="center" gap="small">
                  <p
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 600,
                      flex: 1,
                      opacity: productSlotsAvailable ? 1 : 0.5,
                    }}
                  >
                    {translateAdmin("tooltips.productSlots.title")}
                    <QuestionHelpTooltip tooltipKey="productSlots" />
                  </p>
                  <s-switch
                    accessibilityLabel={translateAdmin(
                      "adminAttributes.enableProductSlotsDisplay"
                    )}
                    checked={
                      productSlotsAvailable && productSlotsEnabled
                        ? true
                        : undefined
                    }
                    disabled={!productSlotsAvailable}
                    onChange={(e) => {
                      if (!productSlotsAvailable) return;
                      setProductSlotsEnabled(
                        (e.target as HTMLInputElement).checked
                      );
                      markAsDirty();
                    }}
                  />
                </s-stack>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "#6d7175",
                    opacity: productSlotsAvailable ? 1 : 0.5,
                  }}
                >
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingsquantity.thisFeatureDisplaysEmptySlotsOnTheStorefront"
                  )}
                </p>
              </s-stack>
            </>
          )}
          {/* Slot Icon — nested inside EQV section */}
          <s-stack direction="block" gap="small-400">
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                opacity: productSlotsAvailable ? 1 : 0.5,
              }}
            >
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  flex: "0 0 84px",
                  width: 84,
                  height: 84,
                  border: "1px solid #dfe3e8",
                  borderRadius: 6,
                  background: "#fff",
                  overflow: "hidden",
                }}
              >
                {productSlotIconUrl ? (
                  <img
                    src={productSlotIconUrl}
                    alt=""
                    style={{
                      display: "block",
                      width: 56,
                      height: 56,
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    style={{
                      color: "#777",
                      fontSize: 34,
                      fontWeight: 300,
                      lineHeight: 1,
                    }}
                  >
                    +
                  </span>
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1, paddingTop: 2 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 650,
                    lineHeight: "20px",
                  }}
                >
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingsquantity.slotIcon"
                  )}
                </h3>
                <p
                  style={{
                    margin: "2px 0 10px",
                    fontSize: 13,
                    lineHeight: "18px",
                    color: "#303030",
                  }}
                >
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingsquantity.youCanChangeTheDefaultIconThatRendersInTheEmptySlots"
                  )}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <s-button
                    variant="secondary"
                    icon="replace"
                    disabled={!productSlotsAvailable}
                    onClick={() => setShowSlotIconPicker(true)}
                  >
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingsquantity.changeIcon"
                    )}
                  </s-button>
                  <button
                    type="button"
                    disabled={!productSlotsAvailable}
                    onClick={() => {
                      setProductSlotIconUrl("");
                      markAsDirty();
                    }}
                    style={{
                      appearance: "none",
                      border: 0,
                      padding: 0,
                      background: "transparent",
                      color: productSlotsAvailable ? "#005bd3" : "#8c9196",
                      font: "inherit",
                      fontSize: 13,
                      lineHeight: "20px",
                      cursor: productSlotsAvailable ? "pointer" : "default",
                    }}
                  >
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingsquantity.reset"
                    )}
                  </button>
                </div>
              </div>
            </div>
            {productSlotsAvailable && showSlotIconPicker && (
              <FilePicker
                autoOpen
                onClose={() => setShowSlotIconPicker(false)}
                value={productSlotIconUrl || null}
                onChange={(url: string | null) => {
                  setProductSlotIconUrl(url ?? "");
                  setShowSlotIconPicker(false);
                  markAsDirty();
                }}
                label={translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingsquantity.slotIcon"
                )}
                uploadLabel="No file chosen"
              />
            )}
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "#6d7175",
                opacity: productSlotsAvailable ? 1 : 0.5,
              }}
            >
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.bundlesettingsquantity.noteOnlyApplicableWhenRulesAreBasedOnQuantity"
              )}
            </p>
          </s-stack>
        </s-stack>
      </s-section>
      {/* Variant Selector + Show Text on + Button */}
    </>
  );
}
