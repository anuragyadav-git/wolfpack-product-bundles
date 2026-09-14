import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  PpbDiscountLanguageModals,
  type PpbDiscountLanguageModalsProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountLanguageModals";

const mockPricingTranslationModals =
  jest.fn<unknown, [Record<string, unknown>]>(() => null);

jest.mock(
  "../../../app/routes/app/_shared/bundle-configure/PricingTranslationModals",
  () => ({
    PricingTranslationModals: (props: Record<string, unknown>) =>
      mockPricingTranslationModals(props),
  }),
);
describe("PPB discount translation modal boundary", () => {
  it("applies localized quantity copy through explicit owners", () => {
    const markAsDirty = jest.fn();
    const setQtyRuleTextsByLocaleByRuleId = jest.fn();
    const props = {
      activeBundleQuantityLocale: "fr",
      activeProgressBarLocale: "fr",
      isBundleQuantityMultiLangModalOpen: true,
      isProgressBarMultiLangModalOpen: false,
      markAsDirty,
      pricingState: {
        discountRules: [{ id: "rule-1", conditionValue: 3 }],
      },
      qtyRuleLabels: { "rule-1": "Boite de 3" },
      qtyRuleSubtexts: { "rule-1": "Economisez" },
      qtyRuleTextsByLocaleByRuleId: {},
      setActiveBundleQuantityLocale: jest.fn(),
      setActiveProgressBarLocale: jest.fn(),
      setIsBundleQuantityMultiLangModalOpen: jest.fn(),
      setIsProgressBarMultiLangModalOpen: jest.fn(),
      setQtyRuleTextsByLocaleByRuleId,
      setTierTextByLocaleByRuleId: jest.fn(),
      shopLocales: [{ locale: "fr", name: "French", primary: true }],
      tierTextByLocaleByRuleId: {},
      tierTextByRuleId: {},
    } as unknown as PpbDiscountLanguageModalsProps;

    renderToStaticMarkup(
      React.createElement(PpbDiscountLanguageModals, props),
    );
    const modalProps = mockPricingTranslationModals.mock.calls[0]?.[0] as {
      quantity: {
        onApply: (values: Record<string, unknown>) => void;
      };
    };
    const values = { fr: { "rule-1": { label: "Boite", subtext: "" } } };
    modalProps.quantity.onApply(values);

    expect(setQtyRuleTextsByLocaleByRuleId).toHaveBeenCalledWith(values);
    expect(markAsDirty).toHaveBeenCalledTimes(1);
  });
});
