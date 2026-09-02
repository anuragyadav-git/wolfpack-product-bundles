import { handleProductDelete } from "../../../../app/services/webhooks/handlers/product.server";
import db from "../../../../app/db.server";

jest.mock("../../../../app/db.server", () => ({
  __esModule: true,
  default: {
    stepProduct: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    bundleStep: { findMany: jest.fn() },
    bundle: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

const mockFindMany = db.stepProduct.findMany as jest.Mock;

jest.mock("../../../../app/lib/logger", () => ({
  AppLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe("handleProductDelete", () => {
  it("scopes the component lookup to the delivering shop", async () => {
    mockFindMany.mockResolvedValue([]);

    await expect(handleProductDelete("merchant.myshopify.com", { id: 123 })).resolves.toEqual({
      success: true,
      message: "Product not used in any bundles",
    });

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        productId: "gid://shopify/Product/123",
        step: {
          bundle: {
            shopId: "merchant.myshopify.com",
          },
        },
      },
      include: { step: true },
    });
  });
});
