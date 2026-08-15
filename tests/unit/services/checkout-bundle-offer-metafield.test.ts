import { BundleType } from "../../../app/constants/bundle";
import { updateBundleProductMetafields } from "../../../app/services/bundles/metafield-sync/operations/bundle-product.server";

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn(), startTimer: jest.fn(() => jest.fn()),
  },
}));

jest.mock("../../../app/utils/variant-lookup.server", () => ({
  getFirstVariantId: jest.fn().mockResolvedValue({
    success: true,
    variantId: "gid://shopify/ProductVariant/1",
    price: "10.00",
  }),
  batchGetFirstVariantsWithPrices: jest.fn().mockResolvedValue(new Map()),
}));

function makeAdmin() {
  return {
    graphql: jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: {
          metafieldsSet: { metafields: [{ key: "bundle_ui_config", value: "{}" }], userErrors: [] },
          productVariantsBulkUpdate: { productVariants: [], userErrors: [] },
        },
      }),
    }),
  };
}

function writtenConfig(admin: ReturnType<typeof makeAdmin>) {
  for (const call of (admin.graphql as jest.Mock).mock.calls) {
    const metafield = call[1]?.variables?.metafields?.find((entry: any) => entry.key === "bundle_ui_config");
    if (metafield) return JSON.parse(metafield.value);
  }
  return null;
}

describe("checkout offer bundle_ui_config sync", () => {
  it("writes FPB checkout offers with tier maximum and variants", async () => {
    const admin = makeAdmin();
    await updateBundleProductMetafields(admin as any, "gid://shopify/Product/999", {
      id: "bundle-1",
      name: "Bundle",
      description: "",
      status: "ACTIVE",
      bundleType: BundleType.FULL_PAGE,
      shopifyProductId: "gid://shopify/Product/999",
      steps: [],
      personalizationData: {
        addonProducts: {
          isEnabled: true,
          tiers: [{
            tierId: "tier-1",
            maxQuantity: 2,
            selectedAddonProducts: [{
              title: "Extra",
              variants: [{ variantGraphqlId: "gid://shopify/ProductVariant/201" }],
            }],
          }],
        },
      },
      pricing: null,
    });

    expect(writtenConfig(admin).checkoutOffers).toEqual([
      expect.objectContaining({
        key: "fpb:tier-1",
        maxQuantity: 2,
        variants: [expect.objectContaining({ id: "gid://shopify/ProductVariant/201" })],
      }),
    ]);
  });
});
