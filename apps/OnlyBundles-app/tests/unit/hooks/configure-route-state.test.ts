import {
  createInitialConfigureRouteState,
  reduceConfigureRouteState,
} from "../../../app/hooks/configure-route-state";

describe("configure route local reducer", () => {
  it("initializes loaded product, collection, and rule-message state", () => {
    const next = reduceConfigureRouteState(createInitialConfigureRouteState(), {
      type: "initialize",
      value: {
        bundleProduct: { id: "gid://shopify/Product/1" },
        productStatus: "ACTIVE",
        selectedCollections: { "step-1": [{ id: "collection-1" }] },
        ruleMessages: { "rule-1": { discountText: "Save", successMessage: "Saved" } },
      },
    });

    expect(next.bundleProduct).toEqual({ id: "gid://shopify/Product/1" });
    expect(next.productStatus).toBe("ACTIVE");
    expect(next.selectedCollections["step-1"]).toHaveLength(1);
    expect(next.ruleMessages["rule-1"].successMessage).toBe("Saved");
    expect(next.isDirty).toBe(false);
  });

  it("opens and closes one modal without a global mirror", () => {
    const opened = reduceConfigureRouteState(createInitialConfigureRouteState(), {
      type: "openModal",
      modal: "products",
      stepId: "step-2",
    });
    const closed = reduceConfigureRouteState(opened, {
      type: "closeModal",
      modal: "products",
    });

    expect(opened.modals.products).toBe(true);
    expect(opened.modals.collections).toBe(false);
    expect(opened.currentModalStepId).toBe("step-2");
    expect(closed.modals.products).toBe(false);
    expect(closed.currentModalStepId).toBe("step-2");
  });

  it("marks persisted draft edits dirty", () => {
    const product = reduceConfigureRouteState(createInitialConfigureRouteState(), {
      type: "setBundleProduct",
      value: { id: "product-1" },
    });
    const collections = reduceConfigureRouteState(product, {
      type: "setSelectedCollections",
      value: { "step-1": [] },
    });

    expect(product.isDirty).toBe(true);
    expect(collections.isDirty).toBe(true);
  });

  it("resets configure navigation defaults", () => {
    const changed = {
      ...createInitialConfigureRouteState(),
      activeTabIndex: 3,
      activeSection: "discount_pricing",
      forceNavigation: true,
    };

    expect(reduceConfigureRouteState(changed, { type: "resetNavigation" })).toEqual(
      expect.objectContaining({
        activeTabIndex: 0,
        activeSection: "step_setup",
        forceNavigation: false,
      }),
    );
  });
});
