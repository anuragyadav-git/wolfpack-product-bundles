import { authenticate } from "../../../app/shopify.server";
import { createCannySession } from "../../../app/services/canny.server";
import { loader } from "../../../app/routes/app/app.canny.session";
jest.mock("../../../app/shopify.server", () => ({ authenticate: { admin: jest.fn() } }));
jest.mock("../../../app/services/canny.server", () => ({ createCannySession: jest.fn() }));

describe("Canny session resource", () => {
  const request = new Request("https://app.example.com/app/canny/session");
  const args = { request, params: {}, context: {} };
  beforeEach(() => jest.resetAllMocks());
  it("authenticates before issuing a non-cacheable token", async () => {
    const admin = { graphql: jest.fn() };
    jest.mocked(authenticate.admin).mockResolvedValue({ admin } as never);
    jest.mocked(createCannySession).mockResolvedValue({ ssoToken: "signed" });
    const response = await loader(args);
    expect(authenticate.admin).toHaveBeenCalledWith(request);
    expect(createCannySession).toHaveBeenCalledWith(admin);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ ssoToken: "signed" });
  });
  it("preserves Shopify authentication redirects without issuing a token", async () => {
    const redirect = new Response(null, { status: 302, headers: { Location: "/auth/login" } });
    jest.mocked(authenticate.admin).mockRejectedValue(redirect);
    await expect(loader(args)).rejects.toBe(redirect);
    expect(createCannySession).not.toHaveBeenCalled();
  });
  it("returns a safe non-cacheable error without leaking credentials or Shopify data", async () => {
    jest.mocked(authenticate.admin).mockResolvedValue({ admin: {} } as never);
    jest.mocked(createCannySession).mockRejectedValue(new Error("secret owner@example.com"));
    const response = await loader(args);
    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ error: "canny_unavailable" });
  });
});
