import React from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";
import { PpbSaveForm } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSaveForm";

const mockUsePpbConfigureContext = jest.fn();
const showSaveBar = jest.fn(() => Promise.resolve());
const hideSaveBar = jest.fn(() => Promise.resolve());

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: () => ({
    saveBar: {
      show: showSaveBar,
      hide: hideSaveBar,
    },
  }),
}));

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbConfigureContext",
  () => ({
    usePpbConfigureContext: () => mockUsePpbConfigureContext(),
  }),
);

describe("configure Save Bar actions", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      Event: dom.window.Event,
      MouseEvent: dom.window.MouseEvent,
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    flushSync(() => root.unmount());
    mockUsePpbConfigureContext.mockReset();
    showSaveBar.mockClear();
    hideSaveBar.mockClear();
  });

  it("shows the programmatic Save Bar and calls handleSave", () => {
    const handleSave = jest.fn(() => Promise.resolve());
    mockUsePpbConfigureContext.mockReturnValue({
      bundleProduct: null,
      conditionsState: { stepConditions: [] },
      discountMessagingMultiLanguageEnabled: false,
      fetcher: { state: "idle" },
      formState: {
        bundleName: "QA bundle",
        bundleDescription: "",
        templateName: "classic",
        bundleStatus: "draft",
      },
      handleSave,
      isDirty: true,
      pricingState: {
        discountEnabled: false,
        discountType: "none",
        discountRules: [],
        showFooter: false,
        discountMessagingEnabled: false,
      },
      progressBarEnabled: false,
      progressBarProgressText: "",
      progressBarSuccessText: "",
      progressBarType: "quantity",
      qtyOptionsDefaultRuleId: null,
      qtyOptionsEnabled: false,
      qtyRuleLabels: {},
      qtyRuleSubtexts: {},
      qtyRuleTextsByLocaleByRuleId: {},
      ruleMessages: {},
      ruleMessagesByLocale: {},
      saveBarRef: { current: null },
      setShowDiscardModal: jest.fn(),
      stepsState: { steps: [] },
      tierTextByLocaleByRuleId: {},
      tierTextByRuleId: {},
    });

    flushSync(() => {
      root.render(React.createElement(PpbSaveForm));
    });

    expect(showSaveBar).toHaveBeenCalledWith("bundle-save-bar");
    expect(hideSaveBar).not.toHaveBeenCalled();

    const saveButton = Array.from(document.body.querySelectorAll("button"))
      .find((button) => button.textContent === "Save");
    expect(saveButton).toBeDefined();

    flushSync(() => {
      saveButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(handleSave).toHaveBeenCalledTimes(1);
  });

  it("hides a previously shown Save Bar when the draft becomes clean", () => {
    const context = {
      bundleProduct: null,
      conditionsState: { stepConditions: [] },
      discountMessagingMultiLanguageEnabled: false,
      fetcher: { state: "idle" },
      formState: {
        bundleName: "QA bundle",
        bundleDescription: "",
        templateName: "classic",
        bundleStatus: "draft",
      },
      handleSave: jest.fn(() => Promise.resolve()),
      isDirty: true,
      pricingState: {
        discountEnabled: false,
        discountType: "none",
        discountRules: [],
        showFooter: false,
        discountMessagingEnabled: false,
      },
      progressBarEnabled: false,
      progressBarProgressText: "",
      progressBarSuccessText: "",
      progressBarType: "quantity",
      qtyOptionsDefaultRuleId: null,
      qtyOptionsEnabled: false,
      qtyRuleLabels: {},
      qtyRuleSubtexts: {},
      qtyRuleTextsByLocaleByRuleId: {},
      ruleMessages: {},
      ruleMessagesByLocale: {},
      saveBarRef: { current: null },
      setShowDiscardModal: jest.fn(),
      stepsState: { steps: [] },
      tierTextByLocaleByRuleId: {},
      tierTextByRuleId: {},
    };
    mockUsePpbConfigureContext.mockImplementation(() => context);

    flushSync(() => {
      root.render(React.createElement(PpbSaveForm));
    });
    expect(showSaveBar).toHaveBeenCalledWith("bundle-save-bar");

    context.isDirty = false;
    flushSync(() => {
      root.render(React.createElement(PpbSaveForm));
    });

    expect(hideSaveBar).toHaveBeenCalledWith("bundle-save-bar");
  });
});
