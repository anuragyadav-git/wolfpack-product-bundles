import {
  createBundlePreviewToken,
  BUNDLE_PREVIEW_TOKEN_TTL_MS,
  verifyBundlePreviewToken,
} from "../../../app/lib/bundle-preview-token.server";

describe("bundle preview token", () => {
  const input = {
    shop: "test-shop.myshopify.com",
    bundleId: "bundle-1",
    apiSecret: "test-secret",
    now: 1_000,
  };

  it("accepts a valid shop and bundle-bound token", () => {
    const token = createBundlePreviewToken(input);
    expect(verifyBundlePreviewToken({ ...input, token })).toBe(true);
  });

  it("rejects tampering, expiry, and mismatched bindings", () => {
    const token = createBundlePreviewToken(input);
    expect(verifyBundlePreviewToken({ ...input, token: `${token}x` })).toBe(false);
    expect(verifyBundlePreviewToken({
      ...input,
      token,
      now: input.now + BUNDLE_PREVIEW_TOKEN_TTL_MS,
    })).toBe(false);
    expect(verifyBundlePreviewToken({
      ...input,
      token,
      shop: "other.myshopify.com",
    })).toBe(false);
    expect(verifyBundlePreviewToken({
      ...input,
      token,
      bundleId: "bundle-2",
    })).toBe(false);
  });

  it("has a 1-hour time-to-live and remains valid within the hour", () => {
    expect(BUNDLE_PREVIEW_TOKEN_TTL_MS).toBe(60 * 60 * 1000);
    const token = createBundlePreviewToken(input);
    expect(verifyBundlePreviewToken({
      ...input,
      token,
      now: input.now + (59 * 60 * 1000),
    })).toBe(true);
    expect(verifyBundlePreviewToken({
      ...input,
      token,
      now: input.now + (60 * 60 * 1000),
    })).toBe(false);
  });
});
