import type { ComponentProps } from "react";
import { FpbAddonFooterMessaging } from "./FreeGiftAddonFooterMessaging";
import { FpbAddonProductsCard } from "./FreeGiftAddonProductsCard";
import { FpbAddonReferenceStepCard } from "./FreeGiftAddonReferenceStepCard";

export function FreeGiftAddonsSection({
  activeSection,
  referenceStep,
  products,
  footerMessaging,
}: {
  activeSection: string;
  referenceStep: ComponentProps<typeof FpbAddonReferenceStepCard>;
  products: ComponentProps<typeof FpbAddonProductsCard>;
  footerMessaging: ComponentProps<typeof FpbAddonFooterMessaging>;
}) {
  if (activeSection !== "free_gift_addons") return null;

  return (
    <div data-tour-target="fpb-free-gift-addons">
      <s-stack direction="block" gap="small-100">
        <FpbAddonReferenceStepCard {...referenceStep} />
        <FpbAddonProductsCard {...products} />
        <FpbAddonFooterMessaging {...footerMessaging} />
      </s-stack>
    </div>
  );
}
