import {
  applyBrowsedProductPreselection,
  findPpbBundleEmbedMount,
  shouldInitializePpbBundleEmbed,
} from "../../../app/storefront/ppb-bundle-embed";

describe("PPB bundle embed storefront behavior", () => {
  const visibleWindow = { getComputedStyle: () => ({ display: "block", visibility: "visible", opacity: "1" }) };

  it("prefers the first visible custom anchor over the primary visible Add to Cart control", () => {
    const custom = { hidden: false, getAttribute: () => null };
    const button = { hidden: false, disabled: false, getAttribute: () => null };
    const root = { querySelectorAll: (selector: string) => selector === "[data-wpb-ppb-embed-anchor]" ? [custom] : selector.includes("button") ? [button] : [] };
    const previousWindow = global.window;
    global.window = visibleWindow as unknown as Window & typeof globalThis;
    try {
      expect(findPpbBundleEmbedMount(root as unknown as ParentNode)).toEqual({ kind: "custom", element: custom });
    } finally { global.window = previousWindow; }
  });

  it("falls back to mounting immediately before the primary visible Add to Cart control", () => {
    const button = { hidden: false, disabled: false, getAttribute: () => null };
    const root = { querySelectorAll: (selector: string) => selector === "[data-wpb-ppb-embed-anchor]" ? [] : selector.includes("button") ? [button] : [] };
    const previousWindow = global.window;
    global.window = visibleWindow as unknown as Window & typeof globalThis;
    try {
      expect(findPpbBundleEmbedMount(root as unknown as ParentNode)).toEqual({ kind: "before", element: button });
    } finally { global.window = previousWindow; }
  });

  it("does not initialize over the existing parent-product PPB path", () => {
    const root = { querySelector: () => ({ dataset: { isContainerProduct: "true" } }) };
    expect(shouldInitializePpbBundleEmbed({ productId: "123", endpointUrl: "/api" }, root as unknown as ParentNode)).toBe(false);
  });

  it("preselects one matching available current variant and preserves restored selections", () => {
    const controller: any = {
      config: { currentProductId: "123", selectedVariantId: "999" },
      selectedBundle: { steps: [{ enabled: true }, { enabled: true }] },
      selectedProducts: [{}, {}],
      stepProductData: [
        [{ productId: "123", variantId: "999", selectionId: "999", available: true }],
        [],
      ],
      normalizeSelectionKey: (value: unknown) => String(value),
      setSelectedQuantity: jest.fn(),
    };
    expect(applyBrowsedProductPreselection(controller, true, false)).toBe(true);
    expect(controller.setSelectedQuantity).toHaveBeenCalledWith(0, "999", 1);
    controller.setSelectedQuantity.mockClear();
    controller.selectedProducts[0] = { restored: 1 };
    expect(applyBrowsedProductPreselection(controller, true, true)).toBe(false);
    expect(controller.setSelectedQuantity).not.toHaveBeenCalled();
  });

  it("preselects the current non-default variant from a grouped product", () => {
    const controller: any = {
      config: { currentProductId: "123", selectedVariantId: "999" },
      selectedBundle: { steps: [{ enabled: true }] },
      selectedProducts: [{}],
      stepProductData: [[{
        id: "123",
        selectionId: "111",
        available: true,
        variants: [
          { selectionId: "111", available: true },
          { selectionId: "999", available: true },
        ],
      }]],
      normalizeSelectionKey: (value: unknown) => String(value),
      setSelectedQuantity: jest.fn(),
    };
    expect(applyBrowsedProductPreselection(controller, true, false)).toBe(true);
    expect(controller.setSelectedQuantity).toHaveBeenCalledWith(0, "999", 1);
  });
});
