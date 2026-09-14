import {
  PpbDiscountDisplayOptions,
  type PpbDiscountDisplayOptionsProps,
} from "./PpbDiscountDisplayOptions";
import {
  PpbDiscountRulesPanel,
  type PpbDiscountRulesPanelProps,
} from "./PpbDiscountRulesPanel";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export type PpbDiscountPricingSectionProps = {
  activeSection: PpbConfigureFlow["activeSection"];
  display: PpbDiscountDisplayOptionsProps;
  rules: PpbDiscountRulesPanelProps;
};

export function PpbDiscountPricingSection({
  activeSection,
  display,
  rules,
}: PpbDiscountPricingSectionProps) {

  if (activeSection !== "discount_pricing") {
    return null;
  }

  return (
    <div data-tour-target="ppb-discount-pricing">
      <s-stack direction="block" gap="base">
        <PpbDiscountRulesPanel {...rules} />
        <PpbDiscountDisplayOptions {...display} />
      </s-stack>
    </div>
  );
}
