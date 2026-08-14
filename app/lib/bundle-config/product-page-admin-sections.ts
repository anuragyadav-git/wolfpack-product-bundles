export interface ProductPageSetupItem {
  id: string;
  label: string;
  iconType: string;
}

export interface ProductPageThemeTemplateOption {
  handle?: string | null;
  fullKey?: string | null;
  isBundleContainer?: boolean | null;
}

export interface ProductPageThemeEditorDeepLinkInput {
  shop: string;
  apiKey: string;
  blockHandle: string;
  bundleId: string;
  productHandle?: string | null;
  productPreviewUrl?: string | null;
  template: ProductPageThemeTemplateOption;
}

export const PRODUCT_PAGE_EDIT_DEFAULTS_HREF = "/app/settings";

export const PRODUCT_PAGE_SETUP_ITEMS: ProductPageSetupItem[] = [
  { id: "step_setup",         label: "Step Setup",         iconType: "note" },
  { id: "discount_pricing",   label: "Discount & Pricing", iconType: "filter" },
  { id: "bundle_visibility",  label: "Bundle Visibility",  iconType: "view" },
  { id: "bundle_settings",    label: "Bundle Settings",    iconType: "settings" },
  { id: "subscriptions",      label: "Subscriptions",      iconType: "clock" },
  { id: "select_template",    label: "Select Template",    iconType: "paint-brush-flat" },
];

export interface SellingPlanGroupSummary {
  id: string;
  name: string;
}

interface SellingPlanProduct {
  sellingPlanGroups?: {
    nodes?: SellingPlanGroupSummary[];
  } | null;
}

function asArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

export function deriveCommonSellingPlanGroups(products: SellingPlanProduct[]): SellingPlanGroupSummary[] {
  if (products.length === 0) return [];

  const [firstProduct, ...remainingProducts] = products;
  const commonById = new Map<string, SellingPlanGroupSummary>();
  for (const group of asArray(firstProduct.sellingPlanGroups?.nodes)) {
    if (typeof group?.id === "string" && typeof group?.name === "string") {
      commonById.set(group.id, { id: group.id, name: group.name });
    }
  }

  for (const product of remainingProducts) {
    const productGroupIds = new Set(
      asArray(product.sellingPlanGroups?.nodes)
        .map((group: SellingPlanGroupSummary) => group?.id)
        .filter((id: unknown): id is string => typeof id === "string")
    );
    for (const groupId of Array.from(commonById.keys())) {
      if (!productGroupIds.has(groupId)) commonById.delete(groupId);
    }
  }

  return Array.from(commonById.values());
}

export function resolveProductPageThemeEditorTemplateHandle(template: ProductPageThemeTemplateOption): string {
  const handle = typeof template?.handle === "string" && template.handle.trim() !== ""
    ? template.handle
    : "product";

  return handle;
}

export function resolveProductPageTemplateSuffix(template: ProductPageThemeTemplateOption): string | null {
  const handle = resolveProductPageThemeEditorTemplateHandle(template);
  if (handle === "product") return null;
  return handle.startsWith("product.") ? handle.replace(/^product\./, "") : handle;
}

function resolveProductPageThemeEditorPreviewPath(input: ProductPageThemeEditorDeepLinkInput): string | null {
  const previewUrl = typeof input.productPreviewUrl === "string" ? input.productPreviewUrl.trim() : "";
  if (previewUrl !== "") {
    if (previewUrl.startsWith("/")) return previewUrl;
    try {
      const parsed = new URL(previewUrl);
      const path = `${parsed.pathname}${parsed.search}`;
      if (path !== "/") return path;
    } catch {
      // Fall back to the product handle below when Shopify returns an unexpected URL shape.
    }
  }

  return typeof input.productHandle === "string" && input.productHandle.trim() !== ""
    ? `/products/${input.productHandle.trim()}`
    : null;
}

export function buildProductPageThemeEditorDeepLink(input: ProductPageThemeEditorDeepLinkInput): string {
  const shopDomain = input.shop.includes(".myshopify.com")
    ? input.shop
    : `${input.shop}.myshopify.com`;
  const templateHandle = resolveProductPageThemeEditorTemplateHandle(input.template);
  const resolvedPreviewPath = resolveProductPageThemeEditorPreviewPath(input);
  const previewPath = resolvedPreviewPath
    ? `&previewPath=${encodeURIComponent(resolvedPreviewPath)}`
    : "";

  return `https://${shopDomain}/admin/themes/current/editor?template=${templateHandle}&addAppBlockId=${input.apiKey}/${input.blockHandle}&target=newAppsSection&bundleId=${input.bundleId}${previewPath}`;
}
