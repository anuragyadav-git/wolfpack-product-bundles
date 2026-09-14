import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { CountdownSettingsSection } from "../../_shared/bundle-configure/CountdownSettingsSection";
import type { MultiLanguageField } from "../../../../components/bundle-configure/MultiLanguageTextModal";
import type {
  CountdownExpiryAction,
  CountdownLayout,
  CountdownPosition,
} from "../../../../lib/bundle-countdown";
import { translateAdmin } from "~/i18n/config";
import { SettingsRow } from "../SmallComponents";

export interface FpbSummaryTextSettingsProps {
  clearValidationError: (path: string) => void;
  countdownEnabled: boolean;
  countdownExpiryAction: CountdownExpiryAction;
  countdownExpiredMessage: string;
  countdownLayout: CountdownLayout;
  countdownPosition: CountdownPosition;
  countdownTitle: string;
  lowStockAlertEnabled: boolean;
  lowStockAlertMessage: string;
  lowStockAlertThreshold: string;
  markAsDirty: () => void;
  openMultiLanguageModal: (
    title: string,
    fields: MultiLanguageField[],
  ) => void;
  scheduledEndsAt: string | null;
  setCountdownEnabled: (enabled: boolean) => void;
  setCountdownExpiryAction: (action: CountdownExpiryAction) => void;
  setCountdownExpiredMessage: (message: string) => void;
  setCountdownLayout: (layout: CountdownLayout) => void;
  setCountdownPosition: (position: CountdownPosition) => void;
  setCountdownTitle: (title: string) => void;
  setLowStockAlertEnabled: (enabled: boolean) => void;
  setLowStockAlertMessage: (message: string) => void;
  setLowStockAlertThreshold: (threshold: string) => void;
  setShowTextOnAddButton: (enabled: boolean) => void;
  setTextOverrides: (
    update: (previous: Record<string, string>) => Record<string, string>,
  ) => void;
  setVariantSelectorEnabled: (enabled: boolean) => void;
  shopLocales: Array<{locale: string; name: string; primary: boolean}>;
  showTextOnAddButton: boolean;
  textOverrides: Record<string, string>;
  validationErrors?: Record<string, string | undefined>;
  variantSelectorEnabled: boolean;
}

export function FpbSummaryTextSettings({
  clearValidationError,
  countdownEnabled,
  countdownExpiryAction,
  countdownExpiredMessage,
  countdownLayout,
  countdownPosition,
  countdownTitle,
  lowStockAlertEnabled,
  lowStockAlertMessage,
  lowStockAlertThreshold,
  markAsDirty,
  openMultiLanguageModal,
  scheduledEndsAt,
  setCountdownEnabled,
  setCountdownExpiryAction,
  setCountdownExpiredMessage,
  setCountdownLayout,
  setCountdownPosition,
  setCountdownTitle,
  setLowStockAlertEnabled,
  setLowStockAlertMessage,
  setLowStockAlertThreshold,
  setShowTextOnAddButton,
  setTextOverrides,
  setVariantSelectorEnabled,
  shopLocales,
  showTextOnAddButton,
  textOverrides,
  validationErrors = {},
  variantSelectorEnabled,
}: FpbSummaryTextSettingsProps) {

  return (
    <>
      <s-section>
        <s-stack direction="block" gap="small">
          <SettingsRow
            title={translateAdmin("tooltips.variantSelector.title")}
            description={translateAdmin(
              "adminExtracted.appBundlesProductPageBundleConfigure.ppbbundlesettingscontrolsQuantity.enableVariantSelectionWithinTheProductCardsInsteadOfTheQuickLook"
            )}
            tooltipKey="variantSelector"
          >
            <s-switch
              accessibilityLabel={translateAdmin(
                "adminAttributes.variantSelector"
              )}
              checked={variantSelectorEnabled || undefined}
              onChange={(e) => {
                const checked = (e.target as HTMLInputElement).checked;
                setVariantSelectorEnabled(checked);
                markAsDirty();
              }}
            />
          </SettingsRow>
          <SettingsRow
            title={translateAdmin("tooltips.lowStockAlert.title")}
            description={translateAdmin(
              "adminAttributes.showShopifySSellableComponentVariantQuantityWhenIt"
            )}
            tooltipKey="lowStockAlert"
          >
            <s-switch
              accessibilityLabel={translateAdmin(
                "tooltips.lowStockAlert.title"
              )}
              checked={lowStockAlertEnabled || undefined}
              onChange={(e) => {
                setLowStockAlertEnabled((e.target as HTMLInputElement).checked);
                markAsDirty();
              }}
            />
          </SettingsRow>
          <DisabledConfigurationRegion disabled={!lowStockAlertEnabled}>
            <s-stack direction="block" gap="small">
              <s-number-field
                id="configure-settings-lowStockThreshold"
                label={translateAdmin("adminAttributes.lowStockThreshold")}
                min={1}
                max={1000}
                value={lowStockAlertThreshold}
                disabled={!lowStockAlertEnabled}
                error={validationErrors["settings.lowStockThreshold"]}
                onInput={(e) => {
                  setLowStockAlertThreshold(
                    (e.target as HTMLInputElement).value
                  );
                  clearValidationError("settings.lowStockThreshold");
                  markAsDirty();
                }}
                autocomplete="off"
              />
              <s-text-field
                id="configure-settings-lowStockMessage"
                label={translateAdmin("adminAttributes.lowStockMessage")}
                value={lowStockAlertMessage}
                disabled={!lowStockAlertEnabled}
                error={validationErrors["settings.lowStockMessage"]}
                details="Include {{stock}} where the sellable quantity should appear."
                onInput={(e) => {
                  setLowStockAlertMessage((e.target as HTMLInputElement).value);
                  clearValidationError("settings.lowStockMessage");
                  markAsDirty();
                }}
                autocomplete="off"
              />
            </s-stack>
          </DisabledConfigurationRegion>
          <SettingsRow
            title={translateAdmin("tooltips.showTextOnAddButton.title")}
            description={translateAdmin(
              "adminAttributes.replacesTheIconWithATextButtonAndMoves"
            )}
            tooltipKey="showTextOnAddButton"
          >
            <s-switch
              accessibilityLabel={translateAdmin(
                "adminAttributes.showTextOnPlusButton"
              )}
              checked={showTextOnAddButton || undefined}
              onChange={(e) => {
                const enabled = (e.target as HTMLInputElement).checked;
                setShowTextOnAddButton(enabled);
                markAsDirty();
              }}
            />
          </SettingsRow>
          <DisabledConfigurationRegion disabled={!showTextOnAddButton}>
            <s-stack direction="inline" gap="small" alignItems="end">
              <s-text-field
                label={translateAdmin("adminAttributes.buttonText")}
                value={textOverrides.addToCartButton ?? ""}
                disabled={
                  !showTextOnAddButton || shopLocales.length === 0 || undefined
                }
                placeholder={translateAdmin("adminAttributes.addToCart")}
                autocomplete="off"
                onInput={(e) => {
                  setTextOverrides((prev) => ({
                    ...prev,
                    addToCartButton: (e.target as HTMLInputElement).value,
                  }));
                  markAsDirty();
                }}
              />
              <s-button
                variant="secondary"
                icon="language-translate"
                disabled={!showTextOnAddButton || undefined}
                onClick={() =>
                  openMultiLanguageModal("Add Button Text", [
                    {
                      key: "addToCartButton",
                      label: "Button text",
                      fallback: textOverrides.addToCartButton ?? "Add to Cart",
                    },
                  ])
                }
              >
                {translateAdmin(
                  "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
                )}
              </s-button>
            </s-stack>
          </DisabledConfigurationRegion>
        </s-stack>
      </s-section>
      <CountdownSettingsSection
        enabled={countdownEnabled}
        layout={countdownLayout}
        position={countdownPosition}
        title={countdownTitle}
        expiryAction={countdownExpiryAction}
        expiredMessage={countdownExpiredMessage}
        scheduledEndsAt={scheduledEndsAt}
        markAsDirty={markAsDirty}
        setEnabled={setCountdownEnabled}
        setLayout={setCountdownLayout}
        setPosition={setCountdownPosition}
        setTitle={setCountdownTitle}
        setExpiryAction={setCountdownExpiryAction}
        setExpiredMessage={setCountdownExpiredMessage}
      />
      {/* Bundle Cart */}
    </>
  );
}
