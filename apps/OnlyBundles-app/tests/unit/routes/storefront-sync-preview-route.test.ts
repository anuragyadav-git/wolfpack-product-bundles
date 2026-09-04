import { action, loader } from "../../../app/routes/app/app.bundles.$bundleType.configure.$bundleId.prepare-preview";
import { authenticate } from "../../../app/shopify.server";
import { handlePrepareStorefrontPreview } from "../../../app/routes/app/shared/storefront-sync-action.server";

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

jest.mock("../../../app/routes/app/shared/storefront-sync-action.server", () => ({
  handlePrepareStorefrontPreview: jest.fn(),
}));

const mockRequireAdminSession = authenticate.admin as jest.MockedFunction<
  typeof authenticate.admin
>;
const mockHandlePrepareStorefrontPreview =
  handlePrepareStorefrontPreview as jest.MockedFunction<
    typeof handlePrepareStorefrontPreview
  >;

describe("/app/bundles/:bundleType/configure/:bundleId/prepare-preview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdminSession.mockResolvedValue({
      admin: { graphql: jest.fn() } as any,
      session: { shop: "test-shop.myshopify.com" } as any,
    } as any);
    mockHandlePrepareStorefrontPreview.mockResolvedValue(
      new Response(JSON.stringify({ success: true, ready: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("prepares a full-page bundle preview through a compact JSON resource route", async () => {
    const response = await action({
      request: new Request(
        "https://app.example.com/app/bundles/full-page-bundle/configure/bundle-1/prepare-preview",
        { method: "POST" },
      ),
      params: { bundleType: "full-page-bundle", bundleId: "bundle-1" },
      context: {},
    });
    const body = await response.json();

    expect(body).toEqual({ success: true, ready: true });
    expect(mockHandlePrepareStorefrontPreview).toHaveBeenCalledWith(
      { graphql: expect.any(Function) },
      { shop: "test-shop.myshopify.com" },
      "bundle-1",
      "full_page",
    );
  });

  it("prepares a product-page bundle preview", async () => {
    await action({
      request: new Request(
        "https://app.example.com/app/bundles/product-page-bundle/configure/bundle-2/prepare-preview",
        { method: "POST" },
      ),
      params: { bundleType: "product-page-bundle", bundleId: "bundle-2" },
      context: {},
    });

    expect(mockHandlePrepareStorefrontPreview).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      "bundle-2",
      "product_page",
    );
  });

  it("authenticates before rejecting invalid bundle route params", async () => {
    const request = new Request("https://app.example.com/app/bad", {
      method: "POST",
    });
    const response = await action({
      request,
      params: { bundleType: "unknown", bundleId: "bundle-1" },
      context: {},
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      success: false,
      statusCode: 400,
      error: "Invalid bundle preview route",
    });
    expect(mockRequireAdminSession).toHaveBeenCalledWith(request);
  });

  it("propagates authentication failure before route validation", async () => {
    const authFailure = new Response(null, { status: 401 });
    mockRequireAdminSession.mockRejectedValue(authFailure);

    await expect(
      action({
        request: new Request("https://app.example.com/app/bad", {
          method: "POST",
        }),
        params: { bundleType: "unknown", bundleId: "bundle-1" },
        context: {},
      }),
    ).rejects.toBe(authFailure);

    expect(mockHandlePrepareStorefrontPreview).not.toHaveBeenCalled();
  });

  it("authenticates before rejecting GET requests", async () => {
    const request = new Request(
      "https://app.example.com/app/bundles/full-page-bundle/configure/bundle-1/prepare-preview",
    );
    const response = await loader({
      request,
      params: { bundleType: "full-page-bundle", bundleId: "bundle-1" },
      context: {},
    });
    const body = await response.json();

    expect(response.status).toBe(405);
    expect(body).toEqual({ success: false, error: "Method not allowed" });
    expect(mockRequireAdminSession).toHaveBeenCalledWith(request);
  });
});
