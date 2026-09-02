import {
  claimCheckoutIntegrationInvocation,
  detectCheckoutIntegrationCapability,
  invokeCheckoutIntegrationProvider,
  waitForCheckoutIntegrationCapability,
} from "../../../app/assets/widgets/shared/checkout-integration-adapters.js";
import {
  CHECKOUT_INTEGRATION_PROVIDERS,
  getCheckoutIntegrationProvider,
} from "../../../app/lib/checkout-integrations";

describe("checkout integration adapter contract", () => {
  it("defines complete execution metadata for every provider", () => {
    for (const provider of CHECKOUT_INTEGRATION_PROVIDERS) {
      expect(provider).toEqual(expect.objectContaining({
        id: expect.any(String),
        callbackMode: expect.any(String),
        strategy: expect.any(String),
        requiresDiscountCode: expect.any(Boolean),
        requiresCartRefresh: expect.any(Boolean),
        timeoutMs: expect.any(Number),
        fallbackAction: expect.stringMatching(/^(checkout|cart)$/),
      }));
    }
  });

  it("uses canonical strategies for native and theme-cart providers", () => {
    expect(getCheckoutIntegrationProvider("native")).toMatchObject({
      strategy: "native_redirect",
      fallbackAction: "checkout",
    });
    expect(getCheckoutIntegrationProvider("theme_cart_drawer")).toMatchObject({
      strategy: "shopify_standard_actions",
      fallbackAction: "cart",
      requiresCartRefresh: true,
    });
    expect(getCheckoutIntegrationProvider("gokwik")).toMatchObject({
      strategy: "third_party_checkout",
      callbackMode: "checkout_handoff",
      requiresDiscountCode: true,
    });
    expect(getCheckoutIntegrationProvider("shopflo")).toMatchObject({
      strategy: "third_party_checkout",
      callbackMode: "checkout_handoff",
      requiresDiscountCode: true,
    });
  });
});

describe("checkout integration capability detection", () => {
  it("prefers native redirect for the native checkout provider", () => {
    const runtimeWindow = {};

    expect(detectCheckoutIntegrationCapability("native", runtimeWindow)).toMatchObject({
      available: true,
      capability: "native_redirect",
    });
  });

  it("prefers Shopify standard cart actions for the theme cart drawer", () => {
    const runtimeWindow = {
      Shopify: {
        actions: {
          updateCart: jest.fn(),
          openCart: jest.fn(),
        },
      },
    };

    expect(detectCheckoutIntegrationCapability("theme_cart_drawer", runtimeWindow)).toMatchObject({
      available: true,
      capability: "shopify_standard_actions",
    });
  });

  it("falls back to an explicit theme-cart callback when actions are missing", () => {
    const runtimeWindow = {};
    const options = {
      openThemeCartDrawer: jest.fn(),
    };

    expect(detectCheckoutIntegrationCapability("theme_cart_drawer", runtimeWindow, options)).toMatchObject({
      available: true,
      capability: "theme_cart_callback",
    });
  });

  it("prefers GoKwik checkout SDK callback when available", () => {
    const runtimeWindow = {
      gokwikSdk: {
        initCheckout: jest.fn(),
      },
    };

    expect(detectCheckoutIntegrationCapability("gokwik", runtimeWindow)).toMatchObject({
      available: true,
      capability: "gokwik_sdk_callback",
    });
  });

  it("falls back to an explicit GoKwik callback when SDK is unavailable", () => {
    const runtimeWindow = {};
    const options = {
      openGokwikCheckout: jest.fn(),
    };

    expect(detectCheckoutIntegrationCapability("gokwik", runtimeWindow, options)).toMatchObject({
      available: true,
      capability: "gokwik_callback",
    });
  });

  it("prefers Shopflo checkout SDK callback when available", () => {
    const runtimeWindow = {
      Shopflo: {
        openFloCheckout: jest.fn(),
      },
    };

    expect(detectCheckoutIntegrationCapability("shopflo", runtimeWindow)).toMatchObject({
      available: true,
      capability: "shopflo_sdk_callback",
    });
  });

  it("falls back to an explicit Shopflo callback when SDK is unavailable", () => {
    const runtimeWindow = {};
    const options = {
      openShopfloCheckout: jest.fn(),
    };

    expect(detectCheckoutIntegrationCapability("shopflo", runtimeWindow, options)).toMatchObject({
      available: true,
      capability: "shopflo_callback",
    });
  });

  it.each([
    ["zecpay", { zecpeCheckFunctionAndCall: jest.fn() }, "zecpay_callback"],
    ["shiprocket_fastrr", { shiprocketCheckoutBuyCartHandler: jest.fn() }, "shiprocket_fastrr_callback"],
    ["rebuy", { Rebuy: { Cart: { getCart: jest.fn() } } }, "rebuy_cart_callback"],
    ["upcart", { upcartOpenCart: jest.fn() }, "upcart_callback"],
    ["kaching_cart", { kachingCartApi: { refreshCart: jest.fn(), openCart: jest.fn() } }, "kaching_cart_callback"],
  ])("detects the documented %s storefront callback", (providerId, runtimeWindow, capability) => {
    expect(detectCheckoutIntegrationCapability(providerId, runtimeWindow)).toMatchObject({
      available: true,
      capability,
    });
  });

  it("waits for delayed callback availability within the bounded timeout", async () => {
    const runtimeWindow: Record<string, unknown> = {};
    const options = {
      timeoutMs: 50,
      pollIntervalMs: 2,
    } as Record<string, unknown>;
    setTimeout(() => {
      options.openThemeCartDrawer = jest.fn();
    }, 5);

    await expect(waitForCheckoutIntegrationCapability("theme_cart_drawer", runtimeWindow, options)).resolves.toMatchObject({
      available: true,
      capability: "theme_cart_callback",
    });
  });

  it("returns unavailable when the callback does not appear", async () => {
    await expect(waitForCheckoutIntegrationCapability("theme_cart_drawer", {}, {
      timeoutMs: 5,
      pollIntervalMs: 1,
    })).resolves.toMatchObject({
      available: false,
      reason: "capability-timeout",
    });
  });
});

describe("checkout integration invocation lifecycle", () => {
  it("allows only one invocation for a cart-add lifecycle key", () => {
    const state = new Set<string>();

    expect(claimCheckoutIntegrationInvocation(state, "cart-add-1")).toBe(true);
    expect(claimCheckoutIntegrationInvocation(state, "cart-add-1")).toBe(false);
    expect(claimCheckoutIntegrationInvocation(state, "cart-add-2")).toBe(true);
  });

  it("updates and opens the theme cart through standard actions", async () => {
    const updateCart = jest.fn(async () => ({ cart: { id: "cart-1" } }));
    const openCart = jest.fn(async () => undefined);
    const runtimeWindow = {
      Shopify: {
        actions: {
          updateCart,
          openCart,
        },
      },
    };

    await expect(invokeCheckoutIntegrationProvider("theme_cart_drawer", runtimeWindow)).resolves.toMatchObject({
      ok: true,
      capability: "shopify_standard_actions",
    });
    expect(updateCart).toHaveBeenCalledTimes(1);
    expect(openCart).toHaveBeenCalledTimes(1);
  });

  it("returns capability-unavailable when theme cart actions and callbacks are absent", async () => {
    const runtimeWindow = {};

    await expect(invokeCheckoutIntegrationProvider("theme_cart_drawer", runtimeWindow)).resolves.toMatchObject({
      ok: false,
      phase: "capability",
      reason: "capability-unavailable",
      capability: "theme_cart_callback",
    });
  });

  it("returns a typed failure when a provider callback throws", async () => {
    const runtimeWindow = {};
    const options = {
      openThemeCartDrawer: jest.fn(() => {
        throw new Error("blocked");
      }),
    };

    await expect(invokeCheckoutIntegrationProvider("theme_cart_drawer", runtimeWindow, options)).resolves.toMatchObject({
      ok: false,
      phase: "invoke",
      reason: "callback-error",
    });
  });

  it("returns a typed failure when a provider callback rejects", async () => {
    const runtimeWindow = {};
    const options = {
      openThemeCartDrawer: jest.fn(async () => {
        throw new Error("rejected");
      }),
    };

    await expect(invokeCheckoutIntegrationProvider("theme_cart_drawer", runtimeWindow, options)).resolves.toMatchObject({
      ok: false,
      phase: "invoke",
      reason: "callback-error",
    });
  });

  it("bounds provider invocation time", async () => {
    const runtimeWindow = {};
    const options = {
      openThemeCartDrawer: jest.fn(() => new Promise(() => undefined)),
    };

    await expect(invokeCheckoutIntegrationProvider("theme_cart_drawer", runtimeWindow, {
      ...options,
      timeoutMs: 5,
    })).resolves.toMatchObject({
      ok: false,
      phase: "invoke",
      reason: "invocation-timeout",
    });
  });

  it("reports provider-declared blocked navigation", async () => {
    const runtimeWindow = {};
    const options = {
      openThemeCartDrawer: jest.fn(async () => false),
    };

    await expect(invokeCheckoutIntegrationProvider("theme_cart_drawer", runtimeWindow, options)).resolves.toMatchObject({
      ok: false,
      phase: "invoke",
      reason: "invocation-blocked",
    });
  });

  it("invokes GoKwik through explicit callbacks", async () => {
    const runtimeWindow = {};
    const options = {
      openGokwikCheckout: jest.fn(() => true),
    };

    await expect(invokeCheckoutIntegrationProvider("gokwik", runtimeWindow, options)).resolves.toMatchObject({
      ok: true,
      capability: "gokwik_callback",
    });
    expect(options.openGokwikCheckout).toHaveBeenCalledTimes(1);
  });

  it("invokes Shopflo through explicit callbacks", async () => {
    const runtimeWindow = {};
    const options = {
      openShopfloCheckout: jest.fn(() => true),
    };

    await expect(invokeCheckoutIntegrationProvider("shopflo", runtimeWindow, options)).resolves.toMatchObject({
      ok: true,
      capability: "shopflo_callback",
    });
    expect(options.openShopfloCheckout).toHaveBeenCalledTimes(1);
  });

  it("passes the checkout URL to the Shopflo SDK", async () => {
    const openFloCheckout = jest.fn(() => true);
    const runtimeWindow = { Shopflo: { openFloCheckout } };

    await expect(invokeCheckoutIntegrationProvider("shopflo", runtimeWindow, {
      checkoutUrl: "https://shop.test/checkouts/123",
    })).resolves.toMatchObject({ ok: true, capability: "shopflo_sdk_callback" });
    expect(openFloCheckout).toHaveBeenCalledWith("https://shop.test/checkouts/123");
  });

  it("refreshes Rebuy through window.Rebuy.Cart", async () => {
    const getCart = jest.fn(() => true);

    await expect(invokeCheckoutIntegrationProvider("rebuy", {
      Rebuy: { Cart: { getCart } },
    })).resolves.toMatchObject({ ok: true, capability: "rebuy_cart_callback" });
    expect(getCart).toHaveBeenCalledTimes(1);
  });

  it("invokes Zecpay and Shiprocket checkout callbacks", async () => {
    const zecpay = jest.fn(() => true);
    const shiprocket = jest.fn(() => true);

    await expect(invokeCheckoutIntegrationProvider("zecpay", { zecpeCheckFunctionAndCall: zecpay }))
      .resolves.toMatchObject({ ok: true });
    await expect(invokeCheckoutIntegrationProvider("shiprocket_fastrr", {
      shiprocketCheckoutBuyCartHandler: shiprocket,
    })).resolves.toMatchObject({ ok: true });
    expect(zecpay).toHaveBeenCalledWith("handleOcc");
    expect(shiprocket).toHaveBeenCalledTimes(1);
  });

  it("refreshes before opening Kaching Cart", async () => {
    const calls: string[] = [];
    const runtimeWindow = {
      kachingCartApi: {
        refreshCart: jest.fn(async () => calls.push("refresh")),
        openCart: jest.fn(() => calls.push("open")),
      },
    };

    await expect(invokeCheckoutIntegrationProvider("kaching_cart", runtimeWindow))
      .resolves.toMatchObject({ ok: true });
    expect(calls).toEqual(["refresh", "open"]);
  });

  it("returns invocation errors when GoKwik callback throws", async () => {
    const runtimeWindow = {};
    const options = {
      openGokwikCheckout: jest.fn(() => {
        throw new Error("blocked");
      }),
    };

    await expect(invokeCheckoutIntegrationProvider("gokwik", runtimeWindow, options)).resolves.toMatchObject({
      ok: false,
      phase: "invoke",
      reason: "callback-error",
    });
  });

  it("returns invocation errors when Shopflo callback rejects", async () => {
    const runtimeWindow = {};
    const options = {
      openShopfloCheckout: jest.fn(async () => {
        throw new Error("blocked");
      }),
    };

    await expect(invokeCheckoutIntegrationProvider("shopflo", runtimeWindow, options)).resolves.toMatchObject({
      ok: false,
      phase: "invoke",
      reason: "callback-error",
    });
  });
});
