describe("Only Bundles attribution Web Pixel", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("posts Shopify final line prices for bundle-revenue attribution", async () => {
    const subscriptions = new Map<string, (event: any) => Promise<void>>();
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    const originalFetch = global.fetch;
    global.fetch = fetchMock as typeof fetch;

    jest.doMock("@shopify/web-pixels-extension", () => ({
      register: (initialize: (api: any) => void) =>
        initialize({
          analytics: {
            subscribe: (eventName: string, handler: (event: any) => Promise<void>) => {
              subscriptions.set(eventName, handler);
            },
          },
          browser: {
            localStorage: {
              getItem: jest.fn().mockResolvedValue(null),
              removeItem: jest.fn(),
              setItem: jest.fn(),
            },
          },
          settings: {
            app_server_url: "https://app.example.com",
            shop_domain: "shop.example.com",
          },
        }),
    }));

    try {
      await import("../../../extensions/wolfpack-utm-pixel/src/index");
      const checkoutCompleted = subscriptions.get("checkout_completed");
      expect(checkoutCompleted).toBeDefined();

      await checkoutCompleted?.({
        data: {
          checkout: {
            order: { id: "gid://shopify/Order/123" },
            totalPrice: { amount: 30, currencyCode: "USD" },
            lineItems: [
              {
                title: "Bundle component",
                quantity: 2,
                finalLinePrice: { amount: 18.75 },
                properties: [],
                variant: {
                  id: "gid://shopify/ProductVariant/1",
                  product: { id: "gid://shopify/Product/1" },
                  price: { amount: 10 },
                },
              },
            ],
          },
        },
        context: { document: { location: { hostname: "ignored.example.com" } } },
      });

      const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
      const payload = JSON.parse(String(request.body));
      expect(payload.orderId).toBe("gid://shopify/Order/123");
      expect(payload.orderNumber).toBe("123");
      expect(payload.lineItems).toEqual([
        expect.objectContaining({
          variantId: "gid://shopify/ProductVariant/1",
          finalLinePrice: { amount: 18.75 },
        }),
      ]);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
