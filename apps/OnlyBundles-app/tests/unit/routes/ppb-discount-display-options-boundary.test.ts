import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  PpbDiscountDisplayOptions,
  type PpbDiscountDisplayOptionsProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountDisplayOptions";
import { DiscountMethod } from "../../../app/types/pricing";

describe("PPB discount display-options boundary", () => {
  it("renders progress enablement from its explicit owner", () => {
    const setProgressBarEnabled = jest.fn();
    const pricingState = {
      discountMessagingEnabled: false,
      discountRules: [],
      discountType: DiscountMethod.BUY_X_GET_Y,
      setDiscountMessagingEnabled: jest.fn(),
    };
    const props = {
      displayOptionsInactive: false,
      messaging: {
        activeDiscountLocale: "en",
        discountMessagingMultiLanguageEnabled: false,
        globalSuccessMessage: "",
        markAsDirty: jest.fn(),
        pricingState,
        ruleMessages: {},
        ruleMessagesByLocale: {},
        setActiveDiscountLocale: jest.fn(),
        setDiscountMessagingMultiLanguageEnabled: jest.fn(),
        setGlobalSuccessMessage: jest.fn(),
        setIsDiscountVariablesModalOpen: jest.fn(),
        setRuleMessagesByLocale: jest.fn(),
        setSuccessMessageByLocale: jest.fn(),
        shopLocales: [],
        successMessageByLocale: {},
        updateRuleMessage: jest.fn(),
      },
      progress: {
        markAsDirty: jest.fn(),
        pricingState,
        progressBarEnabled: false,
        progressBarType: "simple",
        setIsProgressBarMultiLangModalOpen: jest.fn(),
        setProgressBarEnabled,
        setProgressBarType: jest.fn(),
        setTierTextByRuleId: jest.fn(),
        shopLocales: [],
        tierTextByRuleId: {},
      },
      quantity: {
        bundleQuantityOptionsEligible: false,
        markAsDirty: jest.fn(),
        pricingState,
        qtyOptionsDefaultRuleId: null,
        qtyOptionsEnabled: false,
        qtyRuleLabels: {},
        qtyRuleSubtexts: {},
        setIsBundleQuantityMultiLangModalOpen: jest.fn(),
        setQtyOptionsDefaultRuleId: jest.fn(),
        setQtyOptionsEnabled: jest.fn(),
        setQtyRuleLabels: jest.fn(),
        setQtyRuleSubtexts: jest.fn(),
        shopLocales: [],
      },
    } as unknown as PpbDiscountDisplayOptionsProps;

    const view = renderToStaticMarkup(
      React.createElement(PpbDiscountDisplayOptions, props),
    );

    expect(view).toContain("<s-switch");
    expect(view).toContain("Progress bar");
  });
});
