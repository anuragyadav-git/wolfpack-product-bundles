import { translateAdmin } from "~/i18n/config";
import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";
import {
  getDefaultDiscountRuleSuccessMessage,
  getDefaultDiscountRuleText,
} from "../../../lib/pricing-display-options";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export type PpbDiscountMessageRuleFieldsProps = Pick<
  PpbConfigureFlow,
  | "activeDiscountLocale"
  | "discountMessagingMultiLanguageEnabled"
  | "globalSuccessMessage"
  | "markAsDirty"
  | "pricingState"
  | "ruleMessages"
  | "ruleMessagesByLocale"
  | "setGlobalSuccessMessage"
  | "setRuleMessagesByLocale"
  | "setSuccessMessageByLocale"
  | "successMessageByLocale"
  | "updateRuleMessage"
>;

export function PpbDiscountMessageRuleFields({
  activeDiscountLocale,
  discountMessagingMultiLanguageEnabled,
  globalSuccessMessage,
  markAsDirty,
  pricingState,
  ruleMessages,
  ruleMessagesByLocale,
  setGlobalSuccessMessage,
  setRuleMessagesByLocale,
  setSuccessMessageByLocale,
  successMessageByLocale,
  updateRuleMessage,
}: PpbDiscountMessageRuleFieldsProps) {

  if (pricingState.discountRules.length === 0) {
    return (
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
    );
  }

  return (
    <s-stack direction="block" gap="small">
      {pricingState.discountRules.map((rule, index) => {
        const localeMessages = discountMessagingMultiLanguageEnabled
          ? ruleMessagesByLocale[activeDiscountLocale]?.[rule.id] ??
            ruleMessages[rule.id]
          : ruleMessages[rule.id];
        const defaultDiscountText = getDefaultDiscountRuleText(
          pricingState.discountType,
          index
        );

        return (
          <div
            key={rule.id}
            className={productPageBundleStyles.discountRuleCard}
          >
            <s-stack direction="block" gap="small">
              <h5 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                {translateAdmin("adminDynamic.ruleNumber", {
                  number: index + 1,
                })}
              </h5>
              <s-text-field
                label={translateAdmin("adminAttributes.discountText")}
                value={localeMessages?.discountText || defaultDiscountText}
                onInput={(e) => {
                  const value = (e.target as HTMLInputElement).value;
                  if (discountMessagingMultiLanguageEnabled) {
                    setRuleMessagesByLocale(
                      (prev: typeof ruleMessagesByLocale) => ({
                        ...prev,
                        [activeDiscountLocale]: {
                          ...(prev[activeDiscountLocale] || {}),
                          [rule.id]: {
                            ...(prev[activeDiscountLocale]?.[rule.id] || {}),
                            discountText: value,
                          },
                        },
                      })
                    );
                    markAsDirty();
                  } else {
                    updateRuleMessage(rule.id, "discountText", value);
                  }
                }}
                autocomplete="off"
              />
            </s-stack>
          </div>
        );
      })}
      <div className={productPageBundleStyles.discountRuleCard}>
        <s-stack direction="block" gap="small">
          <h5 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
            {translateAdmin(
              "adminExtracted.appBundlesProductPageBundleConfigure.ppbdiscountmessagerulefields.successMessage"
            )}
          </h5>
          <s-text-field
            label={translateAdmin(
              "adminExtracted.appBundlesProductPageBundleConfigure.ppbdiscountmessagerulefields.successMessage"
            )}
            value={(() => {
              const defaultMessage = getDefaultDiscountRuleSuccessMessage(
                pricingState.discountType
              );
              const value = discountMessagingMultiLanguageEnabled
                ? successMessageByLocale[activeDiscountLocale] ??
                  globalSuccessMessage
                : globalSuccessMessage;
              return value || defaultMessage;
            })()}
            onInput={(e) => {
              const value = (e.target as HTMLInputElement).value;
              if (discountMessagingMultiLanguageEnabled) {
                setSuccessMessageByLocale((prev: Record<string, string>) => ({
                  ...prev,
                  [activeDiscountLocale]: value,
                }));
              } else {
                setGlobalSuccessMessage(value);
              }
              markAsDirty();
            }}
            autocomplete="off"
          />
        </s-stack>
      </div>
    </s-stack>
  );
}
