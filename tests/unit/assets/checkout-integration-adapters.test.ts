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
});
