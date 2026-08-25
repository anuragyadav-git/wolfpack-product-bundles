import {
  buildPpbPolicyRevisionMetafield,
  buildPpbStaticAuthorization,
  verifyPpbStaticToken,
} from "../../../app/services/ppb-static-authorization.server";

describe("PPB static purchase authorization", () => {
  const bundle = {
    id: "bundle-1",
    name: "Bundle",
    bundleType: "product_page",
    status: "active",
    steps: [{
      id: "step-1",
      minQuantity: 1,
      maxQuantity: 3,
      isFreeGift: false,
      StepProduct: [{
        productId: "gid://shopify/Product/1",
        variants: [{ id: "gid://shopify/ProductVariant/11" }],
      }],
    }],
    pricing: { enabled: true, method: "percentage_off", rules: [{ discountValue: 10 }] },
  };

  it("signs one bundle policy and one bounded line authorization per variant and role", () => {
    const result = buildPpbStaticAuthorization({
      bundle,
      shop: "shop.myshopify.com",
      parentVariantId: "gid://shopify/ProductVariant/99",
      secret: "secret",
    });

    expect(result.policy).toMatchObject({ version: 2, active: true, bundleId: "bundle-1" });
    expect(result.authorization.lines).toHaveLength(1);
    expect(result.authorization.groups).toEqual([{
      id: "step-1", role: "component", minQuantity: 1, maxQuantity: 3,
    }]);
    expect(verifyPpbStaticToken(result.authorization.bundleToken, "secret")).toMatchObject({
      version: 2,
      kind: "bundle",
      bundleId: "bundle-1",
      revision: result.policy.revision,
      groups: result.authorization.groups,
    });
    expect(verifyPpbStaticToken(result.authorization.lines[0].token, "secret")).toMatchObject({
      version: 2,
      kind: "line",
      groupId: "step-1",
      variantId: "gid://shopify/ProductVariant/11",
      role: "component",
      maxQuantity: 3,
    });
  });

  it("rejects a tampered signature", () => {
    const result = buildPpbStaticAuthorization({
      bundle,
      shop: "shop.myshopify.com",
      parentVariantId: "gid://shopify/ProductVariant/99",
      secret: "secret",
    });
    expect(verifyPpbStaticToken(`${result.authorization.bundleToken}x`, "secret")).toBeNull();
  });

  it("signs direct default products with their required quantity", () => {
    const result = buildPpbStaticAuthorization({
      bundle: {
        ...bundle,
        defaultProductsData: {
          isDefaultProductsEnabled: true,
          products: [{
            selectionId: "gid://shopify/Product/2",
            requiredQuantity: 2,
            variants: [{ selectionId: "gid://shopify/ProductVariant/22" }],
          }],
        },
      },
      shop: "shop.myshopify.com",
      parentVariantId: "gid://shopify/ProductVariant/99",
      secret: "secret",
    });

    expect(result.authorization.groups).toContainEqual({
      id: "default-products", role: "default", minQuantity: 2, maxQuantity: 2,
    });
    const defaultLine = result.authorization.lines.find((line) => line.groupId === "default-products");
    expect(defaultLine).toMatchObject({
      variantId: "gid://shopify/ProductVariant/22",
      productId: "gid://shopify/Product/2",
      role: "default",
      maxQuantity: 2,
    });
    expect(verifyPpbStaticToken(defaultLine!.token, "secret")).toMatchObject({
      groupId: "default-products",
      variantId: "gid://shopify/ProductVariant/22",
      maxQuantity: 2,
    });
  });

  it("advances the shop policy revision without disturbing other bundles", async () => {
    const admin = {
      graphql: jest.fn().mockResolvedValue({
        json: async () => ({
          data: { shop: {
            id: "gid://shopify/Shop/1",
            policy: { value: '{"other":"keep","bundle-1":"old"}' },
          } },
        }),
      }),
    };

    const metafield = await buildPpbPolicyRevisionMetafield({
      admin,
      bundleId: "bundle-1",
      revision: "new",
      active: true,
    });

    expect(metafield).toMatchObject({ ownerId: "gid://shopify/Shop/1", key: "ppb_policy_revisions" });
    expect(JSON.parse(metafield.value)).toEqual({ other: "keep", "bundle-1": "new" });
  });
});
