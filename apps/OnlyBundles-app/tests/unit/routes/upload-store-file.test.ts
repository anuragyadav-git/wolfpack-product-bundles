import { action, loader } from "../../../app/routes/app/app.upload-store-file";

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

const { authenticate: { admin: requireAdminSession } } = jest.requireMock("../../../app/shopify.server");

describe("app.upload-store-file route", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("loader (status polling)", () => {
    it("returns 400 if fileId is missing", async () => {
      requireAdminSession.mockResolvedValue({
        admin: { graphql: jest.fn() },
        session: { shop: "test.myshopify.com" },
      });

      const request = new Request("https://app.example.com/app/upload-store-file");
      const response = await loader({ request, params: {}, context: {} });
      const data = (await response.json()) as any;

      expect(response.status).toBe(400);
      expect(data.error).toBe("Missing fileId");
    });

    it("returns 404 if file is not found", async () => {
      const mockGraphql = jest.fn().mockResolvedValue({
        json: async () => ({ data: { node: null } }),
      });
      requireAdminSession.mockResolvedValue({
        admin: { graphql: mockGraphql },
        session: { shop: "test.myshopify.com" },
      });

      const request = new Request("https://app.example.com/app/upload-store-file?fileId=gid://shopify/MediaImage/999");
      const response = await loader({ request, params: {}, context: {} });
      const data = (await response.json()) as any;

      expect(response.status).toBe(404);
      expect(data.error).toBe("File not found");
    });

    it("returns READY file metadata when file status is READY", async () => {
      const mockGraphql = jest.fn().mockResolvedValue({
        json: async () => ({
          data: {
            node: {
              id: "gid://shopify/MediaImage/1",
              alt: "Banner Image",
              createdAt: "2026-08-18T00:00:00Z",
              fileStatus: "READY",
              image: { url: "https://cdn.shopify.com/s/files/1/banner.png" },
            },
          },
        }),
      });
      requireAdminSession.mockResolvedValue({
        admin: { graphql: mockGraphql },
        session: { shop: "test.myshopify.com" },
      });

      const request = new Request("https://app.example.com/app/upload-store-file?fileId=gid://shopify/MediaImage/1");
      const response = await loader({ request, params: {}, context: {} });
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.fileStatus).toBe("READY");
      expect(data.file).toEqual({
        id: "gid://shopify/MediaImage/1",
        url: "https://cdn.shopify.com/s/files/1/banner.png",
        filename: "banner.png",
        alt: "Banner Image",
        createdAt: "2026-08-18T00:00:00Z",
      });
    });

    it("returns PROCESSING status when file is not yet ready", async () => {
      const mockGraphql = jest.fn().mockResolvedValue({
        json: async () => ({
          data: {
            node: {
              id: "gid://shopify/MediaImage/1",
              fileStatus: "PROCESSING",
              image: null,
            },
          },
        }),
      });
      requireAdminSession.mockResolvedValue({
        admin: { graphql: mockGraphql },
        session: { shop: "test.myshopify.com" },
      });

      const request = new Request("https://app.example.com/app/upload-store-file?fileId=gid://shopify/MediaImage/1");
      const response = await loader({ request, params: {}, context: {} });
      const data = (await response.json()) as any;

      expect(data.fileStatus).toBe("PROCESSING");
    });
  });

  describe("action (upload handling)", () => {
    it("rejects non-image MIME types", async () => {
      requireAdminSession.mockResolvedValue({
        admin: { graphql: jest.fn() },
        session: { shop: "test.myshopify.com" },
      });

      const formData = new FormData();
      const textFile = new File(["dummy text content"], "notes.txt", { type: "text/plain" });
      formData.append("file", textFile);

      const request = new Request("https://app.example.com/app/upload-store-file", {
        method: "POST",
        body: formData,
      });

      const response = await action({ request, params: {}, context: {} });
      const data = (await response.json()) as any;

      expect(data.ok).toBe(false);
      expect(data.error).toBe("Only image files are accepted.");
    });

    it("successfully creates staged upload, uploads binary, and registers file in Shopify", async () => {
      const mockGraphql = jest.fn()
        // 1. stagedUploadsCreate
        .mockResolvedValueOnce({
          json: async () => ({
            data: {
              stagedUploadsCreate: {
                stagedTargets: [
                  {
                    url: "https://shopify-staged-uploads.s3.amazonaws.com/",
                    resourceUrl: "https://shopify-staged-uploads.s3.amazonaws.com/uuid/banner.png",
                    parameters: [
                      { name: "key", value: "uuid/banner.png" },
                      { name: "AWSAccessKeyId", value: "test-key" },
                    ],
                  },
                ],
                userErrors: [],
              },
            },
          }),
        })
        // 2. fileCreate
        .mockResolvedValueOnce({
          json: async () => ({
            data: {
              fileCreate: {
                files: [{ id: "gid://shopify/MediaImage/1", fileStatus: "PROCESSING" }],
                userErrors: [],
              },
            },
          }),
        });

      requireAdminSession.mockResolvedValue({
        admin: { graphql: mockGraphql },
        session: { shop: "test.myshopify.com" },
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
      }) as any;

      const formData = new FormData();
      const imageFile = new File(["fake-image-bytes"], "banner.png", { type: "image/png" });
      formData.append("file", imageFile);

      const request = new Request("https://app.example.com/app/upload-store-file", {
        method: "POST",
        body: formData,
      });

      const response = await action({ request, params: {}, context: {} });
      const data = (await response.json()) as any;

      expect(data.ok).toBe(true);
      expect(data.fileId).toBe("gid://shopify/MediaImage/1");
      expect(mockGraphql).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://shopify-staged-uploads.s3.amazonaws.com/",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});
