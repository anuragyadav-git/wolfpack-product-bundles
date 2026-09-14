import { jwtVerify } from "jose";
import { getCannyPublicConfig, createCannySession } from "../../../app/services/canny.server";

describe("Canny store identity", () => {
  const env = { CANNY_APP_ID: "app", CANNY_BOARD_TOKEN: "board", CANNY_PORTAL_URL: "https://only-bundles-qa.canny.io", CANNY_SSO_PRIVATE_KEY: "test-secret" };
  const graphql = jest.fn();
  beforeEach(() => {
    graphql.mockReset().mockResolvedValue(new Response(JSON.stringify({ data: { shop: { id: "gid://shopify/Shop/123", name: "Test store", email: "owner@example.com" } } })));
  });
  it("exposes only public configuration", () => {
    expect(getCannyPublicConfig(env)).toEqual({ appID: "app", boardToken: "board", portalURL: "https://only-bundles-qa.canny.io" });
  });
  it.each(["CANNY_APP_ID", "CANNY_BOARD_TOKEN", "CANNY_PORTAL_URL", "CANNY_SSO_PRIVATE_KEY"])("disables incomplete configuration: %s", key => {
    expect(getCannyPublicConfig({ ...env, [key]: "" })).toBeNull();
  });
  it.each(["http://example.com", "javascript:alert(1)", "https://example.com/path?token=secret"])("rejects unsafe portal URL %s", url => {
    expect(getCannyPublicConfig({ ...env, CANNY_PORTAL_URL: url })).toBeNull();
  });
  it("signs a short-lived store-level identity using Shopify's canonical fields", async () => {
    const result = await createCannySession({ graphql }, env);
    const { payload, protectedHeader } = await jwtVerify(result.ssoToken, new TextEncoder().encode(env.CANNY_SSO_PRIVATE_KEY));
    expect(protectedHeader.alg).toBe("HS256");
    expect(payload).toMatchObject({ id: "gid://shopify/Shop/123", name: "Test store", email: "owner@example.com" });
    expect(payload.exp! - payload.iat!).toBe(900);
    expect(graphql).toHaveBeenCalledTimes(1);
  });
  it("fails closed before querying Shopify when configuration is absent", async () => {
    await expect(createCannySession({ graphql }, {})).rejects.toThrow();
    expect(graphql).not.toHaveBeenCalled();
  });
  it.each([{ errors: [{ message: "Denied" }] }, { data: { shop: null } }, { data: { shop: { id: "123", name: "Store", email: "" } } }])("rejects incomplete or errored Shopify responses", async body => {
    graphql.mockResolvedValue(new Response(JSON.stringify(body)));
    await expect(createCannySession({ graphql }, env)).rejects.toThrow();
  });
  it("propagates upstream failure without issuing a token", async () => {
    graphql.mockRejectedValue(new Error("Offline"));
    await expect(createCannySession({ graphql }, env)).rejects.toThrow();
  });
});
