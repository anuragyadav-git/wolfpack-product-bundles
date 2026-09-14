import React from "react";
import {flushSync} from "react-dom";
import {createRoot, type Root} from "react-dom/client";
import {JSDOM} from "jsdom";

import {ConfigureHiddenInputs} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureHiddenInputs";

describe("ConfigureHiddenInputs", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      HTMLElement: dom.window.HTMLElement,
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    flushSync(() => root.unmount());
    container.remove();
  });

  it("serializes the current route-owned save values", () => {
    flushSync(() => {
      root.render(
        React.createElement(ConfigureHiddenInputs, {
          bundleDescription: "Build a box",
          bundleName: "Starter box",
          bundleProduct: {id: "gid://shopify/Product/1"},
          bundleStatus: "active",
          conditions: {"step-1": {operator: "eq", value: 2}},
          discountMessagingMultiLanguageEnabled: false,
          normalizedPricingDisplayOptions: {},
          normalizedRuleMessages: {"rule-1": {successMessage: "Unlocked"}},
          pricing: {
            discountEnabled: true,
            discountMessagingEnabled: true,
            discountRules: [{id: "rule-1"}],
            discountType: "percentage",
            showDiscountProgressBar: true,
            showFooter: true,
          },
          ruleMessagesByLocale: {},
          selectedCollections: {},
          serializePricingDisplayOptions: () => ({displayOptions: {}}),
          steps: [{id: "step-1", products: []}],
          templateName: "STANDARD",
          tierTextByLocaleByRuleId: {},
          tierTextByRuleId: {},
        } as any),
      );
    });

    const values = Object.fromEntries(
      Array.from(container.querySelectorAll<HTMLInputElement>("input")).map(
        (input) => [input.name, input.value],
      ),
    );

    expect(values).toMatchObject({
      bundleDescription: "Build a box",
      bundleName: "Starter box",
      bundleStatus: "active",
      templateName: "STANDARD",
    });
    expect(JSON.parse(values.bundleProduct)).toEqual({
      id: "gid://shopify/Product/1",
    });
    expect(JSON.parse(values.stepConditions)).toEqual({
      "step-1": {operator: "eq", value: 2},
    });
    expect(JSON.parse(values.discountData)).toMatchObject({
      discountEnabled: true,
      discountMessagingEnabled: true,
      discountType: "percentage",
      showDiscountProgressBar: true,
      showFooter: true,
    });
  });
});
