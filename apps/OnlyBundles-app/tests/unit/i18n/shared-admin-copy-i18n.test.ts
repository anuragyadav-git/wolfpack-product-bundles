/**
 * Shared embedded Admin copy behavior.
 *
 * Issue: admin-ui-i18n-1
 * Spec : test-spec/admin-ui-i18n.spec.md
 */
import en from "../../../app/i18n/locales/en.json";

describe("shared embedded Admin copy", () => {
  it("keeps the parent product loading copy merchant-facing and explicit", () => {
    expect(en.common.parentProductStatus).toEqual({
      loadingTitle: "Scanning bundle status",
      loadingBody: "bundle status is being fetched.",
    });
  });
});
