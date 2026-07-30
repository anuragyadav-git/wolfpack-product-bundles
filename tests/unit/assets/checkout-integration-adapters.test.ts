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

  it("uses current canonical strategies for Shopflo and theme carts", () => {
    expect(getCheckoutIntegrationProvider("shopflo")).toMatchObject({
      strategy: "token_checkout_url",
      fallbackAction: "checkout",
    });
    expect(getCheckoutIntegrationProvider("theme_cart_drawer")).toMatchObject({
      strategy: "shopify_standard_actions",
      fallbackAction: "cart",
      requiresCartRefresh: true,
    });
  });

  it("models the merchant callback as a bounded custom provider", () => {
    expect(getCheckoutIntegrationProvider("custom_script")).toMatchObject({
      callbackMode: "custom",
      strategy: "merchant_script",
      fallbackAction: "checkout",
    });
  });
});

describe("checkout integration capability detection", () => {
  it("prefers Shopify standard cart actions for the theme cart", () => {
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

  it("detects the canonical Shopflo checkout URL capability", () => {
    const runtimeWindow = {
      Shopflo: {
        openFloCheckout: jest.fn(),
      },
    };

    expect(detectCheckoutIntegrationCapability("shopflo", runtimeWindow, {
      checkoutUrl: "https://checkout.example.test/session",
    })).toMatchObject({
      available: true,
      capability: "token_checkout_url",
    });
  });

  it("does not treat the undocumented Shopflo callback as an available capability", () => {
    const runtimeWindow = {
      Shopflo: {
        openCheckout: jest.fn(),
      },
    };

    expect(detectCheckoutIntegrationCapability("shopflo", runtimeWindow)).toMatchObject({
      available: false,
      capability: "token_checkout_url",
    });
  });

  it("waits for a delayed provider SDK within the bounded timeout", async () => {
    const runtimeWindow: Record<string, unknown> = {};
    setTimeout(() => {
      runtimeWindow.upcartOpenCart = jest.fn();
    }, 5);

    await expect(waitForCheckoutIntegrationCapability("upcart", runtimeWindow, {
      timeoutMs: 50,
      pollIntervalMs: 2,
    })).resolves.toMatchObject({
      available: true,
      capability: "installed_sdk",
    });
  });

  it("returns unavailable when the SDK does not appear", async () => {
    await expect(waitForCheckoutIntegrationCapability("upcart", {}, {
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

  it("returns a typed failure when a provider callback throws", async () => {
    const runtimeWindow = {
      upcartOpenCart: jest.fn(() => {
        throw new Error("blocked");
      }),
    };

    await expect(invokeCheckoutIntegrationProvider("upcart", runtimeWindow)).resolves.toMatchObject({
      ok: false,
      phase: "invoke",
      reason: "callback-error",
    });
  });

  it("returns a typed failure when a provider callback rejects", async () => {
    const runtimeWindow = {
      upcartOpenCart: jest.fn(async () => {
        throw new Error("rejected");
      }),
    };

    await expect(invokeCheckoutIntegrationProvider("upcart", runtimeWindow)).resolves.toMatchObject({
      ok: false,
      phase: "invoke",
      reason: "callback-error",
    });
  });

  it("bounds provider invocation time", async () => {
    const runtimeWindow = {
      upcartOpenCart: jest.fn(() => new Promise(() => undefined)),
    };

    await expect(invokeCheckoutIntegrationProvider("upcart", runtimeWindow, {
      timeoutMs: 5,
    })).resolves.toMatchObject({
      ok: false,
      phase: "invoke",
      reason: "invocation-timeout",
    });
  });

  it("reports provider-declared blocked navigation", async () => {
    const runtimeWindow = {
      upcartOpenCart: jest.fn(async () => false),
    };

    await expect(invokeCheckoutIntegrationProvider("upcart", runtimeWindow)).resolves.toMatchObject({
      ok: false,
      phase: "invoke",
      reason: "invocation-blocked",
    });
  });
});
