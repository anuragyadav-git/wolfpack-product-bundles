import { action, loader } from "../../../app/routes/app/app.sidekick.bundles";
import { authenticate } from "../../../app/shopify.server";
import {
  executeSidekickBundleOperation,
  SidekickBundleRequestError,
} from "../../../app/services/sidekick-bundles.server";

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

jest.mock("../../../app/services/sidekick-bundles.server", () => ({
  executeSidekickBundleOperation: jest.fn(),
  SidekickBundleRequestError: class SidekickBundleRequestError extends Error {
    status: number;
    code: string;

    constructor(status: number, code: string) {
      super(code);
      this.status = status;
      this.code = code;
    }
  },
}));

const mockAuthenticate = authenticate.admin as jest.Mock;
const mockExecute = executeSidekickBundleOperation as jest.Mock;
const cors = jest.fn((response: Response) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthenticate.mockResolvedValue({
    session: { shop: "shop-one.myshopify.com" },
    cors,
  });
});

describe("Sidekick bundle resource route", () => {
  it("authenticates, executes, and CORS-wraps a data request", async () => {
    mockExecute.mockResolvedValue({ results: [], has_more: false });
    const body = { operation: "search_bundles", input: { limit: 5 } };
    const request = new Request("https://app.example.com/app/sidekick/bundles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const response = await action({ request, params: {}, context: {} } as any);

    expect(mockAuthenticate).toHaveBeenCalledWith(request);
    expect(mockExecute).toHaveBeenCalledWith({
      shop: "shop-one.myshopify.com",
      body,
    });
    expect(cors).toHaveBeenCalledWith(response);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("returns a CORS-wrapped 400 for malformed JSON", async () => {
    const request = new Request("https://app.example.com/app/sidekick/bundles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{broken",
    });

    const response = await action({ request, params: {}, context: {} } as any);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_json",
    });
    expect(cors).toHaveBeenCalled();
  });

  it("maps known request errors without exposing internal details", async () => {
    mockExecute.mockRejectedValue(
      new SidekickBundleRequestError(404, "bundle_not_found"),
    );
    const request = new Request("https://app.example.com/app/sidekick/bundles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "get_bundle_summary",
        input: { bundle_id: "missing" },
      }),
    });

    const response = await action({ request, params: {}, context: {} } as any);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "bundle_not_found",
    });
  });

  it("sanitizes unexpected backend failures", async () => {
    mockExecute.mockRejectedValue(new Error("database connection details"));
    const request = new Request("https://app.example.com/app/sidekick/bundles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "search_bundles", input: {} }),
    });

    const response = await action({ request, params: {}, context: {} } as any);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "sidekick_request_failed",
    });
  });

  it("authenticates GET requests before returning method not allowed", async () => {
    const request = new Request("https://app.example.com/app/sidekick/bundles");

    const response = await loader({ request, params: {}, context: {} } as any);

    expect(mockAuthenticate).toHaveBeenCalledWith(request);
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("POST");
    expect(cors).toHaveBeenCalledWith(response);
  });

  it("propagates authentication failures", async () => {
    mockAuthenticate.mockRejectedValue(new Response(null, { status: 401 }));
    const request = new Request("https://app.example.com/app/sidekick/bundles", {
      method: "POST",
      body: "{}",
    });

    await expect(
      action({ request, params: {}, context: {} } as any),
    ).rejects.toMatchObject({ status: 401 });
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
