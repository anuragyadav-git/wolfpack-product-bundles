import { consumeFpbUpsellHandoff, createFpbUpsellHandoff, reconcileFpbUpsellHandoff } from "../../../app/storefront/fpb-upsell-handoff";
import { fullPageUpsellHandoffMethods } from "../../../app/assets/widgets/full-page/methods/upsell-handoff-methods";

describe("FPB upsell handoff", () => {
  it("creates a versioned bundle-scoped payload and consumes it once", () => {
    const storage = new Map<string, string>();
    const adapter = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) };
    createFpbUpsellHandoff(adapter, { bundleId: "b1", productId: "p1", variantId: "v1", productHandle: "p", collectionIds: ["c1"] }, 1000);
    expect(consumeFpbUpsellHandoff(adapter, "b1", 1001)?.variantId).toBe("v1");
    expect(consumeFpbUpsellHandoff(adapter, "b1", 1002)).toBeNull();
  });

  it("consumes stale and wrong-bundle payloads without returning them", () => {
    const storage = new Map<string, string>();
    const adapter = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) };
    createFpbUpsellHandoff(adapter, { bundleId: "b1", productId: "p1", variantId: "v1", productHandle: "p", collectionIds: [] }, 0);
    expect(consumeFpbUpsellHandoff(adapter, "b1", 600001)).toBeNull();
    createFpbUpsellHandoff(adapter, { bundleId: "b2", productId: "p1", variantId: "v1", productHandle: "p", collectionIds: [] }, 1000);
    expect(consumeFpbUpsellHandoff(adapter, "b1", 1001)).toBeNull();
  });

  it("selects the exact available variant in the first matching enabled paid step and never doubles defaults", () => {
    const selected = [{ v1: 1 }, {}];
    const steps = [
      { position: 2, enabled: true, isFreeGift: false },
      { position: 1, enabled: true, isFreeGift: false },
    ];
    const products = [
      [{ productId: "p1", variants: [{ id: "v1", available: true }] }],
      [{ productId: "p1", variants: [{ id: "v1", available: true }] }],
    ];
    expect(reconcileFpbUpsellHandoff({ bundleId: "b1", payload: { version: 1, bundleId: "b1", productId: "p1", variantId: "v1", productHandle: "p", collectionIds: [], createdAt: 1 }, steps, stepProductData: products, selectedProducts: selected })).toEqual({ matched: true, stepIndex: 1, changed: true });
    expect(selected[1].v1).toBe(1);
    expect(reconcileFpbUpsellHandoff({ bundleId: "b1", payload: { version: 1, bundleId: "b1", productId: "p1", variantId: "v1", productHandle: "p", collectionIds: [], createdAt: 1 }, steps, stepProductData: products, selectedProducts: selected })).toEqual({ matched: true, stepIndex: 1, changed: false });
  });

  it("does not substitute unavailable or unknown variants", () => {
    const selected = [{}];
    const result = reconcileFpbUpsellHandoff({ bundleId: "b1", payload: { version: 1, bundleId: "b1", productId: "p1", variantId: "missing", productHandle: "p", collectionIds: [], createdAt: 1 }, steps: [{ position: 1, enabled: true, isFreeGift: false }], stepProductData: [[{ productId: "p1", variants: [{ id: "v1", available: true }] }]], selectedProducts: selected });
    expect(result).toEqual({ matched: false, stepIndex: null, changed: false });
    expect(selected).toEqual([{}]);
  });

  it("refreshes both shared summaries without changing the active step", () => {
    const sidePanel = {};
    const controller = {
      activeStep: 3,
      _pendingFpbUpsellHandoff: { version: 1, bundleId: "b1", productId: "p1", variantId: "v1", productHandle: "p", collectionIds: [], createdAt: 1 },
      _fpbUpsellHydratedStepIndexes: new Set<number>(),
      selectedBundle: { id: "b1", steps: [{ position: 1, enabled: true, isFreeGift: false }] },
      stepProductData: [[{ productId: "p1", variants: [{ id: "v1", available: true }] }]],
      selectedProducts: [{}],
      container: { querySelector: () => sidePanel },
      renderSidePanel: jest.fn(),
      _renderMobileSummaryTray: jest.fn(),
    };

    fullPageUpsellHandoffMethods._reconcileFpbUpsellHandoffAfterStepLoad.call(controller, 0);

    expect(controller.selectedProducts).toEqual([{ v1: 1 }]);
    expect(controller.renderSidePanel).toHaveBeenCalledWith(sidePanel);
    expect(controller._renderMobileSummaryTray).toHaveBeenCalledWith({ preserveOpen: true });
    expect(controller.activeStep).toBe(3);
  });
});
