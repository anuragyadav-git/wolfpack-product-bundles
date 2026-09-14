import { loader } from "../../../app/routes/root/_index/route";

describe("root index redirect", () => {
  it("redirects directly to /app", async () => {
    const response = await loader({
      request: new Request("https://app.example.com/"),
      params: {},
      context: {},
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/app");
  });

  it("preserves the original query string", async () => {
    const request = new Request(
      "https://app.example.com/?shop=test-shop.myshopify.com&host=abc&embedded=1",
    );

    const response = await loader({ request, params: {}, context: {} });

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "/app?shop=test-shop.myshopify.com&host=abc&embedded=1",
    );
  });
});
