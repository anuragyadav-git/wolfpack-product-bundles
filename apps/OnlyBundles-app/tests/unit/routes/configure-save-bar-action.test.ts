import React from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";
import { BundleStatus } from "../../../app/constants/bundle";
import { DiscountMethod } from "../../../app/types/pricing";
import {
  PpbSaveForm,
  type PpbSaveFormProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSaveForm";

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

function makeSaveFormProps(
  overrides: Partial<PpbSaveFormProps> = {},
): PpbSaveFormProps {
  return {
    bundleProduct: null,
    conditionsState: { stepConditions: {} },
    discountMessagingMultiLanguageEnabled: false,
    fetcher: { state: "idle" },
    formState: {
      bundleName: "QA bundle",
      bundleDescription: "",
      templateName: "classic",
      bundleStatus: BundleStatus.DRAFT,
    },
    handleSave: jest.fn(() => Promise.resolve()),
    isDirty: true,
    pricingState: {
      discountEnabled: false,
      discountType: DiscountMethod.PERCENTAGE_OFF,
      discountRules: [],
      showFooter: false,
      discountMessagingEnabled: false,
    },
    progressBarEnabled: false,
    progressBarProgressText: "",
    progressBarSuccessText: "",
    progressBarType: "simple",
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
    ...overrides,
  };
}

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
    showSaveBar.mockClear();
    hideSaveBar.mockClear();
  });

  it("shows the programmatic Save Bar and calls handleSave", () => {
    const handleSave = jest.fn(() => Promise.resolve());
    const props = makeSaveFormProps({ handleSave });

    flushSync(() => {
      root.render(React.createElement(PpbSaveForm, props));
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

  it("keeps the Save Bar open and gives Save its native loading state while submitting", () => {
    const props = makeSaveFormProps({ fetcher: { state: "submitting" } });

    flushSync(() => {
      root.render(React.createElement(PpbSaveForm, props));
    });

    const saveButton = Array.from(document.body.querySelectorAll("button"))
      .find((button) => button.textContent === "Save");
    const discardButton = Array.from(document.body.querySelectorAll("button"))
      .find((button) => button.textContent === "Discard");

    expect(showSaveBar).toHaveBeenCalledWith("bundle-save-bar");
    expect(hideSaveBar).not.toHaveBeenCalled();
    expect(saveButton?.getAttribute("loading")).toBe("true");
    expect(saveButton?.disabled).toBe(true);
    expect(discardButton?.disabled).toBe(true);
  });

  it("hides a previously shown Save Bar when the draft becomes clean", () => {
    const props = makeSaveFormProps();

    flushSync(() => {
      root.render(React.createElement(PpbSaveForm, props));
    });
    expect(showSaveBar).toHaveBeenCalledWith("bundle-save-bar");

    props.isDirty = false;
    flushSync(() => {
      root.render(React.createElement(PpbSaveForm, props));
    });

    expect(hideSaveBar).toHaveBeenCalledWith("bundle-save-bar");
  });

  it("hides a shown Save Bar when the configure editor unmounts", () => {
    const props = makeSaveFormProps();

    flushSync(() => {
      root.render(React.createElement(PpbSaveForm, props));
    });
    expect(showSaveBar).toHaveBeenCalledWith("bundle-save-bar");

    flushSync(() => root.unmount());

    expect(hideSaveBar).toHaveBeenCalledWith("bundle-save-bar");
    root = createRoot(container);
  });
});
