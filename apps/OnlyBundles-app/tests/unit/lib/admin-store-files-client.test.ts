import {
  getUploadStoreFileStatus,
  uploadStoreFile,
} from "../../../app/lib/admin-store-files.client";

describe("Admin store-files client", () => {
  beforeEach(() => {
    global.fetch = jest.fn(async () => Response.json({ ok: true })) as jest.Mock;
  });

  it("uploads the original multipart body", async () => {
    const form = new FormData();
    form.append("file", new Blob(["image"]), "image.png");

    await uploadStoreFile(form);

    expect(global.fetch).toHaveBeenCalledWith("/app/upload-store-file", {
      method: "POST",
      body: form,
    });
  });

  it("polls upload status with an encoded file ID", async () => {
    await getUploadStoreFileStatus("gid://shopify/File/1");

    expect(global.fetch).toHaveBeenCalledWith(
      "/app/upload-store-file?fileId=gid%3A%2F%2Fshopify%2FFile%2F1",
      { method: "GET" },
    );
  });

  it("throws the backend error detail for non-success responses", async () => {
    global.fetch = jest.fn(async () => Response.json(
      { error: "Shopify file upload failed" },
      { status: 502 },
    )) as jest.Mock;

    await expect(uploadStoreFile(new FormData())).rejects.toThrow(
      "Shopify file upload failed",
    );
  });
});
