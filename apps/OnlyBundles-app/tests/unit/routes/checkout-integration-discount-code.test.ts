import { createHmac } from "node:crypto";
import { action } from "../../../app/routes/api/api.checkout-integration-discount-code";
import { CheckoutIntegrationDiscountCodeService } from "../../../app/services/checkout-integration-discount-code-service.server";
import { unauthenticated } from "../../../app/shopify.server";

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../../app/services/checkout-integration-discount-code-service.server", () => ({
  CheckoutIntegrationDiscountCodeService: {
    createForProvider: jest.fn(),
  },
}));

jest.mock("../../../app/lib/checkout-integrations", () => ({
  isSupportedCheckoutIntegrationProvider: (value: unknown) => (
    value === "gokwik"
    || value === "shopflo"
  ),
}));

jest.mock("../../../app/shopify.server", () => ({
  authenticate: {
    public: {
      appProxy: jest.fn(),
    },
  },
  unauthenticated: {
    admin: jest.fn(),
  },
}));

function makeSignedRequest(body: Record<string, unknown>, shop = "test-shop.myshopify.com") {
  const params = new URLSearchParams({
    shop,
    path_prefix: "/apps/product-bundles",
    timestamp: "1770000000",
  });

  const message = [...params.entries()]
    .map(([key, value]: any) => `${key}=${value}`)
    .sort()
    .join("");

  params.set(
    "signature",
    createHmac("sha256", "test_api_secret").update(message).digest("hex"),
  );

  return new Request(
    `https://${shop}/apps/product-bundles/api/checkout-integration-discount-code?${params.toString()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("checkout integration discount code route", () => {
  const originalSecret = process.env.SHOPIFY_API_SECRET;
  const mockUnauthenticatedAdmin = unauthenticated.admin as jest.Mock;
  const mockCreateForProvider = CheckoutIntegrationDiscountCodeService.createForProvider as jest.Mock;
  const mockAppProxy = (require("../../../app/shopify.server").authenticate.public.appProxy) as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SHOPIFY_API_SECRET = "test_api_secret";
    mockAppProxy.mockResolvedValue({ session: { shop: "test-shop.myshopify.com" } });
    mockUnauthenticatedAdmin.mockResolvedValue({ admin: { graphql: jest.fn() } });
    mockCreateForProvider.mockResolvedValue({
      success: true,
      providerId: "gokwik",
      discountId: "gid://shopify/DiscountCodeNode/1",
      code: "WPB-GOKWIK-12345678",
      expiresAt: "2026-07-02T10:30:00.000Z",
    });
  });

  afterAll(() => {
    process.env.SHOPIFY_API_SECRET = originalSecret;
  });

  it("creates a discount code for a signed storefront request", async () => {
    const response = await action({
      request: makeSignedRequest({ providerId: "gokwik" }),
      params: {},
      context: {},
    } as any) as Response;

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      providerId: "gokwik",
      code: "WPB-GOKWIK-12345678",
      expiresAt: "2026-07-02T10:30:00.000Z",
    });
    expect(mockUnauthenticatedAdmin).toHaveBeenCalledWith("test-shop.myshopify.com");
    expect(mockCreateForProvider).toHaveBeenCalledWith(
      { graphql: expect.any(Function) },
      "test-shop.myshopify.com",
      "gokwik",
    );
  });

  it("rejects unsupported providers before calling Admin", async () => {
    const response = await action({
      request: makeSignedRequest({ providerId: "unknown" }),
      params: {},
      context: {},
    } as any) as Response;

    expect(response.status).toBe(400);
    expect(mockUnauthenticatedAdmin).not.toHaveBeenCalled();
    expect(mockCreateForProvider).not.toHaveBeenCalled();
  });

  it("rejects unsigned storefront requests", async () => {
    mockAppProxy.mockRejectedValueOnce(new Response("Unauthorized", { status: 400 }));
    const request = makeSignedRequest({ providerId: "gokwik" });
    const url = new URL(request.url);
    url.searchParams.set("signature", "bad-signature");

    await expect(action({
      request: new Request(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: "gokwik" }),
      }),
      params: {},
      context: {},
    } as any)).rejects.toBeInstanceOf(Response);

    expect(mockUnauthenticatedAdmin).not.toHaveBeenCalled();
  });

  it("accepts GoKwik as a supported checkout integration provider", async () => {
    const response = await action({
      request: makeSignedRequest({ providerId: "gokwik" }),
      params: {},
      context: {},
    } as any) as Response;

    expect(response.status).toBe(200);
    expect(mockCreateForProvider).toHaveBeenCalledWith(
      { graphql: expect.any(Function) },
      "test-shop.myshopify.com",
      "gokwik",
    );
  });

  it("accepts Shopflo as a supported checkout integration provider", async () => {
    mockCreateForProvider.mockResolvedValue({
      success: true,
      providerId: "shopflo",
      discountId: "gid://shopify/DiscountCodeNode/2",
      code: "WPB-SHOPFLO-87654321",
      expiresAt: "2026-07-02T10:30:00.000Z",
    });

    const response = await action({
      request: makeSignedRequest({ providerId: "shopflo" }),
      params: {},
      context: {},
    } as any) as Response;

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      providerId: "shopflo",
      code: "WPB-SHOPFLO-87654321",
    });
    expect(mockCreateForProvider).toHaveBeenCalledWith(
      { graphql: expect.any(Function) },
      "test-shop.myshopify.com",
      "shopflo",
    );
  });
});
