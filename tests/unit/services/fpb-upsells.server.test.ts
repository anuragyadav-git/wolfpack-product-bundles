import { selectEligibleFpbUpsells } from "../../../app/services/fpb-upsells.server";

const bundle = (overrides: Record<string, unknown> = {}) => ({
  id: "bundle-2",
  publicNumber: 20,
  name: "Bundle 20",
  bundleType: "full_page",
  status: "active",
  upsellWidgetEnabled: true,
  upsellWidgetDisplayMode: "block",
  upsellWidgetDisplayOn: "all",
  autoSelectBrowsedProduct: true,
  bundleUpsellConfig: {
    multiLangText: { fr: { widgetTitle: "Titre", widgetButtonText: "Voir" } },
    widgetConfiguration: { title: "Base title", description: "Base", buttonText: "View", imageUrl: null, displayConfiguration: { showOnAllBundleProducts: true } },
  },
  steps: [{ position: 1, enabled: true, isFreeGift: false, StepProduct: [{ productId: "gid://shopify/Product/123" }], collections: [{ collectionId: "456" }], StepCategory: [] }],
  ...overrides,
});
describe("selectEligibleFpbUpsells", () => {
  it("gates status, bundle type, enabled state, and public number", () => {
    const offers = selectEligibleFpbUpsells([
      bundle(),
      bundle({ id: "draft", status: "draft", publicNumber: 21 }),
      bundle({ id: "ppb", bundleType: "product_page", publicNumber: 22 }),
      bundle({ id: "disabled", upsellWidgetEnabled: false, publicNumber: 23 }),
      bundle({ id: "private", publicNumber: null }),
      bundle({ id: "link-only", publicNumber: 25, offerPolicy: { specificLinkRequired: true } }),
      bundle({ id: "unlisted", status: "unlisted", publicNumber: 24 }),
    ], { productId: "123", collectionIds: [], locale: "en" });
    expect(offers.map((offer) => offer.publicNumber)).toEqual([20, 24]);
  });

  it("matches all-products against explicit products and paid-step collections but not gifts", () => {
    expect(selectEligibleFpbUpsells([bundle()], { productId: "123", collectionIds: [], locale: "en" })).toHaveLength(1);
    expect(selectEligibleFpbUpsells([bundle()], { productId: "999", collectionIds: ["456"], locale: "en" })).toHaveLength(1);
    expect(selectEligibleFpbUpsells([bundle({ steps: [{ position: 1, enabled: true, isFreeGift: true, StepProduct: [{ productId: "123" }], collections: [] }] })], { productId: "123", collectionIds: [], locale: "en" })).toHaveLength(0);
  });

  it("fails closed for empty specific targets and matches selected targets", () => {
    const specific = bundle({ upsellWidgetDisplayOn: "specific_products", bundleUpsellConfig: { widgetConfiguration: { title: "Title", buttonText: "View", displayConfiguration: { selectedProducts: [{ productId: "123" }] } } } });
    expect(selectEligibleFpbUpsells([specific], { productId: "123", collectionIds: [], locale: "en" })).toHaveLength(1);
    expect(selectEligibleFpbUpsells([bundle({ upsellWidgetDisplayOn: "specific_collections", bundleUpsellConfig: { widgetConfiguration: { buttonText: "View", displayConfiguration: {} } } })], { productId: "123", collectionIds: ["456"], locale: "en" })).toHaveLength(0);
  });

  it("resolves exact then language locale and returns ordered deduplicated minimal DTOs", () => {
    const offers = selectEligibleFpbUpsells([
      bundle(),
      bundle({ id: "bundle-1", publicNumber: 10, name: "Bundle 10" }),
      bundle({ id: "bundle-1", publicNumber: 10, name: "Duplicate" }),
    ], { productId: "123", collectionIds: [], locale: "fr-CA" });
    expect(offers.map((offer) => offer.publicNumber)).toEqual([10, 20]);
    expect(offers[0]).toEqual({ bundleId: "bundle-1", publicNumber: 10, bundleName: "Bundle 10", targetPath: "/apps/product-bundles/wpb/10", mode: "block", copy: { title: "Titre", description: "Base", buttonText: "Voir" }, imageUrl: null, preselectBrowsedProduct: true });
  });

  it("filters schedules, orders by priority, and stops lower-priority offers", () => {
    const offers = selectEligibleFpbUpsells([
      bundle({ id: "lower", publicNumber: 40, offerPolicy: { priority: 40 } }),
      bundle({ id: "winner", publicNumber: 30, offerPolicy: { priority: 20, stopLowerPriority: true } }),
      bundle({ id: "first", publicNumber: 20, offerPolicy: { priority: 10 } }),
      bundle({ id: "future", publicNumber: 10, offerPolicy: { priority: 1, startsAt: "2026-09-01T00:00:00.000Z" } }),
    ], {
      productId: "123",
      collectionIds: [],
      locale: "en",
      now: new Date("2026-08-31T12:00:00.000Z"),
    });
    expect(offers.map((offer) => offer.bundleId)).toEqual(["first", "winner"]);
  });
});
