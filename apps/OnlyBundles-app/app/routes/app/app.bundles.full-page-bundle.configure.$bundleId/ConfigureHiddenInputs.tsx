import type { BundleStatus } from "../../../constants/bundle";
import type {
  NormalizedPricingDisplayOptions,
  serializePricingDisplayOptions,
} from "../../../lib/pricing-display-options";
import type {
  DiscountMethod,
  PricingRule,
  PricingRuleTierText,
} from "../../../types/pricing";
import { serializeFpbSaveSteps } from "./fpb-save-transport";

interface ConfigureHiddenInputsProps {
  bundleDescription: string;
  bundleName: string;
  bundleProduct: unknown;
  bundleStatus: BundleStatus;
  conditions: Record<string, unknown[]>;
  discountMessagingMultiLanguageEnabled: boolean;
  normalizedPricingDisplayOptions: NormalizedPricingDisplayOptions;
  normalizedRuleMessages: Record<string, unknown>;
  pricing: {
    discountEnabled: boolean;
    discountMessagingEnabled: boolean;
    discountRules: PricingRule[];
    discountType: DiscountMethod;
    showDiscountProgressBar: boolean;
    showFooter: boolean;
  };
  ruleMessagesByLocale: Record<string, unknown>;
  selectedCollections: Record<string, unknown[]>;
  serializePricingDisplayOptions: typeof serializePricingDisplayOptions;
  steps: unknown[];
  templateName: string;
  tierTextByLocaleByRuleId: Record<
    string,
    Record<string, PricingRuleTierText>
  >;
  tierTextByRuleId: Record<string, PricingRuleTierText>;
}

export function ConfigureHiddenInputs({
  bundleDescription,
  bundleName,
  bundleProduct,
  bundleStatus,
  conditions,
  discountMessagingMultiLanguageEnabled,
  normalizedPricingDisplayOptions,
  normalizedRuleMessages,
  pricing,
  ruleMessagesByLocale,
  selectedCollections,
  serializePricingDisplayOptions,
  steps,
  templateName,
  tierTextByLocaleByRuleId,
  tierTextByRuleId,
}: ConfigureHiddenInputsProps) {

  return (
    <>
      <input type="hidden" name="bundleName" value={bundleName} />
      <input
        type="hidden"
        name="bundleDescription"
        value={bundleDescription}
      />
      <input type="hidden" name="templateName" value={templateName} />
      <input type="hidden" name="bundleStatus" value={bundleStatus} />
      <input
        type="hidden"
        name="bundleProduct"
        value={JSON.stringify(bundleProduct)}
      />
      <input
        type="hidden"
        name="stepsData"
        value={JSON.stringify(
          serializeFpbSaveSteps(steps, selectedCollections)
        )}
      />
      <input
        type="hidden"
        name="discountData"
        value={JSON.stringify({
          discountEnabled: pricing.discountEnabled,
          discountType: pricing.discountType,
          discountRules: pricing.discountRules,
          showFooter: pricing.showFooter,
          showDiscountProgressBar: pricing.showDiscountProgressBar,
          discountMessagingEnabled: pricing.discountMessagingEnabled,
          ruleMessages: normalizedRuleMessages,
          pricingDisplayOptions: serializePricingDisplayOptions({
            options: normalizedPricingDisplayOptions,
          }),
          discountMessagingMultiLanguageEnabled,
          ruleMessagesByLocale: discountMessagingMultiLanguageEnabled
            ? ruleMessagesByLocale
            : null,
          tierTextByRuleId:
            Object.keys(tierTextByRuleId).length > 0 ? tierTextByRuleId : null,
          tierTextByLocaleByRuleId:
            Object.keys(tierTextByLocaleByRuleId).length > 0
              ? tierTextByLocaleByRuleId
              : null,
        })}
      />
      <input
        type="hidden"
        name="stepConditions"
        value={JSON.stringify(conditions)}
      />
    </>
  );
}
