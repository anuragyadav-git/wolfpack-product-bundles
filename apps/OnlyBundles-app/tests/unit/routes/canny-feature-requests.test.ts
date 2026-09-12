import { authenticate } from "../../../app/shopify.server";
import { getCannyPublicConfig } from "../../../app/services/canny.server";
import { loader } from "../../../app/routes/app/app.feature-requests";
jest.mock("../../../app/shopify.server", () => ({ authenticate: { admin: jest.fn() } }));
jest.mock("../../../app/services/canny.server", () => ({ getCannyPublicConfig: jest.fn() }));

describe("Feature requests page loader", () => {
  const request = new Request("https://app.example.com/app/feature-requests");
  beforeEach(() => jest.resetAllMocks());
  it("authenticates and returns only public widget configuration", async () => {
    jest.mocked(authenticate.admin).mockResolvedValue({} as never);
    const config = { appID: "app", boardToken: "board", portalURL: "https://qa.canny.io" };
    jest.mocked(getCannyPublicConfig).mockReturnValue(config);
    const response = await loader({ request, params: {}, context: {} });
    expect(authenticate.admin).toHaveBeenCalledWith(request);
    expect(await response.json()).toEqual({ canny: config });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it("preserves unauthenticated Shopify responses", async () => {
    const denial = new Response(null, { status: 401 });
    jest.mocked(authenticate.admin).mockRejectedValue(denial);
    await expect(loader({ request, params: {}, context: {} })).rejects.toBe(denial);
    expect(getCannyPublicConfig).not.toHaveBeenCalled();
  });
  it("allows the page to render its unavailable state when configuration is missing", async () => {
    jest.mocked(authenticate.admin).mockResolvedValue({} as never);
    jest.mocked(getCannyPublicConfig).mockReturnValue(null);
    const response = await loader({ request, params: {}, context: {} });
    expect(await response.json()).toEqual({ canny: null });
  });
});
