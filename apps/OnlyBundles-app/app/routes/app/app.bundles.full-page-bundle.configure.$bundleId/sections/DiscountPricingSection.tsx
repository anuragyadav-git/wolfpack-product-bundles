import type { ComponentProps } from "react";
import { FpbDiscountDisplayOptions } from "./DiscountDisplayOptions";
import { FpbDiscountRulesSection } from "./DiscountPricingRules";

export function DiscountPricingSection({
  activeSection,
  rules,
  displayOptions,
}: {
  activeSection: string;
  rules: ComponentProps<typeof FpbDiscountRulesSection>;
  displayOptions: ComponentProps<typeof FpbDiscountDisplayOptions>;
}) {
  if (activeSection !== "discount_pricing") return null;

  return (
    <div data-tour-target="fpb-discount-pricing">
      <s-stack direction="block" gap="base">
        <FpbDiscountRulesSection {...rules} />
        <FpbDiscountDisplayOptions {...displayOptions} />
      </s-stack>
    </div>
  );
}
