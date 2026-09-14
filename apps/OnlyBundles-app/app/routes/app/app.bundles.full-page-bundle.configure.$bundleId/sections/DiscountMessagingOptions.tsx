import type { Dispatch, SetStateAction } from "react";
import type { useBundlePricing } from "../../../../hooks/useBundlePricing";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { translateAdmin } from "~/i18n/config";
import { DiscountMethod } from "../../../../types/pricing";
import {
  getDefaultDiscountRuleSuccessMessage,
  getDefaultDiscountRuleText,
} from "../../../../lib/pricing-display-options";
import { QuestionHelpTooltip } from "../SmallComponents";

export function FpbDiscountMessagingOptions({
  pricingState,
  localization,
  markAsDirty,
  normalizedRuleMessages,
  styles,
  validationErrors,
  onShowVariables,
}: {
  pricingState: ReturnType<typeof useBundlePricing>;
  localization: {
    activeLocale: string;
    enabled: boolean;
    globalSuccessMessage: string;
    locales: Array<{ locale: string; name: string; primary: boolean }>;
    ruleMessagesByLocale: Record<
      string,
      Record<string, { discountText: string; successMessage: string }>
    >;
    setActiveLocale: (locale: string) => void;
    setEnabled: (enabled: boolean) => void;
    setGlobalSuccessMessage: (message: string) => void;
    setRuleMessagesByLocale: Dispatch<
      SetStateAction<
        Record<
          string,
          Record<string, { discountText: string; successMessage: string }>
        >
      >
    >;
    setSuccessMessageByLocale: Dispatch<SetStateAction<Record<string, string>>>;
    successMessageByLocale: Record<string, string>;
  };
  markAsDirty: () => void;
  normalizedRuleMessages: Record<
    string,
    { discountText: string; successMessage: string }
  >;
  styles: Record<string, string>;
  validationErrors?: Record<string, string>;
  onShowVariables: () => void;
}) {
  const {
    activeLocale,
    enabled,
    globalSuccessMessage,
    locales,
    ruleMessagesByLocale,
    setActiveLocale,
    setEnabled,
    setGlobalSuccessMessage,
    setRuleMessagesByLocale,
    setSuccessMessageByLocale,
    successMessageByLocale,
  } = localization;

  return (
    <>
      <div className={styles.displayOptionRow}>
        <s-stack
          direction="inline"
          gap="small"
          alignItems="center"
          justifyContent="space-between"
        >
          <s-stack direction="inline" gap="small" alignItems="center">
            <div className={styles.displayOptionText}>
              <p className={styles.displayOptionTitle}>
                {translateAdmin("tooltips.discountMessaging.title")}
              </p>
              <p className={styles.displayOptionDescription}>
                {translateAdmin(
                  "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountmessagingoptions.editHowDiscountMessagesAppearAboveTheSubtotal"
                )}
              </p>
            </div>
            <QuestionHelpTooltip tooltipKey="discountMessaging" />
            <s-switch
              checked={pricingState.discountMessagingEnabled || undefined}
              onChange={(e) =>
                pricingState.setDiscountMessagingEnabled(
                  (e.target as HTMLInputElement).checked
                )
              }
            />
          </s-stack>
          {locales.length > 0 && (
            <s-checkbox
              label={translateAdmin("adminAttributes.enableMultiLanguage")}
              checked={enabled || undefined}
              disabled={!pricingState.discountMessagingEnabled || undefined}
              onChange={(e) => {
                setEnabled((e.target as HTMLInputElement).checked);
                markAsDirty();
              }}
            />
          )}
        </s-stack>
        {pricingState.discountType === DiscountMethod.BUY_X_GET_Y && (
          <s-paragraph>
            {translateAdmin(
              "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountmessagingoptions.discountMessagingDisplaysTheTotalQuantityToClaimOfferBuyGetToEns"
            )}
          </s-paragraph>
        )}
        <DisabledConfigurationRegion
          disabled={!pricingState.discountMessagingEnabled}
        >
          <div className={styles.nestedDisplayOptions}>
            <s-stack direction="block" gap="small">
              {locales.length > 0 && (
                <DisabledConfigurationRegion disabled={!enabled}>
                  <s-stack direction="block" gap="small-100">
                    <s-select
                      label={translateAdmin("dashboard.language.label")}
                      value={activeLocale}
                      onChange={(e) => {
                        const locale = (e.target as HTMLSelectElement).value;
                        setActiveLocale(locale);
                        const primaryLocale =
                          locales.find((localeOption) => localeOption.primary)
                            ?.locale ?? "en";
                        if (
                          locale !== primaryLocale &&
                          !ruleMessagesByLocale[locale]
                        ) {
                          setRuleMessagesByLocale((prev) => ({
                            ...prev,
                            [locale]: normalizedRuleMessages,
                          }));
                          markAsDirty();
                        }
                      }}
                    >
                      {locales.map((loc) => (
                        <s-option key={loc.locale} value={loc.locale}>
                          {loc.name}
                          {loc.primary ? " (default)" : ""}
                        </s-option>
                      ))}
                    </s-select>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {translateAdmin(
                        "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountmessagingoptions.activeLanguages"
                      )}
                    </p>
                    <s-stack direction="inline" gap="small-100">
                      {locales
                        .filter((localeOption) => localeOption.primary)
                        .map((localeOption) => (
                          <s-chip key={localeOption.locale}>
                            {localeOption.name}
                          </s-chip>
                        ))}
                      {Object.keys(ruleMessagesByLocale)
                        .filter(
                          (locale) =>
                            !locales.find(
                              (localeOption) =>
                                localeOption.locale === locale &&
                                localeOption.primary
                            )
                        )
                        .map((locale) => {
                          const locName =
                            locales.find(
                              (localeOption) => localeOption.locale === locale
                            )?.name ?? locale;
                          return <s-chip key={locale}>{locName}</s-chip>;
                        })}
                    </s-stack>
                  </s-stack>
                </DisabledConfigurationRegion>
              )}
              <div style={{ textAlign: "right" }}>
                <s-button
                  variant="tertiary"
                  icon="code"
                  onClick={onShowVariables}
                >
                  {translateAdmin(
                    "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountmessagingoptions.showVariables"
                  )}
                </s-button>
              </div>
              {pricingState.discountRules.length > 0 ? (
                <s-stack direction="block" gap="small">
                  {pricingState.discountRules.map((rule, index) => {
                    const localeMessages = enabled
                      ? ruleMessagesByLocale[activeLocale]?.[rule.id] ??
                        normalizedRuleMessages[rule.id]
                      : normalizedRuleMessages[rule.id];
                    const defaultDiscountText = getDefaultDiscountRuleText(
                      pricingState.discountType,
                      index
                    );
                    return (
                      <div key={rule.id} className={styles.discountRuleCard}>
                        <s-stack direction="block" gap="small">
                          <h5
                            style={{
                              margin: 0,
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            {translateAdmin("adminDynamic.ruleNumber", {
                              number: index + 1,
                            })}
                          </h5>
                          <s-text-field
                            id={`configure-discount-messages-${rule.id}-discountText`}
                            label={translateAdmin(
                              "adminAttributes.discountText"
                            )}
                            value={
                              localeMessages?.discountText ||
                              defaultDiscountText
                            }
                            error={
                              validationErrors?.[
                                `discount.messages.${rule.id}.discountText`
                              ]
                            }
                            onInput={(e) => {
                              const val = (e.target as HTMLInputElement).value;
                              if (enabled) {
                                setRuleMessagesByLocale((prev) => ({
                                  ...prev,
                                  [activeLocale]: {
                                    ...(prev[activeLocale] || {}),
                                    [rule.id]: {
                                      ...(prev[activeLocale]?.[rule.id] || {}),
                                      discountText: val,
                                    },
                                  },
                                }));
                                markAsDirty();
                              } else {
                                pricingState.updateRuleMessage(
                                  rule.id,
                                  "discountText",
                                  val
                                );
                              }
                            }}
                            autocomplete="off"
                          />
                        </s-stack>
                      </div>
                    );
                  })}
                  <s-section>
                    <s-stack direction="block" gap="small">
                      <s-text-field
                        id="configure-discount-messages-successMessage"
                        label={translateAdmin(
                          "adminExtracted.appBundlesProductPageBundleConfigure.ppbdiscountmessagerulefields.successMessage"
                        )}
                        error={
                          validationErrors?.[
                            "discount.messages.successMessage"
                          ]
                        }
                        value={(() => {
                          const defaultMsg =
                            getDefaultDiscountRuleSuccessMessage(
                              pricingState.discountType
                            );
                          const val = enabled
                            ? successMessageByLocale[activeLocale] ??
                              globalSuccessMessage
                            : globalSuccessMessage;
                          return val || defaultMsg;
                        })()}
                        onInput={(e) => {
                          const val = (e.target as HTMLInputElement).value;
                          if (enabled) {
                            setSuccessMessageByLocale(
                              (prev: Record<string, string>) => ({
                                ...prev,
                                [activeLocale]: val,
                              })
                            );
                          } else {
                            setGlobalSuccessMessage(val);
                          }
                          markAsDirty();
                        }}
                        autocomplete="off"
                      />
                    </s-stack>
                  </s-section>
                </s-stack>
              ) : (
                <s-section>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: "#6d7175",
                      textAlign: "center",
                    }}
                  >
                    {translateAdmin(
                      "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountmessagingoptions.addDiscountRulesToConfigureMessaging"
                    )}
                  </p>
                </s-section>
              )}
            </s-stack>
          </div>
        </DisabledConfigurationRegion>
      </div>
    </>
  );
}
