import { action, loader } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId.validate-widget-placement";
import { authenticate } from "../../../app/shopify.server";
import { handleValidateWidgetPlacement } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/widget-placement.server";

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/widget-placement.server",
  () => ({ handleValidateWidgetPlacement: jest.fn() }),
);

const mockRequireAdminSession = authenticate.admin as jest.MockedFunction<
  typeof authenticate.admin
>;
const mockHandleValidateWidgetPlacement =
  handleValidateWidgetPlacement as jest.MockedFunction<
    typeof handleValidateWidgetPlacement
  >;

describe("/app/bundles/product-page-bundle/configure/:bundleId/validate-widget-placement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdminSession.mockResolvedValue({
      admin: { graphql: jest.fn() } as any,
      session: { shop: "test-shop.myshopify.com" } as any,
    } as any);
    mockHandleValidateWidgetPlacement.mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("validates placement through an authenticated JSON resource route", async () => {
    const response = await action({
      request: new Request(
        "https://app.example.com/app/bundles/product-page-bundle/configure/bundle-1/validate-widget-placement",
        { method: "POST" },
      ),
      params: { bundleId: "bundle-1" },
      context: {},
    });

    await expect(response.json()).resolves.toEqual({ success: true });
    expect(mockHandleValidateWidgetPlacement).toHaveBeenCalledWith(
      { graphql: expect.any(Function) },
      { shop: "test-shop.myshopify.com" },
      "bundle-1",
    );
  });

  it("rejects a missing bundle ID before authentication", async () => {
    const response = await action({
      request: new Request("https://app.example.com/app/bad", {
        method: "POST",
      }),
      params: {},
      context: {},
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Invalid bundle widget placement route",
    });
    expect(mockRequireAdminSession).not.toHaveBeenCalled();
  });

  it("does not allow GET requests", async () => {
    const response = await loader({
      request: new Request(
        "https://app.example.com/app/bundles/product-page-bundle/configure/bundle-1/validate-widget-placement",
      ),
      params: { bundleId: "bundle-1" },
      context: {},
    });

    expect(response.status).toBe(405);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: "Method not allowed",
    });
  });
});
