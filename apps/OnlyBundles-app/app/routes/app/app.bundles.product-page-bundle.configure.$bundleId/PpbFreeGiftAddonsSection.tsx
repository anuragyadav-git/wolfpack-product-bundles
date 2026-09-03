import React from "react";
import { usePpbConfigureContext } from "./PpbConfigureContext";
import { DisabledConfigurationRegion } from "../_shared/bundle-configure/DisabledConfigurationRegion";
import { ConfigureHelpPopover } from "../_shared/bundle-configure/ConfigureHelpPopover";
import { translateAdmin } from "~/i18n/config";
import { TUTORIAL_LINKS } from "../../../lib/tutorial-links";

export function PpbFreeGiftAddonsSection() {
  const {
    activeSection,
    activeTabIndex,
    FilePicker,
    markAsDirty,
    openAddonMultiLanguageModal,
    productPageBundleStyles,
    ruleMessages,
    setRuleMessages,
    setShowIconPickerForStep,
    shopLocales = [],
    showIconPickerForStep,
    showPolarisModal,
    stepsState,
    templateVariablesModalRef,
  } = usePpbConfigureContext();

  return (
    <>
      {activeSection === "free_gift_addons" &&
        (() => {
          const step = stepsState.steps[activeTabIndex] || stepsState.steps[0];
          if (!step)
            return (
              <div
                className={productPageBundleStyles.card}
                style={{ textAlign: "center", padding: "32px 16px" }}
              >
                <s-text color="subdued">
                  {translateAdmin(
                    "adminExtracted.appBundlesProductPageBundleConfigure.ppbfreegiftaddonssection.addAtLeastOneStepIn"
                  )}{" "}
                  <strong>
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetupdetailscard.stepSetup"
                    )}
                  </strong>{" "}
                  {translateAdmin(
                    "adminExtracted.appBundlesProductPageBundleConfigure.ppbfreegiftaddonssection.toConfigureFreeGiftAmpAddOnsSettings"
                  )}
                </s-text>
              </div>
            );
          const addonMessages = ruleMessages[`addons-${step.id}`] || {
            discountText: "",
            successMessage: "",
          };
          return (
            <div>
              <s-stack direction="block" gap="base">
                {/* Card 1: Add-Ons and Gifting Step */}
                <div className={productPageBundleStyles.card}>
                  <div className={productPageBundleStyles.panelHeader}>
                    <h3 className={productPageBundleStyles.panelTitle}>
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonreferencestepcard.addOnsAndGiftingStep"
                      )}
                      <ConfigureHelpPopover tooltipKey="freeGiftAddons" />
                    </h3>
                    <s-checkbox
                      accessibilityLabel={translateAdmin(
                        "adminAttributes.enableAddOnsAndGiftingStep"
                      )}
                      checked={step.isFreeGift || undefined}
                      onChange={(e) => {
                        const checked = (e.target as HTMLInputElement).checked;
                        stepsState.updateStepField(
                          step.id,
                          "isFreeGift",
                          checked
                        );
                        markAsDirty();
                      }}
                    />
                  </div>
                  <DisabledConfigurationRegion disabled={!step.isFreeGift}>
                    <div className={productPageBundleStyles.mediaFieldGrid}>
                      <div className={productPageBundleStyles.iconColumn}>
                        <div className={productPageBundleStyles.iconBox}>
                          {step.addonIconUrl ? (
                            <img
                              src={step.addonIconUrl}
                              alt={translateAdmin(
                                "adminAttributes.addOnsStepIcon"
                              )}
                              className={productPageBundleStyles.iconImg}
                            />
                          ) : (
                            <div
                              className={
                                productPageBundleStyles.iconPlaceholder
                              }
                            >
                              {translateAdmin(
                                "adminExtracted.appBundlesProductPageBundleConfigure.ppbfreegiftaddonssection.uploadFile"
                              )}
                            </div>
                          )}
                        </div>
                        {showIconPickerForStep === `addon-${step.id}` && (
                          <FilePicker
                            autoOpen
                            disabled={!step.isFreeGift}
                            value={step.addonIconUrl ?? null}
                            maxUploadBytes={50 * 1024}
                            maxUploadErrorMessage="Please upload a file smaller than 50KB"
                            onChange={(url: string | null) => {
                              stepsState.updateStepField(
                                step.id,
                                "addonIconUrl",
                                url
                              );
                              setShowIconPickerForStep(null);
                              markAsDirty();
                            }}
                            onClose={() => setShowIconPickerForStep(null)}
                            label=""
                          />
                        )}
                        <s-button
                          variant="secondary"
                          icon="upload"
                          disabled={!step.isFreeGift || undefined}
                          onClick={() =>
                            setShowIconPickerForStep((prev) =>
                              prev === `addon-${step.id}`
                                ? null
                                : `addon-${step.id}`
                            )
                          }
                        >
                          {showIconPickerForStep === `addon-${step.id}`
                            ? "Close picker"
                            : "Replace"}
                        </s-button>
                      </div>
                      <s-stack direction="block" gap="small">
                        <s-button
                          variant="secondary"
                          icon="language-translate"
                          disabled={
                            !step.isFreeGift ||
                            shopLocales.length === 0 ||
                            undefined
                          }
                          onClick={() =>
                            openAddonMultiLanguageModal(step.id, "step")
                          }
                        >
                          {translateAdmin(
                            "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
                          )}
                        </s-button>
                        <s-text-field
                          label={translateAdmin("adminAttributes.stepName")}
                          disabled={!step.isFreeGift || undefined}
                          value={step.addonLabel ?? step.freeGiftName ?? ""}
                          placeholder={translateAdmin("adminAttributes.addOn")}
                          onInput={(e) => {
                            const value = (e.target as HTMLInputElement).value;
                            stepsState.updateStepField(
                              step.id,
                              "addonLabel",
                              value
                            );
                            stepsState.updateStepField(
                              step.id,
                              "freeGiftName",
                              value
                            );
                            markAsDirty();
                          }}
                          autocomplete="off"
                        />
                        <s-text-field
                          label={translateAdmin("adminAttributes.addOn")}
                          disabled={!step.isFreeGift || undefined}
                          value={step.addonAddText ?? ""}
                          placeholder={translateAdmin(
                            "adminAttributes.addToCart"
                          )}
                          onInput={(e) => {
                            stepsState.updateStepField(
                              step.id,
                              "addonAddText",
                              (e.target as HTMLInputElement).value || null
                            );
                            markAsDirty();
                          }}
                          autocomplete="off"
                        />
                        <s-text-field
                          label={translateAdmin("adminAttributes.stepTitle")}
                          disabled={!step.isFreeGift || undefined}
                          value={step.addonTitle ?? ""}
                          onInput={(e) => {
                            stepsState.updateStepField(
                              step.id,
                              "addonTitle",
                              (e.target as HTMLInputElement).value
                            );
                            markAsDirty();
                          }}
                          autocomplete="off"
                        />
                        <s-text-field
                          label={translateAdmin(
                            "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonreferencestepcard.replace"
                          )}
                          disabled={!step.isFreeGift || undefined}
                          value={step.addonReplaceText ?? ""}
                          placeholder={translateAdmin(
                            "adminAttributes.selected"
                          )}
                          onInput={(e) => {
                            stepsState.updateStepField(
                              step.id,
                              "addonReplaceText",
                              (e.target as HTMLInputElement).value || null
                            );
                            markAsDirty();
                          }}
                          autocomplete="off"
                        />
                      </s-stack>
                    </div>
                  </DisabledConfigurationRegion>
                </div>
                {/* Card 2: Add-Ons with Bundles */}
                <div className={productPageBundleStyles.card}>
                  <div className={productPageBundleStyles.panelHeader}>
                    <div>
                      <h3 className={productPageBundleStyles.panelTitle}>
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonproductscard.addOnsWithBundles"
                        )}
                      </h3>
                      <p className={productPageBundleStyles.panelDescription}>
                        {translateAdmin(
                          "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonproductscard.enableCustomersToAddExtraItemsToTheirBundlesAtADiscountedPriceFo"
                        )}
                      </p>
                    </div>
                    <s-checkbox
                      accessibilityLabel={translateAdmin(
                        "adminAttributes.enableAddOnsWithBundles"
                      )}
                      checked={
                        step.addonUnlockAfterCompletion !== false || undefined
                      }
                      onChange={(e) => {
                        stepsState.updateStepField(
                          step.id,
                          "addonUnlockAfterCompletion",
                          (e.target as HTMLInputElement).checked
                        );
                        markAsDirty();
                      }}
                    />
                  </div>
                  <DisabledConfigurationRegion
                    disabled={step.addonUnlockAfterCompletion === false}
                  >
                    <s-stack direction="block" gap="small">
                      <s-stack direction="inline" gap="small">
                        <s-press-button
                          variant="tertiary"
                          tone="neutral"
                          icon="play"
                          accessibilityLabel={translateAdmin(
                            "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.howToSetup"
                          )}
                          onClick={() =>
                            window.open(
                              TUTORIAL_LINKS.productPageGiftsAndAddons,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                        >
                          {translateAdmin(
                            "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.howToSetup"
                          )}
                        </s-press-button>
                        <s-button
                          variant="secondary"
                          icon="language-translate"
                          disabled={
                            step.addonUnlockAfterCompletion === false ||
                            shopLocales.length === 0 ||
                            undefined
                          }
                          onClick={() =>
                            openAddonMultiLanguageModal(step.id, "section")
                          }
                        >
                          {translateAdmin(
                            "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
                          )}
                        </s-button>
                      </s-stack>
                      <s-text-field
                        label={translateAdmin(
                          "adminAttributes.addOnSectionTitle"
                        )}
                        value={step.freeGiftName ?? ""}
                        onInput={(e) => {
                          stepsState.updateStepField(
                            step.id,
                            "freeGiftName",
                            (e.target as HTMLInputElement).value
                          );
                          markAsDirty();
                        }}
                        autocomplete="off"
                      />
                      {(() => {
                        const addonTiers: { displayFree: boolean }[] =
                          Array.isArray(step.addonTiers)
                            ? (step.addonTiers as { displayFree: boolean }[])
                            : [];
                        const updateAddonTiers = (
                          updated: { displayFree: boolean }[]
                        ) => {
                          stepsState.updateStepField(
                            step.id,
                            "addonTiers",
                            updated
                          );
                          markAsDirty();
                        };
                        return (
                          <>
                            {addonTiers.map((tier, idx) => (
                              <div
                                key={idx}
                                className={productPageBundleStyles.ruleCard}
                              >
                                <div
                                  className={productPageBundleStyles.ruleHeader}
                                >
                                  <h4
                                    style={{
                                      margin: 0,
                                      fontSize: 14,
                                      fontWeight: 650,
                                    }}
                                  >
                                    {translateAdmin("adminDynamic.tierNumber", {
                                      number: idx + 1,
                                    })}
                                  </h4>
                                  <s-button
                                    variant="tertiary"
                                    icon="delete"
                                    onClick={() => {
                                      updateAddonTiers(
                                        addonTiers.filter((_, i) => i !== idx)
                                      );
                                    }}
                                  >
                                    {translateAdmin(
                                      "dashboard.deleteModal.delete"
                                    )}
                                  </s-button>
                                </div>
                                <s-checkbox
                                  label={translateAdmin(
                                    "adminAttributes.displayProductsAsFree000"
                                  )}
                                  checked={tier.displayFree === true}
                                  onChange={(e) => {
                                    const updated = addonTiers.map((t, i) =>
                                      i === idx
                                        ? {
                                            ...t,
                                            displayFree: (
                                              e.target as HTMLInputElement
                                            ).checked,
                                          }
                                        : t
                                    );
                                    updateAddonTiers(updated);
                                  }}
                                />
                              </div>
                            ))}
                            <s-button
                              variant="secondary"
                              icon="plus"
                              onClick={() =>
                                updateAddonTiers([
                                  ...addonTiers,
                                  { displayFree: true },
                                ])
                              }
                            >
                              {translateAdmin(
                                "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddontiereditor.addAddOnsTier"
                              )}
                            </s-button>
                          </>
                        );
                      })()}
                    </s-stack>
                  </DisabledConfigurationRegion>
                </div>
                {/* Card 3: Footer Messaging */}
                {Array.isArray(step.addonTiers) &&
                  step.addonTiers.length > 0 && (
                    <DisabledConfigurationRegion
                      disabled={step.addonUnlockAfterCompletion === false}
                    >
                      <div className={productPageBundleStyles.card}>
                        <div className={productPageBundleStyles.panelHeader}>
                          <h3 className={productPageBundleStyles.panelTitle}>
                            {translateAdmin(
                              "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonfootermessaging.footerMessaging"
                            )}
                          </h3>
                          <s-stack direction="inline" gap="small-100">
                            <s-button
                              variant="tertiary"
                              icon="code"
                              onClick={() =>
                                showPolarisModal(templateVariablesModalRef)
                              }
                            >
                              {translateAdmin(
                                "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountmessagingoptions.showVariables"
                              )}
                            </s-button>
                            <s-button
                              variant="secondary"
                              icon="language-translate"
                              disabled={
                                step.addonUnlockAfterCompletion === false ||
                                shopLocales.length === 0 ||
                                undefined
                              }
                              onClick={() =>
                                openAddonMultiLanguageModal(step.id, "footer")
                              }
                            >
                              {translateAdmin(
                                "adminExtracted.shared.bundleConfigure.bundlesubscriptionssection.multiLanguage"
                              )}
                            </s-button>
                          </s-stack>
                        </div>
                        <s-stack direction="block" gap="small">
                          <h4
                            style={{ margin: 0, fontSize: 14, fontWeight: 650 }}
                          >
                            {translateAdmin(
                              "adminExtracted.appBundlesFullPageBundleConfigure.sections.freegiftaddonfootermessaging.tier1"
                            )}
                          </h4>
                          <s-text-field
                            label={translateAdmin(
                              "adminAttributes.messageWhenRuleNotMet"
                            )}
                            value={addonMessages.discountText}
                            placeholder={translateAdmin(
                              "adminAttributes.addAddonsConditionDiffMoreProductSToClaimAddonsDiscountValueAddonsDiscountValueUnit"
                            )}
                            onInput={(e) => {
                              const value = (e.target as HTMLInputElement)
                                .value;
                              setRuleMessages((prev) => ({
                                ...prev,
                                [`addons-${step.id}`]: {
                                  ...(prev[`addons-${step.id}`] ||
                                    addonMessages),
                                  discountText: value,
                                },
                              }));
                            }}
                            autocomplete="off"
                          />
                          <s-text-field
                            label={translateAdmin(
                              "adminExtracted.appBundlesProductPageBundleConfigure.ppbdiscountmessagerulefields.successMessage"
                            )}
                            value={addonMessages.successMessage}
                            placeholder={translateAdmin(
                              "adminAttributes.congratsYouAreEligibleForAddonsDiscountValueAddonsDiscountValueUnitOffOn"
                            )}
                            onInput={(e) => {
                              const value = (e.target as HTMLInputElement)
                                .value;
                              setRuleMessages((prev) => ({
                                ...prev,
                                [`addons-${step.id}`]: {
                                  ...(prev[`addons-${step.id}`] ||
                                    addonMessages),
                                  successMessage: value,
                                },
                              }));
                            }}
                            autocomplete="off"
                          />
                        </s-stack>
                      </div>
                    </DisabledConfigurationRegion>
                  )}
              </s-stack>
            </div>
          );
        })()}
    </>
  );
}
