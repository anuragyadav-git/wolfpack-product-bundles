import {
  classifyOfferState,
  mutateCheckoutOffer,
  type OfferCartLine,
} from "../../../extensions/bundle-checkout-ui/src/offer-mutations";
import {
  buildOfferGroups,
  getReadOnlyStatusKeys,
  isOfferControlPending,
} from "../../../extensions/bundle-checkout-ui/src/BundleOffers";

const attributes = (values: Record<string, string>) => Object.entries(values).map(([key, value]: any) => ({ key, value }));
const line = (overrides: Partial<OfferCartLine> = {}): OfferCartLine => ({
  id: "line-1",
  quantity: 2,
  merchandise: { id: "gid://shopify/ProductVariant/101" },
  attributes: attributes({ _checkout_offer_key: "offer-1" }),
  discountAllocations: [{ discountedAmount: { amount: 2 } }],
  ...overrides,
});

describe("checkout bundle offer mutations", () => {
  it("groups active offers independently by merged bundle instance", () => {
    const token = `${Buffer.from(JSON.stringify({ components: [{ quantity: 2 }] })).toString("base64url")}.signature`;
    const offer = {
      key: "fpb:tier-1",
      groupKey: "fpb:addons",
      tierId: "tier-1",
      kind: "addon",
      title: "Extra",
      maxQuantity: 2,
      eligibility: { type: "QUANTITY", value: 1 },
      discount: null,
      variants: [{ id: "gid://shopify/ProductVariant/201", title: "Extra" }],
    };
    const parent = (id: string, variantId: string) => line({
      id: `line-${id}`,
      merchandise: { id: variantId },
      attributes: attributes({
        _is_bundle_parent: "true",
        "_wolfpackProductBundle:OfferId": id,
        _wolfpack_bundle_runtime: token,
        _bundle_name: `Bundle ${id}`,
      }),
    });
    const metafield = (variantId: string) => ({
      target: { type: "variant", id: variantId },
      metafield: { key: "bundle_ui_config", value: JSON.stringify({ checkoutOffers: [offer] }) },
    });

    expect(buildOfferGroups(
      [parent("group-1", "gid://shopify/ProductVariant/901"), parent("group-2", "gid://shopify/ProductVariant/902")],
      [metafield("gid://shopify/ProductVariant/901"), metafield("gid://shopify/ProductVariant/902")],
    )).toMatchObject([
      { id: "group-1", name: "Bundle group-1", offers: [{ key: "fpb:tier-1" }] },
      { id: "group-2", name: "Bundle group-2", offers: [{ key: "fpb:tier-1" }] },
    ]);
  });

  it("marks stale over-limit and multi-variant single-select states read-only", () => {
    expect(classifyOfferState([line({ quantity: 4 })], 3)).toMatchObject({ readOnly: true, reason: "over-limit" });
    expect(classifyOfferState([
      line(),
      line({ id: "line-2", merchandise: { id: "gid://shopify/ProductVariant/102" } }),
    ], 3)).toMatchObject({ readOnly: true, reason: "multiple-variants" });
  });

  it("keeps pricing programs as read-only status rows", () => {
    expect(getReadOnlyStatusKeys({
      pricing: {
        method: "percentage_off",
        rules: [{ conditionType: "quantity" }, { conditionType: "quantity" }],
      },
      boxSelection: { isEnabled: true },
    })).toEqual(["volumeStatus", "bundleQuantityOptionsStatus"]);
    expect(getReadOnlyStatusKeys({
      pricing: { method: "buy_x_get_y", rules: [] },
    })).toEqual(["buyXGetYStatus"]);
  });

  it("locks only the offer control whose mutation is pending", () => {
    expect(isOfferControlPending("group-1:offer-1", "group-1", "offer-1")).toBe(true);
    expect(isOfferControlPending("group-1:offer-1", "group-1", "offer-2")).toBe(false);
    expect(isOfferControlPending("group-1:offer-1", "group-2", "offer-1")).toBe(false);
  });

  it("adds a newly selected offer at quantity one with a fresh token", async () => {
    let lines: OfferCartLine[] = [];
    const apply = jest.fn(async (change) => {
      lines = [line({
        id: "added-line",
        quantity: change.quantity,
        merchandise: { id: change.merchandiseId },
        attributes: change.attributes,
      })];
      return { type: "success" };
    });

    await mutateCheckoutOffer({
      offer: { key: "offer-1", maxQuantity: 3, discount: null },
      selectedVariantId: "gid://shopify/ProductVariant/102",
      requestedQuantity: 1,
      getLines: () => lines,
      requestToken: jest.fn().mockResolvedValue({ attributes: attributes({ _checkout_offer_key: "offer-1", _wolfpack_bundle_runtime: "token-1" }) }),
      applyCartLinesChange: apply,
    });

    expect(apply).toHaveBeenCalledWith(expect.objectContaining({
      type: "addCartLine",
      merchandiseId: "gid://shopify/ProductVariant/102",
      quantity: 1,
    }));
  });

  it("re-reads the current line ID and replaces variant, quantity, and attributes in one update", async () => {
    let lines = [line({ id: "unstable-new-id" })];
    const apply = jest.fn(async (change) => {
      lines = [line({
        id: "after-update",
        quantity: change.quantity,
        merchandise: { id: change.merchandiseId },
        attributes: change.attributes,
      })];
      return { type: "success" };
    });

    await mutateCheckoutOffer({
      offer: { key: "offer-1", maxQuantity: 3, discount: null },
      selectedVariantId: "gid://shopify/ProductVariant/102",
      requestedQuantity: 2,
      getLines: () => lines,
      requestToken: jest.fn().mockResolvedValue({ attributes: attributes({ _checkout_offer_key: "offer-1", _wolfpack_bundle_runtime: "token-2" }) }),
      applyCartLinesChange: apply,
    });

    expect(apply).toHaveBeenCalledWith(expect.objectContaining({
      type: "updateCartLine",
      id: "unstable-new-id",
      merchandiseId: "gid://shopify/ProductVariant/102",
      quantity: 2,
    }));
  });

  it("requests a fresh exact token for every quantity increase and decrease", async () => {
    let lines = [line({ quantity: 1 })];
    const requestToken = jest.fn(async ({ quantity }: any) => ({
      attributes: attributes({
        _checkout_offer_key: "offer-1",
        _wolfpack_bundle_runtime: `token-${quantity}`,
      }),
    }));
    const apply = jest.fn(async (change) => {
      lines = [line({
        id: `line-${change.quantity}`,
        quantity: change.quantity,
        merchandise: { id: change.merchandiseId },
        attributes: change.attributes,
      })];
      return { type: "success" };
    });
    const input = {
      offer: { key: "offer-1", maxQuantity: 3, discount: null },
      selectedVariantId: "gid://shopify/ProductVariant/101",
      getLines: () => lines,
      requestToken,
      applyCartLinesChange: apply,
    };

    await mutateCheckoutOffer({ ...input, requestedQuantity: 3 });
    await mutateCheckoutOffer({ ...input, requestedQuantity: 2 });

    expect(requestToken).toHaveBeenNthCalledWith(1, expect.objectContaining({ quantity: 3 }));
    expect(requestToken).toHaveBeenNthCalledWith(2, expect.objectContaining({ quantity: 2 }));
    expect(lines[0].quantity).toBe(2);
  });

  it("removes the current offer line when no add-on is selected", async () => {
    const current = line({ id: "current-id" });
    const apply = jest.fn().mockResolvedValue({ type: "success" });
    await mutateCheckoutOffer({
      offer: { key: "offer-1", maxQuantity: 3, discount: null },
      selectedVariantId: null,
      requestedQuantity: 0,
      getLines: () => [current],
      requestToken: jest.fn(),
      applyCartLinesChange: apply,
    });
    expect(apply).toHaveBeenCalledWith({ type: "removeCartLine", id: "current-id", quantity: 2 });
  });

  it("restores the previous variant, quantity, and attributes when discount verification fails", async () => {
    const before = line({
      id: "before-id",
      attributes: attributes({ _checkout_offer_key: "offer-1", keep: "old" }),
    });
    let lines = [before];
    const apply = jest.fn(async (change) => {
      if (apply.mock.calls.length === 1) {
        lines = [line({
          id: "mutated-id",
          quantity: change.quantity,
          merchandise: { id: change.merchandiseId },
          attributes: change.attributes,
          discountAllocations: [],
        })];
      } else {
        lines = [before];
      }
      return { type: "success" };
    });

    await expect(mutateCheckoutOffer({
      offer: { key: "offer-1", maxQuantity: 3, discount: { type: "PERCENTAGE", value: 10 } },
      selectedVariantId: "gid://shopify/ProductVariant/102",
      requestedQuantity: 2,
      getLines: () => lines,
      requestToken: jest.fn().mockResolvedValue({ attributes: attributes({ _checkout_offer_key: "offer-1", _wolfpack_bundle_runtime: "token-2" }) }),
      applyCartLinesChange: apply,
    })).rejects.toThrow("discount verification failed");

    expect(apply).toHaveBeenLastCalledWith(expect.objectContaining({
      type: "updateCartLine",
      id: "mutated-id",
      merchandiseId: "gid://shopify/ProductVariant/101",
      quantity: 2,
      attributes: before.attributes,
    }));
  });

  it("rejects quantities outside the configured offer range before requesting a token", async () => {
    const requestToken = jest.fn();
    await expect(mutateCheckoutOffer({
      offer: { key: "offer-1", maxQuantity: 2, discount: null },
      selectedVariantId: "gid://shopify/ProductVariant/101",
      requestedQuantity: 3,
      getLines: () => [],
      requestToken,
      applyCartLinesChange: jest.fn(),
    })).rejects.toThrow("quantity");
    expect(requestToken).not.toHaveBeenCalled();
  });

  it("keeps the prior cart state when Shopify rejects the mutation", async () => {
    const before = line({ id: "inventory-line" });
    const lines = [before];

    await expect(mutateCheckoutOffer({
      offer: { key: "offer-1", maxQuantity: 3, discount: null },
      selectedVariantId: "gid://shopify/ProductVariant/102",
      requestedQuantity: 2,
      getLines: () => lines,
      requestToken: jest.fn().mockResolvedValue({
        attributes: attributes({ _checkout_offer_key: "offer-1", _wolfpack_bundle_runtime: "token-2" }),
      }),
      applyCartLinesChange: jest.fn().mockResolvedValue({ type: "error", message: "Inventory unavailable" }),
    })).rejects.toThrow("Inventory unavailable");

    expect(lines).toEqual([before]);
  });
});
