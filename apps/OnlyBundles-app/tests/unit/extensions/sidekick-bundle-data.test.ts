import registerBundleDataTools from "../../../extensions/sidekick-bundle-data/src/index.js";

describe("Sidekick bundle data extension", () => {
  const register = jest.fn();
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (globalThis as any).shopify = { tools: { register } };
    (globalThis as any).fetch = fetchMock;
  });

  afterAll(() => {
    delete (globalThis as any).shopify;
    delete (globalThis as any).fetch;
  });

  it("registers the declared read-only tools", () => {
    registerBundleDataTools();

    expect(register.mock.calls.map(([name]) => name)).toEqual([
      "search_bundles",
      "get_bundle_summary",
    ]);
  });

  it("posts search inputs to the authenticated app backend", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ results: [], has_more: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    registerBundleDataTools();
    const searchHandler = register.mock.calls[0][1];

    await expect(searchHandler({ query: "gift", limit: 5 })).resolves.toEqual({
      results: [],
      has_more: false,
    });
    expect(fetchMock).toHaveBeenCalledWith("/app/sidekick/bundles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "search_bundles",
        input: { query: "gift", limit: 5 },
      }),
    });
  });

  it("throws a factual error code when the backend rejects a lookup", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "bundle_not_found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
    );
    registerBundleDataTools();
    const summaryHandler = register.mock.calls[1][1];

    await expect(summaryHandler({ bundle_id: "missing" })).rejects.toThrow(
      "bundle_not_found",
    );
  });
});
