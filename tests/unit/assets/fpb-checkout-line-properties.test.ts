export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageStepFooterMethods } =
  require("../../../app/assets/widgets/full-page/methods/step-footer-methods.js");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageValidationAddonsMethods } =
  require("../../../app/assets/widgets/full-page/methods/validation-addons-methods.js");
function createCartAddFetchMock() {
  return jest.fn(async (url: string, _options?: RequestInit) => ({
    ok: true,
    json: async () =>
      url === "/apps/product-bundles/api/cart-transform-runtime-token"
        ? { token: "runtime-token" }
        : {},
  }));
}

describe("FPB checkout cart-line properties", () => {
  it("aborts add-to-cart when storefront preflight reports deleted variant", async () => {
    const fetchMock = jest.fn(async (url: string) => {
      if (url === "/variants/111.js") {
        return {
          ok: false,
          status: 404,
          json: async () => ({ available: false }),
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    const originalFetch = (global as any).fetch;
    const originalWindow = (global as any).window;
    const originalDocument = (global as any).document;
    const originalGetComputedStyle = (global as any).getComputedStyle;
    const originalSetTimeout = (global as any).setTimeout;
    (global as any).fetch = fetchMock;
    (global as any).window = {
      Shopify: {
        currency: { active: "USD", format: ["$", "{{amount}}"].join("") },
      },
    };
    (global as any).document = {
      documentElement: {},
      getElementById: () => null,
      createElement: () => ({
        id: "",
        className: "",
        innerHTML: "",
        remove: jest.fn(),
        querySelector: () => ({ addEventListener: jest.fn() }),
      }),
      body: { appendChild: jest.fn() },
    };
    (global as any).getComputedStyle = () => ({ getPropertyValue: () => "" });
    (global as any).setTimeout = jest.fn();

    try {
      await fullPageStepFooterMethods.addBundleToCart.call({
        _isWidgetActionBusy: false,
        container: null,
        selectedBundle: {
          name: "Daily Essentials",
          steps: [{ id: "paid-step", isFreeGift: false }],
        },
        selectedProducts: [{ "gid://shopify/ProductVariant/111": 1 }],
        stepProductData: [[{
          selectionId: "gid://shopify/ProductVariant/111",
          variantId: "gid://shopify/ProductVariant/111",
          id: "gid://shopify/Product/111",
          variants: [{ selectionId: "gid://shopify/ProductVariant/111", id: "gid://shopify/ProductVariant/111" }],
          title: "14k Interlinked Earrings",
          price: 82900,
        }]],
        areBundleConditionsMet: () => true,
        expandProductsByVariant: (products: unknown[]) => products,
        extractId: (value: string) => value.split("/").pop(),
        getVariantAvailable: () => ({ available: null, outOfStock: false, acceptsBackorder: false }),
        generateBundleSessionKey: () => "ABC",
        resolveFullPageOfferId: () => "FBP-1",
        getAddonTierEvaluation: () => ({}),
        getAddonLineDiscount: () => null,
        getSelectedSellingPlanAllocationId: () => null,
        buildCartLineSourceProperties: () => ({}),
        _setWidgetBusy: jest.fn(),
        showLoadingOverlay: jest.fn(),
        hideLoadingOverlay: jest.fn(),
        syncBundleDetailsCartMetafield: jest.fn(),
        _emitStorefrontEvent: jest.fn(),
        _handlePostAddToCartAction: jest.fn(),
        _getLandingPageControls: () => ({ checkout: null }),
      });
    } finally {
      (global as any).fetch = originalFetch;
      (global as any).window = originalWindow;
      (global as any).document = originalDocument;
      (global as any).getComputedStyle = originalGetComputedStyle;
      (global as any).setTimeout = originalSetTimeout;
    }

    expect(fetchMock).toHaveBeenCalledWith("/variants/111.js", expect.objectContaining({
      method: "GET",
    }));
    expect(fetchMock).not.toHaveBeenCalledWith("/apps/product-bundles/api/cart-transform-runtime-token", expect.any(Object));
    expect(fetchMock).not.toHaveBeenCalledWith("/cart/add.js", expect.any(Object));
  });

  it("includes the configured product identity when requesting a runtime token", async () => {
    const fetchMock = createCartAddFetchMock();
    const originalFetch = (global as any).fetch;
    (global as any).fetch = fetchMock;

    try {
      await fullPageStepFooterMethods.requestCartTransformRuntimeToken.call(
        { selectedBundle: { id: "bundle-1" } },
        [{
          id: "501",
          quantity: 1,
          productId: "gid://shopify/Product/5",
          properties: {},
        }],
        { offerGroupId: "FBP-1_ABC", bundleType: "full_page" },
      );
    } finally {
      (global as any).fetch = originalFetch;
    }

    const tokenRequest = fetchMock.mock.calls.find(
      ([url]: any) => url === "/apps/product-bundles/api/cart-transform-runtime-token",
    )!;
    const body = JSON.parse(String(tokenRequest[1]?.body));

    expect(tokenRequest[1]).toMatchObject({
      method: "POST",
      credentials: "same-origin",
    });
    expect(body.components).toEqual([{
      variantId: "501",
      productId: "gid://shopify/Product/5",
      quantity: 1,
    }]);
  });

    it("keeps paid add-on savings out of parent pricing metadata", () => {
    const originalWindow = (global as any).window;
    let sourceProperties;

    try {
      (global as any).window = {
        Shopify: { currency: { active: "USD", format: ["$", "{{amount}}"].join("") } },
      };

      const paidStep = { id: "paid-step" };
      const paidAddonStep = { id: "addon-step", isFreeGift: true, addonDisplayFree: false };

      sourceProperties = fullPageStepFooterMethods.buildCartLineSourceProperties.call(
        {
          selectedProducts: [
            { paidVariant: 1 },
            { addonVariant: 1 },
          ],
          stepProductData: [
            [{ selectionId: "paidVariant", title: "Paid product", price: 82900 }],
            [{ selectionId: "addonVariant", title: "Paid add-on", price: 82900 }],
          ],
          selectedBundle: {
            pricing: { enabled: false, rules: [] },
            steps: [paidStep, paidAddonStep],
          },
          buildCartLineDisplayProperties:
            fullPageStepFooterMethods.buildCartLineDisplayProperties,
          getCartLineLabels: () => ({
            items: "Items",
            retailPrice: "Retail Price",
            youSave: "You Save",
          }),
        },
        [
          { product: { title: "Paid product", price: 82900 }, quantity: 1, step: paidStep },
          { product: { title: "Paid add-on", price: 82900 }, quantity: 1, step: paidAddonStep },
        ],
      );
    } finally {
      (global as any).window = originalWindow;
    }

    expect(JSON.parse(sourceProperties._bundle_display_properties)).toEqual({
      box: "1",
      items: "1 x Paid product",
      retailPrice: "$829.00",
      labels: {
        items: "Items",
        retailPrice: "Retail Price",
        youSave: "You Save",
      },
    });
    expect(sourceProperties).not.toHaveProperty("Items");
    expect(sourceProperties).not.toHaveProperty("Retail Price");
    expect(sourceProperties).not.toHaveProperty("You Save");
    expect(sourceProperties).not.toHaveProperty("Box");
  });

  it("uses resolved selected variant id even if product.variantId is not the selected variant", async () => {
    const fetchMock = jest.fn(async (url: string) => {
      if (url === "/apps/product-bundles/api/cart-transform-runtime-token") {
        return {
          ok: true,
          json: async () => ({ token: "runtime-token" }),
        };
      }
      if (url === "/cart/add.js") {
        return {
          ok: true,
          json: async () => ({}),
        };
      }
      return {
        ok: true,
        json: async () => ({}),
      };
    });
    const originalFetch = (global as any).fetch;
    const originalWindow = (global as any).window;
    const originalDocument = (global as any).document;
    const originalGetComputedStyle = (global as any).getComputedStyle;
    const originalSetTimeout = (global as any).setTimeout;
    (global as any).fetch = fetchMock;
    (global as any).window = {
      Shopify: {
        currency: { active: "USD", format: ["$", "{{amount}}"].join("") },
      },
    };
    (global as any).document = {
      documentElement: {},
      getElementById: () => null,
      createElement: () => ({
        id: "",
        className: "",
        innerHTML: "",
        remove: jest.fn(),
        querySelector: () => ({
          addEventListener: jest.fn(),
        }),
      }),
      body: {
        appendChild: jest.fn(),
      },
    };
    (global as any).getComputedStyle = () => ({
      getPropertyValue: () => "",
    });
    (global as any).setTimeout = jest.fn();

    try {
      await fullPageStepFooterMethods.addBundleToCart.call({
        _isWidgetActionBusy: false,
        container: null,
        selectedBundle: {
          name: "Daily Essentials",
          steps: [{ id: "paid-step", isFreeGift: false }],
        },
        selectedProducts: [
          { "gid://shopify/ProductVariant/111": 1 },
        ],
        stepProductData: [
          [{
            selectionId: "gid://shopify/ProductVariant/111",
            variantId: "gid://shopify/Product/222",
            id: "gid://shopify/Product/111",
            variants: [
              { selectionId: "gid://shopify/ProductVariant/111", id: "gid://shopify/ProductVariant/111" },
            ],
            title: "14k Interlinked Earrings",
            price: 82900,
          }],
        ],
        areBundleConditionsMet: () => true,
        expandProductsByVariant: (products: unknown[]) => products,
        extractId: (value: string) => value.split("/").pop(),
        getVariantAvailable: () => ({ available: null, outOfStock: false, acceptsBackorder: false }),
        generateBundleSessionKey: () => "ABC",
        resolveFullPageOfferId: () => "FBP-1",
        getAddonTierEvaluation: () => ({}),
        getAddonLineDiscount: () => null,
        getSelectedSellingPlanAllocationId: () => null,
        buildCartLineSourceProperties: () => ({}),
        _setWidgetBusy: jest.fn(),
        showLoadingOverlay: jest.fn(),
        hideLoadingOverlay: jest.fn(),
        syncBundleDetailsCartMetafield: jest.fn(),
        _emitStorefrontEvent: jest.fn(),
        _handlePostAddToCartAction: jest.fn(),
        _getLandingPageControls: () => ({ checkout: null }),
      });
    } finally {
      (global as any).fetch = originalFetch;
      (global as any).window = originalWindow;
      (global as any).document = originalDocument;
      (global as any).getComputedStyle = originalGetComputedStyle;
      (global as any).setTimeout = originalSetTimeout;
    }

    const addRequest: any = fetchMock.mock.calls.find(([url]: any) => url === "/cart/add.js")!;
    expect(addRequest).toBeDefined();
    const body = JSON.parse(String(addRequest[1]?.body));
    expect(body.items).toEqual([
      expect.objectContaining({
        id: "111",
      }),
    ]);
  });

  it("omits Box cart properties for BXY when bundle quantity options are hidden", async () => {
    const fetchMock = createCartAddFetchMock();
    const originalFetch = (global as any).fetch;
    const originalWindow = (global as any).window;
    const originalDocument = (global as any).document;
    const originalGetComputedStyle = (global as any).getComputedStyle;
    const originalSetTimeout = (global as any).setTimeout;
    (global as any).fetch = fetchMock;
    (global as any).window = {
      Shopify: {
        currency: { active: "USD", format: ["$", "{{amount}}"].join("") },
      },
    };
    (global as any).document = {
      documentElement: {},
      getElementById: () => null,
      createElement: () => ({
        id: "",
        className: "",
        innerHTML: "",
        remove: jest.fn(),
        querySelector: () => ({
          addEventListener: jest.fn(),
        }),
      }),
      body: {
        appendChild: jest.fn(),
      },
    };
    (global as any).getComputedStyle = () => ({
      getPropertyValue: () => "",
    });
    (global as any).setTimeout = jest.fn();

    try {
      await fullPageStepFooterMethods.addBundleToCart.call({
        _isWidgetActionBusy: false,
        container: null,
        selectedBundle: {
          id: "bundle-1",
          name: "Daily Essentials",
          pricing: {
            enabled: true,
            method: "buy_x_get_y",
            rules: [{
              id: "rule-1",
              conditionType: "quantity",
              conditionValue: 2,
              customerBuys: 2,
              customerGets: 1,
              discountValue: 100,
              bxyDiscountType: "percentage",
              bxyApplyMode: "lowest_priced",
            }],
            displayOptions: {
              bundleQuantityOptions: { enabled: false },
            },
          },
          steps: [{ id: "paid-step", isFreeGift: false }],
        },
        selectedProducts: [
          {
            "gid://shopify/ProductVariant/111": 1,
            "gid://shopify/ProductVariant/222": 1,
          },
        ],
        stepProductData: [
          [
            {
              selectionId: "gid://shopify/ProductVariant/111",
              variantId: "gid://shopify/ProductVariant/111",
              title: "First product",
              price: 82900,
            },
            {
              selectionId: "gid://shopify/ProductVariant/222",
              variantId: "gid://shopify/ProductVariant/222",
              title: "Second product",
              price: 61900,
            },
          ],
        ],
        areBundleConditionsMet: () => true,
        expandProductsByVariant: (products: unknown[]) => products,
        extractId: (value: string) => value.split("/").pop(),
        generateBundleSessionKey: () => "ABC",
        resolveFullPageOfferId: () => "FBP-1",
        getAddonTierEvaluation: () => ({}),
        getAddonLineDiscount: () => null,
        getSelectedSellingPlanAllocationId: () => null,
        buildCartLineSourceProperties:
          fullPageStepFooterMethods.buildCartLineSourceProperties,
        _setWidgetBusy: jest.fn(),
        showLoadingOverlay: jest.fn(),
        hideLoadingOverlay: jest.fn(),
        syncBundleDetailsCartMetafield: jest.fn(),
        _emitStorefrontEvent: jest.fn(),
        _handlePostAddToCartAction: jest.fn(),
        _getLandingPageControls: () => ({ checkout: null }),
      });
    } finally {
      (global as any).fetch = originalFetch;
      (global as any).window = originalWindow;
      (global as any).document = originalDocument;
      (global as any).getComputedStyle = originalGetComputedStyle;
      (global as any).setTimeout = originalSetTimeout;
    }

    const addRequest = fetchMock.mock.calls.find(([url]: any) => url === "/cart/add.js")!;
    expect(addRequest).toBeDefined();
    const body = JSON.parse(String(addRequest[1]?.body));

    expect(body.items).toHaveLength(2);
    body.items.forEach((item: { properties: Record<string, string> }) => {
      expect(item.properties).not.toHaveProperty("Box");
      expect(item.properties).toHaveProperty("_bundle_display_properties");
      expect(JSON.parse(item.properties._bundle_display_properties)).toEqual({
        items: "1 x First product, 1 x Second product",
        retailPrice: "$1448.00",
      });
    });
  });

  it("uses bundle box numbering and hidden bundle metadata for paid add-on lines", async () => {
    const fetchMock = createCartAddFetchMock();
    const originalFetch = (global as any).fetch;
    const originalWindow = (global as any).window;
    const originalDocument = (global as any).document;
    const originalGetComputedStyle = (global as any).getComputedStyle;
    const originalSetTimeout = (global as any).setTimeout;
    (global as any).fetch = fetchMock;
    (global as any).window = {
      Shopify: {
        currency: { active: "USD", format: ["$", "{{amount}}"].join("") },
      },
    };
    (global as any).document = {
      documentElement: {},
      getElementById: () => null,
      createElement: () => ({
        id: "",
        className: "",
        innerHTML: "",
        remove: jest.fn(),
        querySelector: () => ({
          addEventListener: jest.fn(),
        }),
      }),
      body: {
        appendChild: jest.fn(),
      },
    };
    (global as any).getComputedStyle = () => ({
      getPropertyValue: () => "",
    });
    (global as any).setTimeout = jest.fn();
    const emitMock = jest.fn();

    try {
      await fullPageStepFooterMethods.addBundleToCart.call({
        _isWidgetActionBusy: false,
        container: null,
        selectedBundle: {
          name: "Daily Essentials",
          steps: [
            { id: "paid-step", isFreeGift: false },
            { id: "addon-step", isFreeGift: true, addonDisplayFree: false },
          ],
        },
        selectedProducts: [
          { "gid://shopify/ProductVariant/111": 1 },
          { "gid://shopify/ProductVariant/222": 1 },
        ],
        stepProductData: [
          [{ selectionId: "gid://shopify/ProductVariant/111", variantId: "gid://shopify/ProductVariant/111", title: "Paid product" }],
          [{ selectionId: "gid://shopify/ProductVariant/222", variantId: "gid://shopify/ProductVariant/222", title: "Paid add-on" }],
        ],
        areBundleConditionsMet: () => true,
        expandProductsByVariant: (products: unknown[]) => products,
        extractId: (value: string) => value.split("/").pop(),
        generateBundleSessionKey: () => "ABC",
        resolveFullPageOfferId: () => "FBP-1",
        getAddonTierEvaluation: (step: { isFreeGift?: boolean }) =>
          step.isFreeGift ? { tier: { tierId: "tier1" } } : {},
        getAddonLineDiscount: (step: { isFreeGift?: boolean }) =>
          step.isFreeGift ? { type: "PERCENTAGE", value: 10 } : null,
        getSelectedSellingPlanAllocationId: () => null,
        buildCartLineSourceProperties: () => ({
          _bundle_display_properties: JSON.stringify({ box: "1" }),
        }),
        _setWidgetBusy: jest.fn(),
        showLoadingOverlay: jest.fn(),
        hideLoadingOverlay: jest.fn(),
        syncBundleDetailsCartMetafield: jest.fn(),
        _emitStorefrontEvent: emitMock,
        _handlePostAddToCartAction: jest.fn(),
        _getLandingPageControls: () => ({ checkout: null }),
      });
    } finally {
      (global as any).fetch = originalFetch;
      (global as any).window = originalWindow;
      (global as any).document = originalDocument;
      (global as any).getComputedStyle = originalGetComputedStyle;
      (global as any).setTimeout = originalSetTimeout;
    }

    const addRequest = fetchMock.mock.calls.find(([url]: any) => url === "/cart/add.js")!;
    expect(addRequest).toBeDefined();
    const body = JSON.parse(String(addRequest[1]?.body));
    const addonLine = body.items.find(
      (item: { properties: Record<string, string> }) =>
        item.properties._bundle_step_type === "addon:PERCENTAGE:10",
    );

    expect(addonLine.properties.Box).toBe("1");
    expect(addonLine.properties).toHaveProperty("_bundle_display_properties");
    expect(addonLine.properties).not.toHaveProperty("Items");
    expect(addonLine.properties).not.toHaveProperty("Retail Price");
    expect(addonLine.properties).not.toHaveProperty("You Save");
  });

  it("blocks out-of-stock selections before posting the full-page bundle to cart", async () => {
    const fetchMock = createCartAddFetchMock();
    const originalFetch = (global as any).fetch;
    const originalWindow = (global as any).window;
    const originalDocument = (global as any).document;
    const originalGetComputedStyle = (global as any).getComputedStyle;
    const originalSetTimeout = (global as any).setTimeout;
    const appendedToasts: any[] = [];
    (global as any).fetch = fetchMock;
    (global as any).window = {
      Shopify: {
        currency: { active: "USD", format: ["$", "{{amount}}"].join("") },
      },
    };
    (global as any).document = {
      documentElement: {},
      getElementById: () => null,
      createElement: () => ({
        id: "",
        className: "",
        innerHTML: "",
        classList: { add: jest.fn() },
        remove: jest.fn(),
        querySelector: () => ({
          addEventListener: jest.fn(),
        }),
      }),
      body: {
        appendChild: (element: any) => appendedToasts.push(element),
      },
    };
    (global as any).getComputedStyle = () => ({
      getPropertyValue: () => "",
    });
    (global as any).setTimeout = jest.fn();

    try {
      await fullPageStepFooterMethods.addBundleToCart.call({
        _isWidgetActionBusy: false,
        container: null,
        selectedBundle: {
          name: "Daily Essentials",
          steps: [{ id: "paid-step", isFreeGift: false }],
        },
        selectedProducts: [
          { "gid://shopify/ProductVariant/111": 1 },
        ],
        stepProductData: [
          [{
            selectionId: "gid://shopify/ProductVariant/111",
            variantId: "gid://shopify/ProductVariant/111",
            title: "Tracked zero-stock product",
            available: true,
            quantityAvailable: 0,
            currentlyNotInStock: false,
          }],
        ],
        areBundleConditionsMet: () => true,
        expandProductsByVariant: (products: unknown[]) => products,
        extractId: (value: string) => value.split("/").pop(),
        generateBundleSessionKey: () => "ABC",
        resolveFullPageOfferId: () => "FBP-1",
        getAddonTierEvaluation: () => ({}),
        getAddonLineDiscount: () => null,
        getSelectedSellingPlanAllocationId: () => null,
        getVariantAvailable: () => ({ available: 0, outOfStock: true, acceptsBackorder: false }),
        buildCartLineSourceProperties: () => ({}),
        _setWidgetBusy: jest.fn(),
        showLoadingOverlay: jest.fn(),
        hideLoadingOverlay: jest.fn(),
        syncBundleDetailsCartMetafield: jest.fn(),
        _emitStorefrontEvent: jest.fn(),
        _handlePostAddToCartAction: jest.fn(),
        _getLandingPageControls: () => ({
          trackInventoryOnAddToCart: true,
          checkout: null,
        }),
      });
    } finally {
      (global as any).fetch = originalFetch;
      (global as any).window = originalWindow;
      (global as any).document = originalDocument;
      (global as any).getComputedStyle = originalGetComputedStyle;
      (global as any).setTimeout = originalSetTimeout;
    }

    expect(fetchMock).not.toHaveBeenCalledWith(
      "/cart/add.js",
      expect.anything(),
    );
    expect(appendedToasts.some((toast) =>
      String(toast.innerHTML).includes("out of stock")
    )).toBe(true);
  });

  it("blocks selections that exceed available stock before posting the full-page bundle to cart", async () => {
    const fetchMock = createCartAddFetchMock();
    const originalFetch = (global as any).fetch;
    const originalWindow = (global as any).window;
    const originalDocument = (global as any).document;
    const originalGetComputedStyle = (global as any).getComputedStyle;
    const originalSetTimeout = (global as any).setTimeout;
    const appendedToasts: any[] = [];
    (global as any).fetch = fetchMock;
    (global as any).window = {
      Shopify: {
        currency: { active: "USD", format: ["$", "{{amount}}"].join("") },
      },
    };
    (global as any).document = {
      documentElement: {},
      getElementById: () => null,
      createElement: () => ({
        id: "",
        className: "",
        innerHTML: "",
        classList: { add: jest.fn() },
        remove: jest.fn(),
        querySelector: () => ({
          addEventListener: jest.fn(),
        }),
      }),
      body: {
        appendChild: (element: any) => appendedToasts.push(element),
      },
    };
    (global as any).getComputedStyle = () => ({
      getPropertyValue: () => "",
    });
    (global as any).setTimeout = jest.fn();

    try {
      await fullPageStepFooterMethods.addBundleToCart.call({
        _isWidgetActionBusy: false,
        container: null,
        selectedBundle: {
          name: "Daily Essentials",
          steps: [{ id: "paid-step", isFreeGift: false }],
        },
        selectedProducts: [
          { "gid://shopify/ProductVariant/111": 2 },
        ],
        stepProductData: [
          [{
            selectionId: "gid://shopify/ProductVariant/111",
            variantId: "gid://shopify/ProductVariant/111",
            title: "Limited stock product",
            available: true,
            quantityAvailable: 1,
            currentlyNotInStock: false,
          }],
        ],
        areBundleConditionsMet: () => true,
        expandProductsByVariant: (products: unknown[]) => products,
        extractId: (value: string) => value.split("/").pop(),
        generateBundleSessionKey: () => "ABC",
        resolveFullPageOfferId: () => "FBP-1",
        getAddonTierEvaluation: () => ({}),
        getAddonLineDiscount: () => null,
        getSelectedSellingPlanAllocationId: () => null,
        getVariantAvailable: () => ({ available: 1, outOfStock: false, acceptsBackorder: false }),
        buildCartLineSourceProperties: () => ({}),
        _setWidgetBusy: jest.fn(),
        showLoadingOverlay: jest.fn(),
        hideLoadingOverlay: jest.fn(),
        syncBundleDetailsCartMetafield: jest.fn(),
        _emitStorefrontEvent: jest.fn(),
        _handlePostAddToCartAction: jest.fn(),
        _getLandingPageControls: () => ({
          trackInventoryOnAddToCart: true,
          checkout: null,
        }),
      });
    } finally {
      (global as any).fetch = originalFetch;
      (global as any).window = originalWindow;
      (global as any).document = originalDocument;
      (global as any).getComputedStyle = originalGetComputedStyle;
      (global as any).setTimeout = originalSetTimeout;
    }

    expect(fetchMock).not.toHaveBeenCalledWith(
      "/cart/add.js",
      expect.anything(),
    );
    expect(appendedToasts.some((toast) =>
      String(toast.innerHTML).includes("only has 1 in stock")
    )).toBe(true);
  });

  it("surfaces Shopify sold-out message when /cart/add.js returns 422", async () => {
    const fetchMock = jest.fn(async (url: string) => {
      if (url === "/apps/product-bundles/api/cart-transform-runtime-token") {
        return {
          ok: true,
          json: async () => ({ token: "runtime-token" }),
        };
      }
      if (url === "/cart/add.js") {
        return {
          ok: false,
          status: 422,
          text: async () => JSON.stringify({
            status: 422,
            message: "The product '14k Interlinked Earrings' is already sold out.",
            description: "The product '14k Interlinked Earrings' is already sold out.",
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({}),
      };
    });
    const originalFetch = (global as any).fetch;
    const originalWindow = (global as any).window;
    const originalDocument = (global as any).document;
    const originalGetComputedStyle = (global as any).getComputedStyle;
    const originalSetTimeout = (global as any).setTimeout;
    const appendedToasts: any[] = [];
    (global as any).fetch = fetchMock;
    (global as any).window = {
      Shopify: {
        currency: { active: "USD", format: ["$", "{{amount}}"].join("") },
      },
    };
    (global as any).document = {
      documentElement: {},
      getElementById: () => null,
      createElement: () => ({
        id: "",
        className: "",
        innerHTML: "",
        classList: { add: jest.fn() },
        remove: jest.fn(),
        querySelector: () => ({
          addEventListener: jest.fn(),
        }),
      }),
      body: {
        appendChild: (element: any) => appendedToasts.push(element),
      },
    };
    (global as any).getComputedStyle = () => ({
      getPropertyValue: () => "",
    });
    (global as any).setTimeout = jest.fn();

    try {
      await fullPageStepFooterMethods.addBundleToCart.call({
        _isWidgetActionBusy: false,
        container: null,
        selectedBundle: {
          name: "Daily Essentials",
          steps: [{ id: "paid-step", isFreeGift: false }],
        },
        selectedProducts: [
          { "gid://shopify/ProductVariant/111": 1 },
        ],
        stepProductData: [
          [{
            selectionId: "gid://shopify/ProductVariant/111",
            variantId: "gid://shopify/ProductVariant/111",
            title: "14k Interlinked Earrings",
            price: 82900,
            available: true,
            quantityAvailable: 6,
            currentlyNotInStock: false,
          }],
        ],
        areBundleConditionsMet: () => true,
        expandProductsByVariant: (products: unknown[]) => products,
        extractId: (value: string) => value.split("/").pop(),
        generateBundleSessionKey: () => "ABC",
        resolveFullPageOfferId: () => "FBP-1",
        getAddonTierEvaluation: () => ({}),
        getAddonLineDiscount: () => null,
        getSelectedSellingPlanAllocationId: () => null,
        buildCartLineSourceProperties: () => ({}),
        _setWidgetBusy: jest.fn(),
        showLoadingOverlay: jest.fn(),
        hideLoadingOverlay: jest.fn(),
        syncBundleDetailsCartMetafield: jest.fn(),
        _emitStorefrontEvent: jest.fn(),
        _handlePostAddToCartAction: jest.fn(),
        _getLandingPageControls: () => ({
          trackInventoryOnAddToCart: true,
          checkout: null,
        }),
      });
    } finally {
      (global as any).fetch = originalFetch;
      (global as any).window = originalWindow;
      (global as any).document = originalDocument;
      (global as any).getComputedStyle = originalGetComputedStyle;
      (global as any).setTimeout = originalSetTimeout;
    }

    expect(fetchMock).toHaveBeenCalledWith(
      "/cart/add.js",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    expect(appendedToasts.some((toast) =>
      String(toast.innerHTML).includes("already sold out")
    )).toBe(true);
  });

  it("keeps active 100 percent add-on tier lines separate from free-gift merge semantics", async () => {
    const fetchMock = createCartAddFetchMock();
    const originalFetch = (global as any).fetch;
    const originalWindow = (global as any).window;
    const originalDocument = (global as any).document;
    const originalGetComputedStyle = (global as any).getComputedStyle;
    const originalSetTimeout = (global as any).setTimeout;
    (global as any).fetch = fetchMock;
    (global as any).window = {
      Shopify: {
        currency: { active: "USD", format: ["$", "{{amount}}"].join("") },
      },
    };
    (global as any).document = {
      documentElement: {},
      getElementById: () => null,
      createElement: () => ({
        id: "",
        className: "",
        innerHTML: "",
        remove: jest.fn(),
        querySelector: () => ({
          addEventListener: jest.fn(),
        }),
      }),
      body: {
        appendChild: jest.fn(),
      },
    };
    (global as any).getComputedStyle = () => ({
      getPropertyValue: () => "",
    });
    (global as any).setTimeout = jest.fn();

    try {
      const addonStep = {
        id: "addon-step",
        isFreeGift: true,
        addonDisplayFree: true,
      };

      await fullPageStepFooterMethods.addBundleToCart.call({
        _isWidgetActionBusy: false,
        container: null,
        selectedBundle: {
          name: "Daily Essentials",
          pricing: { enabled: false, rules: [] },
          steps: [{ id: "paid-step", isFreeGift: false }, addonStep],
        },
        selectedProducts: [
          { "gid://shopify/ProductVariant/111": 1 },
          { "gid://shopify/ProductVariant/222": 1 },
        ],
        stepProductData: [
          [
            {
              selectionId: "gid://shopify/ProductVariant/111",
              variantId: "gid://shopify/ProductVariant/111",
              title: "Paid product",
              price: 82900,
            },
          ],
          [
            {
              selectionId: "gid://shopify/ProductVariant/222",
              variantId: "gid://shopify/ProductVariant/222",
              title: "Free add-on",
              price: 82900,
            },
          ],
        ],
        areBundleConditionsMet: () => true,
        expandProductsByVariant: (products: unknown[]) => products,
        extractId: (value: string) => value.split("/").pop(),
        generateBundleSessionKey: () => "ABC",
        resolveFullPageOfferId: () => "FBP-1",
        getAddonTierEvaluation: (step: { id?: string }) =>
          step === addonStep ? { tier: { tierId: "tier2" }, isEligible: true } : {},
        getAddonLineDiscount: (step: { id?: string }) =>
          step === addonStep ? { type: "PERCENTAGE", value: 100 } : null,
        getSelectedSellingPlanAllocationId: () => null,
        buildCartLineSourceProperties:
          fullPageStepFooterMethods.buildCartLineSourceProperties,
        buildCartLineDisplayProperties:
          fullPageStepFooterMethods.buildCartLineDisplayProperties,
        getCartLineLabels: () => ({
          items: "Items",
          retailPrice: "Retail Price",
          youSave: "You Save",
        }),
        _setWidgetBusy: jest.fn(),
        showLoadingOverlay: jest.fn(),
        hideLoadingOverlay: jest.fn(),
        syncBundleDetailsCartMetafield: jest.fn(),
        _emitStorefrontEvent: jest.fn(),
        _handlePostAddToCartAction: jest.fn(),
        _getLandingPageControls: () => ({ checkout: null }),
      });
    } finally {
      (global as any).fetch = originalFetch;
      (global as any).window = originalWindow;
      (global as any).document = originalDocument;
      (global as any).getComputedStyle = originalGetComputedStyle;
      (global as any).setTimeout = originalSetTimeout;
    }

    const addRequest = fetchMock.mock.calls.find(([url]: any) => url === "/cart/add.js")!;
    expect(addRequest).toBeDefined();
    const body = JSON.parse(String(addRequest[1]?.body));
    const addonLine = body.items.find(
      (item: { properties: Record<string, string> }) =>
        item.properties._bundle_step_type === "addon:PERCENTAGE:100",
    );
    const paidLine = body.items.find(
      (item: { properties: Record<string, string> }) =>
        item.properties._bundle_step_type !== "addon:PERCENTAGE:100",
    );

    expect(addonLine).toBeDefined();
    expect(addonLine.properties._addon_product).toBe("true");
    expect(addonLine.properties._addonTierId).toBe("tier2");
    expect(addonLine.properties._bundle_step_type).not.toBe("free_gift");
    expect(JSON.parse(paidLine.properties._bundle_display_properties)).toEqual({
      box: "1",
      items: "1 x Paid product",
      retailPrice: "$829.00",
      labels: {
        items: "Items",
        retailPrice: "Retail Price",
        youSave: "You Save",
      },
    });
  });

  it("keeps active flat 100 percent add-on tier lines eligible for checkout savings", async () => {
    const fetchMock = createCartAddFetchMock();
    const originalFetch = (global as any).fetch;
    const originalWindow = (global as any).window;
    const originalDocument = (global as any).document;
    const originalGetComputedStyle = (global as any).getComputedStyle;
    const originalSetTimeout = (global as any).setTimeout;
    (global as any).fetch = fetchMock;
    (global as any).window = {
      Shopify: {
        currency: { active: "USD", format: ["$", "{{amount}}"].join("") },
      },
    };
    (global as any).document = {
      documentElement: {},
      getElementById: () => null,
      createElement: () => ({
        id: "",
        className: "",
        innerHTML: "",
        remove: jest.fn(),
        querySelector: () => ({
          addEventListener: jest.fn(),
        }),
      }),
      body: {
        appendChild: jest.fn(),
      },
    };
    (global as any).getComputedStyle = () => ({
      getPropertyValue: () => "",
    });
    (global as any).setTimeout = jest.fn();

    try {
      const addonStep = {
        id: "addon-step",
        isFreeGift: true,
        addonDisplayFree: true,
        addonTiers: [
          {
            tierId: "tier2",
            eligibilityCondition: { type: "QUANTITY", value: 1 },
            discount: { type: "PERCENTAGE", value: 100 },
          },
        ],
      };

      await fullPageStepFooterMethods.addBundleToCart.call({
        ...fullPageValidationAddonsMethods,
        _isWidgetActionBusy: false,
        container: null,
        selectedBundle: {
          name: "Daily Essentials",
          pricing: { enabled: false, rules: [] },
          steps: [{ id: "paid-step", isFreeGift: false }, addonStep],
        },
        selectedProducts: [
          { "gid://shopify/ProductVariant/111": 1 },
          { "gid://shopify/ProductVariant/222": 1 },
        ],
        stepProductData: [
          [
            {
              selectionId: "gid://shopify/ProductVariant/111",
              variantId: "gid://shopify/ProductVariant/111",
              title: "Paid product",
              price: 82900,
            },
          ],
          [
            {
              selectionId: "gid://shopify/ProductVariant/222",
              variantId: "gid://shopify/ProductVariant/222",
              title: "Free add-on",
              price: 82900,
            },
          ],
        ],
        areBundleConditionsMet: () => true,
        expandProductsByVariant: (products: unknown[]) => products,
        extractId: (value: string) => value.split("/").pop(),
        generateBundleSessionKey: () => "ABC",
        resolveFullPageOfferId: () => "FBP-1",
        getSelectedSellingPlanAllocationId: () => null,
        buildCartLineSourceProperties:
          fullPageStepFooterMethods.buildCartLineSourceProperties,
        buildCartLineDisplayProperties:
          fullPageStepFooterMethods.buildCartLineDisplayProperties,
        getCartLineLabels: () => ({
          items: "Items",
          retailPrice: "Retail Price",
          youSave: "You Save",
        }),
        _setWidgetBusy: jest.fn(),
        showLoadingOverlay: jest.fn(),
        hideLoadingOverlay: jest.fn(),
        syncBundleDetailsCartMetafield: jest.fn(),
        _emitStorefrontEvent: jest.fn(),
        _handlePostAddToCartAction: jest.fn(),
        _getLandingPageControls: () => ({ checkout: null }),
      });
    } finally {
      (global as any).fetch = originalFetch;
      (global as any).window = originalWindow;
      (global as any).document = originalDocument;
      (global as any).getComputedStyle = originalGetComputedStyle;
      (global as any).setTimeout = originalSetTimeout;
    }

    const addRequest = fetchMock.mock.calls.find(([url]: any) => url === "/cart/add.js")!;
    expect(addRequest).toBeDefined();
    const body = JSON.parse(String(addRequest[1]?.body));
    const addonLine = body.items.find(
      (item: { properties: Record<string, string> }) =>
        item.properties._bundle_step_type === "addon:PERCENTAGE:100",
    );

    expect(addonLine).toBeDefined();
    expect(addonLine.properties._addon_product).toBe("true");
    expect(addonLine.properties._addonTierId).toBe("tier2");
    expect(addonLine.properties._bundle_step_type).not.toBe("free_gift");
  });

  it("keeps Classic fixed bundle price cart lines eligible for cart-transform pricing", async () => {
    const fetchMock = createCartAddFetchMock();
    const originalFetch = (global as any).fetch;
    const originalWindow = (global as any).window;
    const originalDocument = (global as any).document;
    const originalGetComputedStyle = (global as any).getComputedStyle;
    const originalSetTimeout = (global as any).setTimeout;
    (global as any).fetch = fetchMock;
    (global as any).window = {
      Shopify: {
        currency: { active: "USD", format: ["$", "{{amount}}"].join("") },
      },
    };
    (global as any).document = {
      documentElement: {},
      getElementById: () => null,
      createElement: () => ({
        id: "",
        className: "",
        innerHTML: "",
        remove: jest.fn(),
        querySelector: () => ({
          addEventListener: jest.fn(),
        }),
      }),
      body: {
        appendChild: jest.fn(),
      },
    };
    (global as any).getComputedStyle = () => ({
      getPropertyValue: () => "",
    });
    (global as any).setTimeout = jest.fn();

    try {
      await fullPageStepFooterMethods.addBundleToCart.call({
        _isWidgetActionBusy: false,
        container: null,
        selectedBundle: {
          name: "Daily Essentials",
          pricing: {
            enabled: true,
            method: "fixed_bundle_price",
            rules: [{
              method: "fixed_bundle_price",
              conditionType: "quantity",
              conditionOperator: "gte",
              conditionValue: 2,
              discountValue: 500,
            }],
          },
          steps: [{ id: "paid-step", isFreeGift: false }],
        },
        selectedProducts: [
          {
            "gid://shopify/ProductVariant/111": 1,
            "gid://shopify/ProductVariant/222": 1,
          },
        ],
        stepProductData: [
          [
            {
              selectionId: "gid://shopify/ProductVariant/111",
              variantId: "gid://shopify/ProductVariant/111",
              title: "First product",
              price: 82900,
            },
            {
              selectionId: "gid://shopify/ProductVariant/222",
              variantId: "gid://shopify/ProductVariant/222",
              title: "Second product",
              price: 61900,
            },
          ],
        ],
        areBundleConditionsMet: () => true,
        expandProductsByVariant: (products: unknown[]) => products,
        extractId: (value: string) => value.split("/").pop(),
        generateBundleSessionKey: () => "ABC",
        resolveFullPageOfferId: () => "FBP-1",
        getAddonTierEvaluation: () => ({}),
        getAddonLineDiscount: () => null,
        getSelectedSellingPlanAllocationId: () => null,
        getFullPageDesignPreset: () => "CLASSIC",
        buildCartLineSourceProperties:
          fullPageStepFooterMethods.buildCartLineSourceProperties,
        buildCartLineDisplayProperties:
          fullPageStepFooterMethods.buildCartLineDisplayProperties,
        getCartLineLabels: () => ({
          items: "Items",
          retailPrice: "Retail Price",
          youSave: "You Save",
        }),
        _setWidgetBusy: jest.fn(),
        showLoadingOverlay: jest.fn(),
        hideLoadingOverlay: jest.fn(),
        syncBundleDetailsCartMetafield: jest.fn(),
        _emitStorefrontEvent: jest.fn(),
        _handlePostAddToCartAction: jest.fn(),
        _getLandingPageControls: () => ({ checkout: null }),
      });
    } finally {
      (global as any).fetch = originalFetch;
      (global as any).window = originalWindow;
      (global as any).document = originalDocument;
      (global as any).getComputedStyle = originalGetComputedStyle;
      (global as any).setTimeout = originalSetTimeout;
    }

    const addRequest = fetchMock.mock.calls.find(([url]: any) => url === "/cart/add.js")!;
    expect(addRequest).toBeDefined();
    const body = JSON.parse(String(addRequest[1]?.body));
    const displayProperties = JSON.parse(body.items[0].properties._bundle_display_properties);

    expect(body.items).toHaveLength(2);
    expect(body.items.every((item: { properties: Record<string, string> }) =>
      item.properties._bundle_step_type === "fixed_price_display_only"
    )).toBe(false);
    expect(body.items[0].properties._bundle_price_adjustment_mode).toBeUndefined();
    expect(displayProperties).toEqual({
      box: "1",
      items: "1 x First product, 1 x Second product",
      retailPrice: "",
      labels: {
        items: "Items",
        retailPrice: "Retail Price",
        youSave: "You Save",
      },
    });
    expect(displayProperties).not.toHaveProperty("youSave");
  });
});
