import {
  BUNDLE_STATUS_OPTIONS,
  BundleStatus,
} from "../../../app/constants/bundle";
import React from "react";
import {flushSync} from "react-dom";
import {createRoot, type Root} from "react-dom/client";
import {JSDOM} from "jsdom";
import {BundleStatusSection} from "../../../app/routes/app/_shared/bundle-configure/BundleStatusSection";
import {FpbBundleCssSettings} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsCss";
import {PpbBundleStatusCard} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleStatusCard";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({t: (key: string) => key}),
}));

jest.mock("../../../app/i18n/config", () => ({
  translateAdmin: (key: string) => key,
}));

describe("BundleStatusSection", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      Event: dom.window.Event,
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
    jest.clearAllMocks();
  });

  const assertSingleVisibleStatusHeading = () => {
    const headings = Array.from(container.querySelectorAll("s-heading")).filter(
      (heading) => heading.textContent === "common.bundleStatus.title",
    );
    const select = container.querySelector("s-select");

    expect(headings).toHaveLength(1);
    expect(headings[0]?.textContent).toBe("common.bundleStatus.title");
    expect(select?.getAttribute("label")).toBe("common.bundleStatus.title");
    expect(select?.getAttribute("labelaccessibilityvisibility")).toBe(
      "exclusive",
    );
  };

  it("renders one visible Polaris heading and an assistive-only select label", () => {
    flushSync(() => {
      root.render(
        React.createElement(BundleStatusSection, {
          status: BundleStatus.ACTIVE,
          onChange: jest.fn(),
        }),
      );
    });

    assertSingleVisibleStatusHeading();
  });

  it.each([
    [
      "FPB",
      () => (
        React.createElement(FpbBundleCssSettings, {
          bundleLevelCss: "",
          bundleLevelCssExpanded: false,
          bundleStatus: BundleStatus.ACTIVE,
          markAsDirty: jest.fn(),
          setBundleLevelCss: jest.fn(),
          setBundleLevelCssExpanded: jest.fn(),
          setBundleStatus: jest.fn(),
        })
      ),
    ],
    [
      "PPB",
      () => (
        React.createElement(PpbBundleStatusCard, {
          status: BundleStatus.ACTIVE,
          onChange: jest.fn(),
        })
      ),
    ],
  ])("keeps the %s wrapper on the shared single-label contract", (_name, view) => {
    flushSync(() => {
      root.render(view());
    });

    assertSingleVisibleStatusHeading();
  });

  it("exposes the canonical status values accepted by bundle status controls", () => {
    const statusValues = BUNDLE_STATUS_OPTIONS.map((option) => option.value);
    expect(statusValues).toEqual([
      BundleStatus.ACTIVE,
      BundleStatus.DRAFT,
      BundleStatus.ARCHIVED,
      BundleStatus.UNLISTED,
    ]);
  });

  it("uses the shared canonical status option sequence in UI order", () => {
    const statusValues = BUNDLE_STATUS_OPTIONS.map((option) => option.value);
    const statusLabels = BUNDLE_STATUS_OPTIONS.map((option) => option.label);

    expect(statusValues).toEqual([
      BundleStatus.ACTIVE,
      BundleStatus.DRAFT,
      BundleStatus.ARCHIVED,
      BundleStatus.UNLISTED,
    ]);
    expect(statusLabels).toEqual([
      "Active",
      "Draft",
      "Archived",
      "Unlisted (Ad Campaigns)",
    ]);
  });
}); 
