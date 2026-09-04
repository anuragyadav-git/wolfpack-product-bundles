export type DashboardPreviewInput = {
  bundleType: "full_page" | "product_page";
  bundleId: string;
  shopifyProductHandle: string | null;
  shop: string;
  /** Optional app-embed state retained for the preview gate caller. */
  appEmbedEnabled?: boolean;
  /** Optional signed preview token for draft bundles */
  previewToken?: string | null;
};

export type DashboardPreviewAction =
  | { kind: "open_url"; url: string }
  | { kind: "create_fpb_preview" }
  | { kind: "error"; message: string };

const PPB_MISSING_HANDLE_MESSAGE =
  "Save and place the bundle on a product first to preview it.";

export function decideDashboardPreviewAction(
  input: DashboardPreviewInput,
): DashboardPreviewAction {
  if (input.bundleType === "full_page") {
    if (input.bundleId) {
      return { kind: "create_fpb_preview" };
    }
  }

  if (!input.shopifyProductHandle) {
    return { kind: "error", message: PPB_MISSING_HANDLE_MESSAGE };
  }

  const shop = normalizeShop(input.shop);
  const baseProductUrl = `https://${shop}/products/${input.shopifyProductHandle}`;
  const url = input.previewToken
    ? `${baseProductUrl}?wpb_preview=${encodeURIComponent(input.previewToken)}`
    : baseProductUrl;
  return {
    kind: "open_url",
    url,
  };
}

function normalizeShop(shop: string): string {
  return shop.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}
