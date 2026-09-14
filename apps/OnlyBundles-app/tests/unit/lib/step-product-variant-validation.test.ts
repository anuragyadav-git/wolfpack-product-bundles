import { validatePersistedStepProductVariants } from "../../../app/lib/bundle-config/step-product-variant-validation.server";
import {
  batchCheckStorefrontVariants,
  validateVariantIdFromShopify,
} from "../../../app/lib/variant-existence.server";

jest.mock("../../../app/lib/variant-existence.server", () => ({
  validateVariantIdFromShopify: jest.fn(),
  batchCheckStorefrontVariants: jest.fn(),
}));

const validateVariant = validateVariantIdFromShopify as jest.Mock;
const batchCheck = batchCheckStorefrontVariants as jest.Mock;

describe("validatePersistedStepProductVariants", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    validateVariant.mockImplementation(async (reference: string | number) => ({
      numericId: String(reference).replace("gid://shopify/ProductVariant/", ""),
      isValidFormat: true,
    }));
    batchCheck.mockImplementation(async (_shop: string, ids: string[]) =>
      new Map(ids.map((id) => [id, { ok: true, id, status: 200 }]))
    );
  });

  it("batch-checks unique normalized Shopify variants", async () => {
    const result = await validatePersistedStepProductVariants({
      route: "fpb-save",
      shopDomain: "shop.example",
      stepsData: [
        {
          id: "step-1",
          StepProduct: [
            { variants: ["gid://shopify/ProductVariant/123", 123] },
          ],
        },
      ],
    });

    expect(result).toBeNull();
    expect(batchCheck).toHaveBeenCalledWith("shop.example", ["123"]);
  });

  it("returns the route-specific field error for a missing reference", async () => {
    const response = await validatePersistedStepProductVariants({
      route: "ppb-save",
      shopDomain: "shop.example",
      stepsData: [{ id: "step-1", StepProduct: [{ variants: [{}] }] }],
    });

    expect(response?.status).toBe(400);
    await expect(response?.json()).resolves.toMatchObject({
      success: false,
      context: { route: "ppb-save", reason: "invalid-format" },
      fieldErrors: [
        {
          path: "steps.step-1.products.1.variants.1",
          message: "Select a valid product variant.",
        },
      ],
    });
    expect(batchCheck).not.toHaveBeenCalled();
  });

  it("returns the existing unavailable-storefront response", async () => {
    batchCheck.mockResolvedValue(
      new Map([
        ["999", { ok: false, id: "999", status: 404, message: "not-found" }],
      ])
    );

    const response = await validatePersistedStepProductVariants({
      route: "fpb-save",
      shopDomain: "shop.example",
      stepsData: [
        { id: "step-1", StepProduct: [{ variants: [999] }] },
      ],
    });

    expect(response?.status).toBe(400);
    await expect(response?.json()).resolves.toMatchObject({
      success: false,
      context: {
        route: "fpb-save",
        variantId: "999",
        status: 404,
        reason: "not-found",
      },
      fieldErrors: [
        {
          path: "steps.step-1.products.1.variants.1",
          message: "This product variant is not available on the storefront.",
        },
      ],
    });
  });
});
