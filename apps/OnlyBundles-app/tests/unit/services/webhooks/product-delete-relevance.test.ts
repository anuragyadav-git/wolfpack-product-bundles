import { isTrackedBundleProductDelete } from "../../../../app/services/webhooks/product-delete-relevance.server";
import db from "../../../../app/db.server";

jest.mock("../../../../app/db.server", () => ({
  __esModule: true,
  default: {
    stepProduct: {
      findFirst: jest.fn(),
    },
  },
}));

const mockFindFirst = db.stepProduct.findFirst as jest.Mock;

describe("isTrackedBundleProductDelete", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("finds the deleted product only inside the delivering shop", async () => {
    mockFindFirst.mockResolvedValue({ id: "step-product-1" });

    await expect(isTrackedBundleProductDelete({
      rawBody: Buffer.from(JSON.stringify({ id: 123 })),
      shopDomain: "merchant.myshopify.com",
    })).resolves.toBe(true);

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        productId: "gid://shopify/Product/123",
        step: {
          bundle: {
            shopId: "merchant.myshopify.com",
          },
        },
      },
      select: { id: true },
    });
  });

  it("returns false when no bundle references the deleted product", async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(isTrackedBundleProductDelete({
      rawBody: Buffer.from(JSON.stringify({ id: "456" })),
      shopDomain: "merchant.myshopify.com",
    })).resolves.toBe(false);
  });

  it.each([
    Buffer.from("not-json"),
    Buffer.from(JSON.stringify({})),
    Buffer.from(JSON.stringify({ id: "" })),
  ])("rejects a malformed product delete payload", async (rawBody) => {
    await expect(isTrackedBundleProductDelete({
      rawBody,
      shopDomain: "merchant.myshopify.com",
    })).rejects.toThrow("Invalid products/delete payload");
    expect(mockFindFirst).not.toHaveBeenCalled();
  });
});
