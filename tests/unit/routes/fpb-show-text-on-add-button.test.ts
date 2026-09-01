import { formatBundleForWidget } from "../../../app/lib/bundle-formatter.server";
import { parseFpbSaveBundleForm } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers/save-bundle-form.server";

function buildSaveForm(showTextOnAddButton: boolean) {
  const formData = new FormData();
  formData.append("bundleName", "Test Bundle");
  formData.append("bundleDescription", "");
  formData.append("bundleStatus", "draft");
  formData.append("showTextOnAddButton", String(showTextOnAddButton));
  formData.append("stepsData", JSON.stringify([]));
  formData.append(
    "discountData",
    JSON.stringify({
      discountEnabled: false,
      discountType: "percentage",
      discountRules: [],
    }),
  );
  return formData;
}

describe("FPB Show Text on + Button persistence", () => {
  it("parses the direct showTextOnAddButton save field", () => {
    expect(parseFpbSaveBundleForm(buildSaveForm(true)).showTextOnAddButton).toBe(
      true,
    );
    expect(
      parseFpbSaveBundleForm(buildSaveForm(false)).showTextOnAddButton,
    ).toBe(false);
  });

  it("does not expose legacy fullPageLayout from FPB save form data", () => {
    const formData = buildSaveForm(true);
    formData.append("fullPageLayout", "footer_bottom");

    expect(parseFpbSaveBundleForm(formData)).not.toHaveProperty("fullPageLayout");
  });

  it("emits showTextOnAddButton to the storefront payload without requiring button copy", () => {
    const result = formatBundleForWidget({
      id: "bundle-1",
      name: "Test Bundle",
      description: null,
      status: "ACTIVE",
      bundleType: "full_page",
      shopifyProductId: null,
      steps: [],
      pricing: null,
      showTextOnAddButton: true,
      textOverrides: null,
    } as any);

    expect(result.showTextOnAddButton).toBe(true);
    expect(result.textOverrides).toBeNull();
  });

  it("parses direct low-stock alert settings", () => {
    const formData = buildSaveForm(true);
    formData.set("lowStockAlertEnabled", "true");
    formData.set("lowStockAlertThreshold", "8");
    formData.set("lowStockAlertMessage", "Hurry, {{stock}} remaining");

    expect(parseFpbSaveBundleForm(formData)).toMatchObject({
      lowStockAlertEnabled: true,
      lowStockAlertThreshold: 8,
      lowStockAlertMessage: "Hurry, {{stock}} remaining",
    });
  });

  it("parses direct countdown presentation settings", () => {
    const formData = buildSaveForm(true);
    formData.set("countdownEnabled", "true");
    formData.set("countdownLayout", "full");
    formData.set("countdownPosition", "below");
    formData.set("countdownTitle", "Ends soon");
    formData.set("countdownExpiryAction", "show_zeros");
    formData.set("countdownExpiredMessage", "This offer has ended");

    expect(parseFpbSaveBundleForm(formData)).toMatchObject({
      countdownEnabled: true,
      countdownLayout: "full",
      countdownPosition: "below",
      countdownTitle: "Ends soon",
      countdownExpiryAction: "show_zeros",
      countdownExpiredMessage: "This offer has ended",
    });
  });
});
