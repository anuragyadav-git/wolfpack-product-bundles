import { getParentProductStatusUi } from "../../../app/lib/parent-product-status-ui";

describe("getParentProductStatusUi", () => {
  it.each([
    ["ACTIVE", "Active", "success", false],
    ["DRAFT", "Draft", "warning", false],
    ["ARCHIVED", "Archived", "warning", false],
    ["UNLISTED", "Unlisted", "warning", true],
  ])("maps Shopify %s to %s without fabricating unlisted state", (status, label, tone, showUnlistedBanner) => {
    expect(getParentProductStatusUi(status)).toEqual({
      label,
      tone,
      showUnlistedBanner,
      isLoading: false,
    });
  });

  it("treats missing product status as unresolved instead of showing a fallback", () => {
    expect(getParentProductStatusUi(null)).toEqual({
      label: null,
      tone: null,
      showUnlistedBanner: false,
      isLoading: true,
    });
  });

  it("lets active revalidation override a stale unlisted status", () => {
    expect(getParentProductStatusUi("UNLISTED", true)).toEqual({
      label: null,
      tone: null,
      showUnlistedBanner: false,
      isLoading: true,
    });
  });
});
