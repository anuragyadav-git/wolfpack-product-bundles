import {
  initializeSidekickBundleIntentBridge,
  readSidekickProductImportRequest,
  registerSidekickBundleDraftTool,
  resolveSidekickAppBridge,
  validateSidekickBundleDraft,
} from "../../../app/lib/sidekick-create-bundle";

describe("Sidekick bundle creation helpers", () => {
  it("normalizes valid optional draft fields", () => {
    expect(
      validateSidekickBundleDraft({
        title: "  Build a Box  ",
        bundle_type: "full_page",
      }),
    ).toEqual({
      draft: { title: "Build a Box", bundleType: "full_page" },
      errors: [],
    });
  });

  it("rejects invalid draft fields without returning a partial draft", () => {
    expect(
      validateSidekickBundleDraft({
        title: "No",
        bundle_type: "legacy_bundle",
      }),
    ).toEqual({
      draft: {},
      errors: ["invalid_title", "invalid_bundle_type"],
    });
  });

  it("accepts only Shopify Product import intents", () => {
    expect(
      readSidekickProductImportRequest({
        type: "SHOPIFY/PRODUCT",
        action: "import",
        data: { title: "Starter Bundle", bundle_type: "product_page" },
      }),
    ).toEqual({
      draft: { title: "Starter Bundle", bundleType: "product_page" },
      errors: [],
    });

    expect(
      readSidekickProductImportRequest({
        type: "application/email",
        action: "create",
        data: { title: "Starter Bundle" },
      }),
    ).toBeNull();
  });

  it("registers a staging-only tool and returns Shopify's cleanup", async () => {
    const cleanup = jest.fn();
    const register = jest.fn(() => cleanup);
    const applyDraft = jest.fn();

    const unregister = registerSidekickBundleDraftTool(
      { register },
      applyDraft,
    );

    expect(register).toHaveBeenCalledWith(
      "stage_bundle_draft",
      expect.any(Function),
    );

    const handler = (
      register.mock.calls as unknown as Array<
        [string, (input: unknown) => Promise<unknown>]
      >
    )[0][1];
    await expect(
      handler({ title: "Gift Set", bundle_type: "product_page" }),
    ).resolves.toEqual({
      staged: true,
      requires_confirmation: true,
      draft: { title: "Gift Set", bundleType: "product_page" },
    });
    expect(applyDraft).toHaveBeenCalledWith({
      title: "Gift Set",
      bundleType: "product_page",
    });

    unregister();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("does not apply an invalid tool payload", async () => {
    const register = jest.fn(() => jest.fn());
    const applyDraft = jest.fn();
    registerSidekickBundleDraftTool({ register }, applyDraft);

    const handler = (
      register.mock.calls as unknown as Array<
        [string, (input: unknown) => Promise<unknown>]
      >
    )[0][1];
    await expect(handler({ title: "x" })).resolves.toEqual({
      staged: false,
      requires_confirmation: true,
      errors: ["invalid_title"],
    });
    expect(applyDraft).not.toHaveBeenCalled();
  });

  it("registers the staging tool before consuming the active intent", () => {
    const events: string[] = [];
    const unregister = jest.fn();
    const unsubscribe = jest.fn();
    const applyDraft = jest.fn(() => events.push("apply_draft"));

    const cleanup = initializeSidekickBundleIntentBridge({
      tools: {
        register: jest.fn(() => {
          events.push("register_tool");
          return unregister;
        }),
      },
      request: {
        value: {
          type: "shopify/product",
          action: "import",
          data: {
            title: "Sidekick Starter",
            bundle_type: "product_page",
          },
        },
        subscribe: jest.fn(() => {
          events.push("subscribe_intent");
          return unsubscribe;
        }),
      },
      applyDraft,
      onInvalidIntent: jest.fn(),
    });

    expect(events).toEqual([
      "register_tool",
      "apply_draft",
      "subscribe_intent",
    ]);
    expect(applyDraft).toHaveBeenCalledWith({
      title: "Sidekick Starter",
      bundleType: "product_page",
    });

    cleanup();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(unregister).toHaveBeenCalledTimes(1);
  });

  it("does not resolve the browser-only bridge during server rendering", () => {
    expect(resolveSidekickAppBridge(undefined)).toBeNull();
    expect(resolveSidekickAppBridge({})).toBeNull();

    const bridge = { tools: { register: jest.fn() } };
    expect(resolveSidekickAppBridge({ shopify: bridge })).toBe(bridge);
  });
});
