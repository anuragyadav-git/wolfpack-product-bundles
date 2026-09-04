import { ProductPageConfigLifecycleMethods } from "../../../app/assets/widgets/product-page/methods/config-lifecycle-methods";
import { JSDOM } from "jsdom";

describe("PPB loadBundleData and draft preview", () => {
  let originalWindow: any;
  let originalDocument: any;
  let originalFetch: any;

  beforeEach(() => {
    originalWindow = global.window;
    originalDocument = global.document;
    originalFetch = global.fetch;

    const dom = new JSDOM("<!doctype html><html><body></body></html>", {
      url: "https://shop.test/products/pdp-test",
    });
    global.window = dom.window as any;
    global.document = dom.window.document;
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
    global.fetch = originalFetch;
  });

  function createLifecycleWidget(containerAttrs: Record<string, string> = {}, locationSearch = "") {
    if (locationSearch) {
      const url = `https://shop.test/products/pdp-test${locationSearch}`;
      const dom = new JSDOM("<!doctype html><html><body></body></html>", { url });
      global.window = dom.window as any;
      global.document = dom.window.document;
    }

    const container = document.createElement("div");
    container.id = "bundle-builder-app";
    Object.entries(containerAttrs).forEach(([k, v]) => {
      container.setAttribute(k, v);
    });
    document.body.appendChild(container);

    const widget: any = {
      container,
      config: {},
      bundleData: null,
      selectedBundle: null,
      ...ProductPageConfigLifecycleMethods,
    };
    if (global.window && !global.window.fetch) {
      global.window.fetch = global.fetch;
    }
    widget.parseConfiguration();
    return widget;
  }

  it("fetches bundle config via app proxy when wpb_preview is present in URL search", async () => {
    const previewToken = "signed-preview-token-123";
    const draftBundle = {
      id: "cmtlug3d80002m346donu6cnq",
      name: "PDP test",
      status: "draft",
      bundleType: "product_page",
      steps: [
        { id: "step-1", name: "Step 1", categories: [] },
      ],
    };

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, bundle: draftBundle }),
    });
    global.fetch = mockFetch;

    const widget = createLifecycleWidget(
      {
        "data-bundle-id": "cmtlug3d80002m346donu6cnq",
        "data-bundle-type": "product_page",
        "data-bundle-config": JSON.stringify({
          v: 2,
          type: "product_page",
          bundleType: "product_page",
          id: "cmtlug3d80002m346donu6cnq",
        }),
      },
      `?wpb_preview=${previewToken}`,
    );

    await widget.loadBundleData();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const requestedUrl = mockFetch.mock.calls[0][0];
    expect(requestedUrl).toContain("/apps/product-bundles/api/bundle/cmtlug3d80002m346donu6cnq.json");
    expect(requestedUrl).toContain(`wpb_preview=${previewToken}`);

    expect(widget.bundleData).toEqual({
      [draftBundle.id]: draftBundle,
    });
    expect(widget.config.bundleId).toBe(draftBundle.id);

    widget.selectBundle();
    expect(widget.selectedBundle).toBeTruthy();
    expect(widget.selectedBundle.id).toBe(draftBundle.id);
  });

  it("does not call fetch and fails closed on public URL when schema-v3 snapshot is missing", async () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    const widget = createLifecycleWidget({
      "data-bundle-id": "bundle-public-1",
      "data-bundle-type": "product_page",
      "data-bundle-config": JSON.stringify({
        v: 2,
        type: "product_page",
        id: "bundle-public-1",
      }),
    });

    await widget.loadBundleData();

    expect(mockFetch).not.toHaveBeenCalled();
    expect(widget.bundleData).toBeNull();
    expect(widget.container.style.display).toBe("none");
  });

  it("loads Shopify-hosted snapshot directly without fetch when snapshot is valid and no preview token exists", async () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    const validSnapshot = {
      schemaVersion: 3,
      bundleType: "product_page",
      id: "snapshot-bundle-1",
      name: "Snapshot Bundle",
      status: "active",
      steps: [{ id: "step-1", name: "Step 1" }],
      runtimeAuthorization: { version: 2 },
    };

    const widget = createLifecycleWidget({
      "data-bundle-id": "snapshot-bundle-1",
      "data-bundle-type": "product_page",
      "data-bundle-config": JSON.stringify(validSnapshot),
    });

    await widget.loadBundleData();

    expect(mockFetch).not.toHaveBeenCalled();
    expect(widget.bundleData).toEqual({
      [validSnapshot.id]: validSnapshot,
    });
  });

  it("defaults template type to PDP_MODAL when bundleDesignTemplate is not set", () => {
    const widget: any = {
      selectedBundle: {
        bundleDesignTemplate: null,
      },
      ...ProductPageConfigLifecycleMethods,
    };

    expect(widget._getProductPageTemplateType()).toBe("PDP_MODAL");
  });

  it("resolves default template contract to HORIZONTAL_SLOTS for unconfigured PDP_MODAL", () => {
    const widget: any = {
      selectedBundle: {
        bundleDesignTemplate: null,
        bundleDesignPresetId: null,
      },
      ...ProductPageConfigLifecycleMethods,
    };

    const contract = widget._getProductPageTemplateContract();
    expect(contract).toEqual(
      expect.objectContaining({
        id: "HORIZONTAL_SLOTS",
        templateType: "PDP_MODAL",
      }),
    );
  });
});
