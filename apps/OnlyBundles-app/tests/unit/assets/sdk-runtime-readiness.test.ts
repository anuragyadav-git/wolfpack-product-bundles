import { hydrateSdkState } from "../../../app/assets/sdk/hydration";
import { createState } from "../../../app/assets/sdk/state";
import { createSdk, initializeSdk } from "../../../app/storefront/sdk";

const snapshot = {
  id: "bundle-1",
  name: "Hydrated Bundle",
  schemaVersion: 3,
  bundleType: "product_page",
  runtimeAuthorization: { version: 2 },
  steps: [{
    id: "step-1",
    name: "Choose",
    conditionType: "quantity",
    conditionOperator: "less_than_or_equal_to",
    conditionValue: 3,
    products: [{ productId: "gid://shopify/Product/900" }],
    categories: [],
  }],
  pricing: { enabled: false, rules: [] },
};

function makeParsedState() {
  const state: any = createState();
  Object.assign(state, {
    bundleId: snapshot.id,
    offerId: snapshot.id,
    bundleName: snapshot.name,
    bundleData: structuredClone(snapshot),
    steps: structuredClone(snapshot.steps),
    discountConfiguration: snapshot.pricing,
    selections: { "step-1": {} },
  });
  return state;
}

function storefrontResponse() {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      data: {
        nodes: [{
          id: "gid://shopify/Product/900",
          title: "Trail Bottle",
          handle: "trail-bottle",
          description: "Bottle",
          descriptionHtml: "<p>Bottle</p>",
          featuredImage: { url: "https://cdn.example/bottle.jpg" },
          images: { nodes: [{ url: "https://cdn.example/bottle.jpg" }] },
          options: [{ id: "option-1", name: "Size", optionValues: [{ id: "value-1", name: "Large", swatch: null }] }],
          variants: {
            nodes: [{
              id: "gid://shopify/ProductVariant/901",
              title: "Large",
              availableForSale: true,
              quantityAvailable: 4,
              currentlyNotInStock: false,
              price: { amount: "12.50", currencyCode: "USD" },
              compareAtPrice: { amount: "15.00", currencyCode: "USD" },
              weight: 0.5,
              weightUnit: "KILOGRAMS",
              image: { url: "https://cdn.example/large.jpg" },
              selectedOptions: [{ name: "Size", value: "Large" }],
            }],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        }],
      },
    }),
  };
}

describe("SDK hydration", () => {
  it("hydrates and normalizes Shopify products before marking state ready", async () => {
    const state = makeParsedState();
    await hydrateSdkState(state, {
      runtime: { storefrontApiVersion: "2026-07", storefrontAccessToken: "token" },
      shop: "shop.myshopify.com",
      country: "US",
      fetchImpl: jest.fn().mockResolvedValue(storefrontResponse()),
    });

    expect(state.isReady).toBe(true);
    expect(state.steps[0].products[0]).toMatchObject({
      id: "900",
      variantId: "901",
      selectionId: "901",
      price: 1250,
      compareAtPrice: 1500,
      available: true,
      quantityAvailable: 4,
      weight: 500,
      descriptionHtml: "<p>Bottle</p>",
    });
    expect(state.steps[0].products[0].variants[0].selectedOptions).toEqual([{ name: "Size", value: "Large" }]);
  });

  it("fails when Shopify omits a configured product", async () => {
    const state = makeParsedState();
    const empty = { ok: true, status: 200, json: async () => ({ data: { nodes: [null] } }) };
    await expect(hydrateSdkState(state, {
      runtime: { storefrontApiVersion: "2026-07", storefrontAccessToken: "token" },
      shop: "shop.myshopify.com",
      fetchImpl: jest.fn().mockResolvedValue(empty),
    })).rejects.toThrow(/configured products/i);
    expect(state.isReady).toBe(false);
  });
});

describe("SDK initialization", () => {
  const container = {
    dataset: { bundleConfig: JSON.stringify(snapshot), shop: "shop.myshopify.com" },
    style: { display: "" },
  } as unknown as HTMLElement;

  it("checks eligibility before hydration and emits ready only after hydration", async () => {
    const calls: string[] = [];
    const emitted: Array<{ name: string; detail: any }> = [];
    const targetWindow: any = { Shopify: { locale: "en", shop: "shop.myshopify.com", country: "US" }, location: { search: "" } };

    await initializeSdk(container, {
      targetWindow,
      runtime: { storefrontApiVersion: "2026-07", storefrontAccessToken: "token" },
      eligibilityResolver: async () => { calls.push("eligibility"); return true; },
      hydrateState: async (state: any) => { calls.push("hydration"); state.steps[0].products = [{ selectionId: "901", variantId: "901", available: true, price: 1250 }]; state.stepProductData = [state.steps[0].products]; state.isReady = true; },
      emitFn: (name: string, detail: any) => { calls.push(name); emitted.push({ name, detail }); },
    });

    expect(calls).toEqual(["eligibility", "hydration", "wbp:ready"]);
    expect(targetWindow.WolfpackBundles.state.steps[0].products[0].selectionId).toBe("901");
    expect(emitted[0].name).toBe("wbp:ready");
  });

  it("silently hides an ineligible offer without hydrating", async () => {
    const hydrateState = jest.fn();
    const emitFn = jest.fn();
    const targetWindow: any = { Shopify: { locale: "en" }, location: { search: "" } };
    await initializeSdk(container, {
      targetWindow,
      runtime: { storefrontApiVersion: "2026-07", storefrontAccessToken: "token" },
      eligibilityResolver: async () => false,
      hydrateState,
      emitFn,
    });
    expect(container.hidden).toBe(true);
    expect(hydrateState).not.toHaveBeenCalled();
    expect(emitFn).not.toHaveBeenCalled();
    expect(targetWindow.WolfpackBundles).toBeUndefined();
  });

  it.each([
    ["invalid configuration", { dataset: { bundleConfig: "{}" }, style: {} }, undefined, "INVALID_CONFIGURATION"],
    ["missing runtime", container, undefined, "MISSING_STOREFRONT_RUNTIME"],
  ])("fails closed for %s", async (_label, targetContainer, runtime, code) => {
    const emitted: Array<{ name: string; detail: any }> = [];
    const targetWindow: any = { Shopify: { locale: "en" }, location: { search: "" } };
    await initializeSdk(targetContainer as HTMLElement, {
      targetWindow,
      runtime,
      eligibilityResolver: async () => true,
      emitFn: (name: string, detail: any) => emitted.push({ name, detail }),
    });
    expect(emitted).toEqual([{ name: "wbp:init-failed", detail: { code, message: expect.any(String) } }]);
    expect(targetWindow.WolfpackBundles).toBeUndefined();
  });

  it("emits a stable hydration failure without a ready event", async () => {
    const emitted: Array<{ name: string; detail: any }> = [];
    const targetWindow: any = { Shopify: { locale: "en" }, location: { search: "" } };
    await initializeSdk(container, {
      targetWindow,
      runtime: { storefrontApiVersion: "2026-07", storefrontAccessToken: "token" },
      eligibilityResolver: async () => true,
      hydrateState: async () => { throw new Error("network down"); },
      emitFn: (name: string, detail: any) => emitted.push({ name, detail }),
    });
    expect(emitted).toEqual([{ name: "wbp:init-failed", detail: { code: "PRODUCT_HYDRATION_FAILED", message: expect.any(String) } }]);
    expect(targetWindow.WolfpackBundles).toBeUndefined();
  });
});

describe("SDK public state", () => {
  it("returns frozen configuration and copied selection maps", () => {
    const state = makeParsedState();
    state.isReady = true;
    state.steps[0].products = [{ selectionId: "901", variantId: "901", available: true, price: 1250 }];
    state.stepProductData = [state.steps[0].products];
    state.selections["step-1"] = { "901": 1 };
    const sdk = createSdk(state);

    const first = sdk.state;
    expect(Object.isFrozen(first.steps)).toBe(true);
    expect(Object.isFrozen(first.steps[0])).toBe(true);
    first.selections["step-1"]["901"] = 99;
    expect(sdk.state.selections["step-1"]["901"]).toBe(1);
  });
});
