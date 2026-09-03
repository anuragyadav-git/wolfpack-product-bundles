import { createBundleWithPublicNumber } from "../../../app/services/bundles/fpb-public-number.server";

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
  },
}));

const db = jest.requireMock("../../../app/db.server").default as {
  $transaction: jest.Mock;
};

describe("createBundleWithPublicNumber", () => {
  const shopUpdate = jest.fn();
  const bundleCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    db.$transaction.mockImplementation(async (callback) => callback({
      shop: { update: shopUpdate },
      bundle: { create: bundleCreate },
    }));
    bundleCreate.mockImplementation(async ({ data }: any) => ({ id: "bundle-1", ...data }));
  });

  it("atomically assigns the shop's next public number to an FPB", async () => {
    shopUpdate.mockResolvedValue({ lastFpbPublicNumber: 1 });

    const bundle = await createBundleWithPublicNumber({
      name: "Build a box",
      shopId: "test.myshopify.com",
      bundleType: "full_page",
    });

    expect(shopUpdate).toHaveBeenCalledWith({
      where: { shopDomain: "test.myshopify.com" },
      data: { lastFpbPublicNumber: { increment: 1 } },
      select: { lastFpbPublicNumber: true },
    });
    expect(bundleCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ publicNumber: 1 }),
    });
    expect(bundle.publicNumber).toBe(1);
  });

  it("does not consume an FPB number for a product-page bundle", async () => {
    const bundle = await createBundleWithPublicNumber({
      name: "PDP bundle",
      shopId: "test.myshopify.com",
      bundleType: "product_page",
    });

    expect(shopUpdate).not.toHaveBeenCalled();
    expect(bundleCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ publicNumber: null }),
    });
    expect(bundle.publicNumber).toBeNull();
  });
});
