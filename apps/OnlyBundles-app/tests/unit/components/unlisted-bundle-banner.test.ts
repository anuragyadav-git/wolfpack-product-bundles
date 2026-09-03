/**
 * Unit tests for the UnlistedBundleBanner helper.
 *
 * Issue: feedback-jun26-6
 * Spec : test-spec/unlisted-bundle-banner.spec.md
 *
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  buildShopifyProductAdminUrl,
  UnlistedBundleBanner,
} from "../../../app/components/UnlistedBundleBanner";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("buildShopifyProductAdminUrl", () => {
  it("converts a full GID and .myshopify shop into an admin product URL", () => {
    expect(buildShopifyProductAdminUrl("s.myshopify.com", "gid://shopify/Product/12345"))
      .toBe("https://admin.shopify.com/store/s/products/12345");
  });

  it("accepts a bare numeric id", () => {
    expect(buildShopifyProductAdminUrl("s.myshopify.com", "12345"))
      .toBe("https://admin.shopify.com/store/s/products/12345");
  });

  it("keeps the shop slug intact when the .myshopify suffix is absent", () => {
    expect(buildShopifyProductAdminUrl("my-store", "gid://shopify/Product/12345"))
      .toBe("https://admin.shopify.com/store/my-store/products/12345");
  });

  it("returns null for null productId", () => {
    expect(buildShopifyProductAdminUrl("s.myshopify.com", null)).toBeNull();
  });

  it("returns null for empty productId", () => {
    expect(buildShopifyProductAdminUrl("s.myshopify.com", "")).toBeNull();
  });

  it("renders parent product loading as an informational banner without a Manage action", () => {
    const view = renderToStaticMarkup(
      React.createElement(UnlistedBundleBanner, {
        shop: "s.myshopify.com",
        bundleProductId: "gid://shopify/Product/12345",
        loading: true,
        onManage: jest.fn(),
      }),
    );

    expect(view).toContain('<s-banner tone="info" heading="common.parentProductStatus.loadingTitle" dismissible="true"');
    expect(view).toContain("<s-spinner");
    expect(view).toContain("common.parentProductStatus.loadingTitle");
    expect(view).toContain("common.parentProductStatus.loadingBody");
    expect(view).not.toContain("common.actions.manage");
  });

  it("retains the Unlisted warning and Manage action after status resolves", () => {
    const view = renderToStaticMarkup(
      React.createElement(UnlistedBundleBanner, {
        shop: "s.myshopify.com",
        bundleProductId: "gid://shopify/Product/12345",
        loading: false,
        onManage: jest.fn(),
      }),
    );

    expect(view).toContain('tone="warning"');
    expect(view).toContain("common.unlistedBundle.title");
    expect(view).toContain("common.actions.manage");
    expect(view).not.toContain("<s-spinner");
  });
});
