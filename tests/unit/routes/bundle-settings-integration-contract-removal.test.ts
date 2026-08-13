import fs from "node:fs";
import path from "node:path";
import { formatBundleForWidget } from "../../../app/lib/bundle-formatter.server";
import { parseFpbSaveBundleForm } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers/save-bundle-form.server";
import { parsePPBBundleSettings } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/parsers";

function makeFpbForm() {
  const formData = new FormData();
  formData.set("stepsData", "[]");
  formData.set("discountData", JSON.stringify({ discountEnabled: false }));
  formData.set(
    "individualSellingPlanSelection",
    JSON.stringify({ isEnabled: true, showFor: "OOS_PRODUCTS" }),
  );
  return formData;
}

describe("removed Bundle Settings integration contract", () => {
  it("ignores the obsolete FPB save field", () => {
    expect(parseFpbSaveBundleForm(makeFpbForm())).not.toHaveProperty(
      "individualSellingPlanSelection",
    );
  });

  it("ignores the obsolete PPB save field", () => {
    const formData = new FormData();
    formData.set(
      "individualSellingPlanSelection",
      JSON.stringify({ isEnabled: true, showFor: "OOS_PRODUCTS" }),
    );

    expect(parsePPBBundleSettings(formData)).not.toHaveProperty(
      "individualSellingPlanSelection",
    );
  });

  it("omits stale integration data from proxy storefront configuration", () => {
    const formatted = formatBundleForWidget({
      id: "bundle-1",
      name: "Bundle",
      description: null,
      status: "active",
      bundleType: "full_page",
      steps: [],
      individualSellingPlanSelection: {
        isEnabled: true,
        showFor: "OOS_PRODUCTS",
      },
    });

    expect(formatted).not.toHaveProperty("individualSellingPlanSelection");
  });

  it("removes the obsolete direct Bundle persistence column", () => {
    const schema = fs.readFileSync(
      path.resolve(process.cwd(), "prisma/schema.prisma"),
      "utf8",
    );
    const bundleModel = schema.match(/model Bundle \{[\s\S]*?\n\}/)?.[0] ?? "";

    expect(bundleModel).not.toContain("individualSellingPlanSelection");
  });
});
