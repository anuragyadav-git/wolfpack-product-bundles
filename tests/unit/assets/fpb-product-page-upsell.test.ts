import {
  initializeFpbProductPageUpsells,
  resolveCurrentVariantId,
  restoreFpbUpsellBusyState,
} from "../../../app/storefront/fpb-product-page-upsell";

describe("FPB product-page upsell runtime behavior", () => {
  it("reads the current product-form variant when the shopper changes it", () => {
    const selectedVariant = { value: "222" };
    const form = {
      hidden: false,
      getAttribute: () => null,
      querySelector: () => selectedVariant,
    };
    const root = {
      querySelectorAll: () => [form],
    };
    const previousWindow = global.window;
    global.window = {
      getComputedStyle: () => ({ display: "block", visibility: "visible" }),
    } as unknown as Window & typeof globalThis;

    try {
      expect(resolveCurrentVariantId({
        productId: "111",
        productHandle: "test-product",
        collectionIds: [],
        locale: "en",
        endpointUrl: "/apps/product-bundles/api/fpb-upsells.json",
        selectedVariantId: "111",
      }, root as unknown as ParentNode)).toBe("222");
    } finally {
      global.window = previousWindow;
    }
  });

  it("restores disabled busy CTAs after browser history navigation", () => {
    const button = {
      dataset: { label: "Build bundle" },
      disabled: true,
      textContent: "",
      removeAttribute: jest.fn(),
    };
    const root = { querySelectorAll: () => [button] };

    restoreFpbUpsellBusyState(root as unknown as ParentNode);

    expect(button.disabled).toBe(false);
    expect(button.removeAttribute).toHaveBeenCalledWith("aria-busy");
    expect(button.textContent).toContain("Build bundle");
  });

  it("reuses fetched offers when Shopify replaces the product section", async () => {
    const makeElement = () => {
      const element: Record<string, unknown> = {
        dataset: {},
        children: [] as unknown[],
        hidden: false,
        className: "",
        append(child: unknown) {
          (this.children as unknown[]).push(child);
          if ((child as { dataset?: Record<string, string> }).dataset?.wpbFpbUpsellRoot === "true") {
            this.rendered = child;
          }
        },
        addEventListener: jest.fn(),
        getAttribute: () => null,
        setAttribute: jest.fn(),
        replaceChildren: jest.fn(),
        querySelector(selector: string) {
          return selector === "[data-wpb-fpb-upsell-root]" ? this.rendered ?? null : null;
        },
      };
      return element;
    };
    const makeRoot = () => {
      const form = makeElement();
      const root: Record<string, unknown> = {
        automaticAnchor: null,
        querySelector(selector: string) {
          if (selector === "[data-wpb-fpb-upsell-auto-anchor]") return this.automaticAnchor;
          return null;
        },
        querySelectorAll(selector: string) {
          if (selector === "[data-wpb-fpb-upsell-anchor]") return [];
          if (selector === 'form[action*="/cart/add"]') return [form];
          return [];
        },
      };
      form.after = (anchor: unknown) => {
        root.automaticAnchor = anchor;
      };
      return root;
    };
    const embed = makeElement() as unknown as HTMLElement;
    Object.assign(embed.dataset, {
      productId: "111",
      productHandle: "test-product",
      collectionIds: "222",
      locale: "en",
      fpbUpsellsEndpoint: "/apps/product-bundles/api/fpb-upsells.json",
      selectedVariantId: "333",
    });
    const firstRoot = makeRoot();
    const replacementRoot = makeRoot();
    const previousDocument = global.document;
    const previousWindow = global.window;
    const previousFetch = global.fetch;
    global.document = {
      createElement: () => makeElement(),
      documentElement: makeElement(),
    } as unknown as Document;
    global.window = {
      getComputedStyle: () => ({ display: "block", visibility: "visible" }),
      location: { origin: "https://example.myshopify.com" },
      setTimeout: jest.fn(),
    } as unknown as Window & typeof globalThis;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        offers: [{
          bundleId: "bundle-1",
          publicNumber: 1,
          bundleName: "Bundle",
          targetPath: "/apps/product-bundles/wpb/1",
          mode: "button",
          copy: { title: "", description: "", buttonText: "Build bundle" },
          imageUrl: null,
          preselectBrowsedProduct: false,
        }],
      }),
    }) as jest.Mock;

    try {
      await initializeFpbProductPageUpsells(embed, firstRoot as unknown as ParentNode);
      await initializeFpbProductPageUpsells(embed, replacementRoot as unknown as ParentNode);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect((replacementRoot.automaticAnchor as { rendered?: unknown }).rendered).toBeTruthy();
    } finally {
      global.document = previousDocument;
      global.window = previousWindow;
      global.fetch = previousFetch;
    }
  });
});
