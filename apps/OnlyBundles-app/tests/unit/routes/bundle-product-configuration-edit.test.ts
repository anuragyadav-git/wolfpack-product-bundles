import { loader } from "../../../app/routes/app/app.bundles.products.$productId/route";
import db from "../../../app/db.server";
import { authenticate } from "../../../app/shopify.server";

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: { bundle: { findFirst: jest.fn() } },
}));

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

const mockedDb = db as jest.Mocked<typeof db>;
const mockedAuthenticate = authenticate as jest.Mocked<typeof authenticate>;
const embeddedRedirect = jest.fn((destination: string) =>
  new Response(null, { status: 302, headers: { Location: destination } }),
);

function request() {
  return new Request("https://app.example.test/app/bundles/products/9603593502979");
}

beforeEach(() => {
  jest.clearAllMocks();
  (mockedAuthenticate.admin as jest.MockedFunction<any>).mockResolvedValue({
    session: { shop: "test-shop.myshopify.com" },
    redirect: embeddedRedirect,
  });
});

describe("bundle product configuration edit loader", () => {
  it.each([
    ["product_page", "/app/bundles/product-page-bundle/configure/ppb-1"],
    ["full_page", "/app/bundles/full-page-bundle/configure/fpb-1"],
  ])("redirects a %s bundle to its existing configure route", async (bundleType, destination) => {
    (mockedDb.bundle.findFirst as jest.Mock).mockResolvedValue({
      id: bundleType === "product_page" ? "ppb-1" : "fpb-1",
      bundleType,
    });

    const response = await loader({
      request: request(),
      params: { productId: "9603593502979" },
      context: {},
    } as any);

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(destination);
    expect(embeddedRedirect).toHaveBeenCalledWith(destination);
    expect(mockedDb.bundle.findFirst).toHaveBeenCalledWith({
      where: {
        shopId: "test-shop.myshopify.com",
        shopifyProductId: "gid://shopify/Product/9603593502979",
      },
      select: { id: true, bundleType: true },
    });
  });

  it.each([undefined, "not-a-product"])(
    "returns 400 for an absent or malformed Shopify product ID (%s)",
    async (productId) => {
    await expect(loader({
      request: request(),
      params: { productId },
      context: {},
    } as any)).rejects.toEqual(expect.objectContaining({ status: 400 }));

    expect(mockedDb.bundle.findFirst).not.toHaveBeenCalled();
    },
  );

  it("returns 404 when the authenticated shop does not own a matching bundle", async () => {
    (mockedDb.bundle.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(loader({
      request: request(),
      params: { productId: "9603593502979" },
      context: {},
    } as any)).rejects.toEqual(expect.objectContaining({ status: 404 }));
  });

  it("propagates the Shopify admin authentication guard", async () => {
    const authFailure = new Response(null, { status: 401 });
    (mockedAuthenticate.admin as jest.MockedFunction<any>).mockRejectedValue(authFailure);

    await expect(loader({
      request: request(),
      params: { productId: "9603593502979" },
      context: {},
    } as any)).rejects.toBe(authFailure);

    expect(mockedDb.bundle.findFirst).not.toHaveBeenCalled();
  });
});
