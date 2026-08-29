import React from "react";
import { usePpbConfigureContext } from "./PpbConfigureContext";
import { DisabledConfigurationRegion } from "../_shared/bundle-configure/DisabledConfigurationRegion";

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
                  Add at least one step in <strong>Step Setup</strong> to
                  configure Free Gift &amp; Add Ons settings.
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
                      Add-Ons and Gifting Step
                    </h3>
                    <s-checkbox
                      accessibilityLabel="Enable add-ons and gifting step"
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
                              alt="Add-ons step icon"
                              className={productPageBundleStyles.iconImg}
                            />
                          ) : (
                            <div
                              className={
                                productPageBundleStyles.iconPlaceholder
                              }
                            >
                              Upload file
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
                            !step.isFreeGift || shopLocales.length === 0 || undefined
                          }
                          onClick={() =>
                            openAddonMultiLanguageModal(step.id, "step")
                          }
                        >
                          Multi Language
                        </s-button>
                        <s-text-field
                          label="Step Name"
                          disabled={!step.isFreeGift || undefined}
                          value={step.addonLabel ?? step.freeGiftName ?? ""}
                          placeholder="Add On"
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
                          label="Add On"
                          disabled={!step.isFreeGift || undefined}
                          value={step.addonAddText ?? ""}
                          placeholder="Add to Cart"
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
                          label="Step Title"
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
                          label="Replace"
                          disabled={!step.isFreeGift || undefined}
                          value={step.addonReplaceText ?? ""}
                          placeholder="Selected ✓"
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
                        Add-Ons with Bundles
                      </h3>
                      <p className={productPageBundleStyles.panelDescription}>
                        Enable customers to add extra items to their bundles at
                        a discounted price, for free, or at full price.
                      </p>
                    </div>
                    <s-checkbox
                      accessibilityLabel="Enable add-ons with bundles"
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
                          accessibilityLabel="How to setup?"
                          onClick={() =>
                            window.open(
                              "https://www.youtube.com/watch?v=5ClNNtFybHo",
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                        >
                          How to setup?
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
                          Multi Language
                        </s-button>
                      </s-stack>
                      <s-text-field
                        label="Add on Section title"
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
                                    Tier {idx + 1}
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
                                    Delete
                                  </s-button>
                                </div>
                                <s-checkbox
                                  label="Display products as free ($0.00)"
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
                              Add Add Ons Tier
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
                            Footer Messaging
                          </h3>
                          <s-stack direction="inline" gap="small-100">
                            <s-button
                              variant="tertiary"
                              icon="code"
                              onClick={() =>
                                showPolarisModal(templateVariablesModalRef)
                              }
                            >
                              Show Variables
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
                              Multi Language
                            </s-button>
                          </s-stack>
                        </div>
                        <s-stack direction="block" gap="small">
                          <h4
                            style={{ margin: 0, fontSize: 14, fontWeight: 650 }}
                          >
                            Tier 1
                          </h4>
                          <s-text-field
                            label="Message when rule not met"
                            value={addonMessages.discountText}
                            placeholder="Add {{addonsConditionDiff}} more product(s) to claim {{addonsDiscountValue}}{{addonsDiscountValueUnit}} off on Add ons"
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
                            label="Success Message"
                            value={addonMessages.successMessage}
                            placeholder="Congrats you are eligible for {{addonsDiscountValue}}{{addonsDiscountValueUnit}} off on Add ons"
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
