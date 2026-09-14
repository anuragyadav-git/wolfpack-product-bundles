import React from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";

import { useConfigureAddonActionHandlers } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureAddonActionHandlers";
import { useConfigureVisibilityActionHandlers } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureVisibilityActionHandlers";

const resourcePicker = jest.fn();

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: () => ({ resourcePicker }),
}));

describe("useConfigureAddonActionHandlers", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", {
      url: "https://admin.shopify.com",
    });
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
    jest.clearAllMocks();
  });

  it("uses the directly owned App Bridge resource picker", async () => {
    const updateAddonDraft = jest.fn();
    let handlers:
      | ReturnType<typeof useConfigureAddonActionHandlers>
      | undefined;

    function Harness() {
      handlers = useConfigureAddonActionHandlers({
        addonDraft: {
          addonTiers: [{ selectedAddonProducts: [] }],
        },
        addonSelectedProductsModalRef: { current: null },
        setAddonSelectedProductsTierIndex: jest.fn(),
        setIsAddonSelectedProductsModalOpen: jest.fn(),
        setIsDisableAddonStepModalOpen: jest.fn(),
        updateAddonDraft,
      } as never);
      return null;
    }

    resourcePicker.mockResolvedValue([
      {
        id: "gid://shopify/Product/10",
        title: "Add-on",
        variants: [{ id: "gid://shopify/ProductVariant/20" }],
      },
    ]);
    flushSync(() => root.render(React.createElement(Harness)));

    await handlers?.handleAddonSelectedProductAdd(0);

    expect(resourcePicker).toHaveBeenCalledWith({
      multiple: true,
      selectionIds: [],
      type: "product",
    });
    expect(updateAddonDraft).toHaveBeenCalledWith({
      addonTiers: [
        expect.objectContaining({
          selectedAddonProducts: [
            expect.objectContaining({
              graphqlId: "gid://shopify/Product/10",
            }),
          ],
        }),
      ],
    });
  });

  it("uses the directly owned App Bridge picker for visibility targets", async () => {
    const markAsDirty = jest.fn();
    const setUpsellWidgetSelectedProducts = jest.fn();
    const setUpsellWidgetSpecificProductPages = jest.fn();
    let handlers:
      | ReturnType<typeof useConfigureVisibilityActionHandlers>
      | undefined;

    function Harness() {
      handlers = useConfigureVisibilityActionHandlers({
        markAsDirty,
        setUpsellWidgetCollectionsSelectedData: jest.fn(),
        setUpsellWidgetSelectedProducts,
        setUpsellWidgetSpecificCollectionPages: jest.fn(),
        setUpsellWidgetSpecificProductPages,
        upsellWidgetCollectionsSelectedData: [],
        upsellWidgetSelectedProducts: [],
      } as never);
      return null;
    }

    resourcePicker.mockResolvedValue([
      {
        id: "gid://shopify/Product/11",
        title: "Visible product",
      },
    ]);
    flushSync(() => root.render(React.createElement(Harness)));

    await handlers?.openVisibilityProductPicker("widget");

    expect(resourcePicker).toHaveBeenCalledWith({
      action: "select",
      multiple: true,
      selectionIds: [],
      type: "product",
    });
    expect(setUpsellWidgetSelectedProducts).toHaveBeenCalledTimes(1);
    expect(setUpsellWidgetSpecificProductPages).toHaveBeenCalledTimes(1);
    expect(markAsDirty).toHaveBeenCalledTimes(1);
  });
});
