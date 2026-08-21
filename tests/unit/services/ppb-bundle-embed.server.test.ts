import { selectEligiblePpbBundleEmbed } from "../../../app/services/ppb-bundle-embed.server";

const bundle = (overrides: Record<string, unknown> = {}) => ({
  id: "bundle-b",
  name: "Bundle B",
  bundleType: "product_page",
  status: "active",
  createdAt: new Date("2026-01-02T00:00:00.000Z"),
  bundleUpsellConfig: {
    upsellConfiguration: {
      isEnabled: true,
      title: "Build a box",
      subTitle: "Pick products",
      displayConfiguration: { showOnAllBundleProducts: true, selectedProducts: [], showOnSpecificProductPages: [], collectionsSelectedData: [], showOnSpecificCollectionPages: [] },
      useLinkProductAsDefaultProduct: true,
    },
    multiLangText: { fr: { upsellConfiguration: { title: "Construisez", subTitle: "Choisissez" } } },
  },
  steps: [{ enabled: true, isFreeGift: false, StepProduct: [{ productId: "gid://shopify/Product/123" }], collections: [{ id: "gid://shopify/Collection/456" }], StepCategory: [] }],
  ...overrides,
});

describe("selectEligiblePpbBundleEmbed", () => {
  it("excludes disabled, draft, full-page, gift-only, and disabled-step bundles", () => {
    const result = selectEligiblePpbBundleEmbed([
      bundle({ id: "draft", status: "draft" }),
      bundle({ id: "fpb", bundleType: "full_page" }),
      bundle({ id: "disabled", bundleUpsellConfig: { upsellConfiguration: { isEnabled: false } } }),
      bundle({ id: "gift", steps: [{ enabled: true, isFreeGift: true, StepProduct: [{ productId: "123" }] }] }),
      bundle({ id: "off-step", steps: [{ enabled: false, StepProduct: [{ productId: "123" }] }] }),
    ], { productId: "123", productHandle: "sample", collectionIds: [], locale: "en" });
    expect(result).toBeNull();
  });

  it("matches all-bundle targets through paid products or collections", () => {
    expect(selectEligiblePpbBundleEmbed([bundle()], { productId: "123", productHandle: "sample", collectionIds: [], locale: "en" })?.bundle.id).toBe("bundle-b");
    expect(selectEligiblePpbBundleEmbed([bundle()], { productId: "999", productHandle: "sample", collectionIds: ["456"], locale: "en" })?.bundle.id).toBe("bundle-b");
  });

  it("matches specific product ID, GID, or handle and specific collection ID", () => {
    const productTarget = bundle({ bundleUpsellConfig: { upsellConfiguration: { isEnabled: true, title: "Title", displayConfiguration: { showOnAllBundleProducts: false, selectedProducts: [{ productId: "gid://shopify/Product/123", handle: "sample" }] } } } });
    expect(selectEligiblePpbBundleEmbed([productTarget], { productId: "999", productHandle: "sample", collectionIds: [], locale: "en" })).not.toBeNull();
    const collectionTarget = bundle({ bundleUpsellConfig: { upsellConfiguration: { isEnabled: true, title: "Title", displayConfiguration: { showOnAllBundleProducts: false, collectionsSelectedData: [{ collectionId: "gid://shopify/Collection/456" }] } } } });
    expect(selectEligiblePpbBundleEmbed([collectionTarget], { productId: "999", productHandle: "sample", collectionIds: ["456"], locale: "en" })).not.toBeNull();
  });

  it("returns the earliest created bundle then ID and localizes its copy", () => {
    const result = selectEligiblePpbBundleEmbed([
      bundle(),
      bundle({ id: "bundle-z", createdAt: new Date("2026-01-01T00:00:00.000Z") }),
      bundle({ id: "bundle-a", createdAt: new Date("2026-01-01T00:00:00.000Z") }),
    ], { productId: "123", productHandle: "sample", collectionIds: [], locale: "fr-CA" });
    expect(result).toMatchObject({ title: "Construisez", subTitle: "Choisissez", preselectBrowsedProduct: true, bundle: { id: "bundle-a" } });
  });
});
