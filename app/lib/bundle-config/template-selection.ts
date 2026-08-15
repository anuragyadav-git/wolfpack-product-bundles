export type BundleContractType = "full_page" | "product_page";

export type FullPageTemplateKey = "standard" | "classic" | "compact" | "horizontal";
export type ProductPageTemplateKey = "product-list" | "product-grid" | "horizontal-slots" | "vertical-slots";
export type TemplateKey = FullPageTemplateKey | ProductPageTemplateKey;

export interface TemplateSelection {
  bundleDesignTemplate: "FBP_SIDE_FOOTER" | "PDP_INPAGE" | "PDP_MODAL";
  bundleDesignPresetId: "STANDARD" | "CLASSIC" | "COMPACT" | "HORIZONTAL" | "LIST" | "GRID" | "HORIZONTAL_SLOTS" | "VERTICAL_SLOTS";
}

const FULL_PAGE_TEMPLATE_MAP: Record<FullPageTemplateKey, TemplateSelection> = {
  standard: {
    bundleDesignTemplate: "FBP_SIDE_FOOTER",
    bundleDesignPresetId: "STANDARD",
  },
  classic: {
    bundleDesignTemplate: "FBP_SIDE_FOOTER",
    bundleDesignPresetId: "CLASSIC",
  },
  compact: {
    bundleDesignTemplate: "FBP_SIDE_FOOTER",
    bundleDesignPresetId: "COMPACT",
  },
  horizontal: {
    bundleDesignTemplate: "FBP_SIDE_FOOTER",
    bundleDesignPresetId: "HORIZONTAL",
  },
};

const PRODUCT_PAGE_TEMPLATE_MAP: Record<ProductPageTemplateKey, TemplateSelection> = {
  "product-list": {
    bundleDesignTemplate: "PDP_INPAGE",
    bundleDesignPresetId: "LIST",
  },
  "product-grid": {
    bundleDesignTemplate: "PDP_INPAGE",
    bundleDesignPresetId: "GRID",
  },
  "horizontal-slots": {
    bundleDesignTemplate: "PDP_MODAL",
    bundleDesignPresetId: "HORIZONTAL_SLOTS",
  },
  "vertical-slots": {
    bundleDesignTemplate: "PDP_MODAL",
    bundleDesignPresetId: "VERTICAL_SLOTS",
  },
};

export function mapTemplateSelection(bundleType: "full_page", templateKey: TemplateKey): TemplateSelection;
export function mapTemplateSelection(bundleType: "product_page", templateKey: TemplateKey): TemplateSelection;
export function mapTemplateSelection(bundleType: BundleContractType, templateKey: TemplateKey): TemplateSelection {
  const selection = bundleType === "full_page"
    ? FULL_PAGE_TEMPLATE_MAP[templateKey as FullPageTemplateKey]
    : PRODUCT_PAGE_TEMPLATE_MAP[templateKey as ProductPageTemplateKey];

  if (!selection) {
    throw new Error(`Invalid template key "${templateKey}" for ${bundleType}`);
  }

  return { ...selection };
}

export function getStorefrontConfigLoadPlan(bundleType: BundleContractType): string[] {
  if (bundleType === "full_page") {
    return [
      "metafield-cache",
      "proxy-api-fallback",
      "proxy-api-503-504-retry",
    ];
  }

  return ["product-page-config"];
}
