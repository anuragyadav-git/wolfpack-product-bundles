import { mapTemplateSelection, type BundleContractType, type TemplateKey } from "../../../lib/bundle-config/template-selection";

export type StorefrontPreviewStylesheetId =
  | "fpb-base"
  | "fpb-mobile-summary"
  | "fpb-responsive"
  | "fpb-standard"
  | "fpb-classic"
  | "fpb-compact"
  | "fpb-horizontal"
  | "ppb-base"
  | "ppb-list"
  | "ppb-grid"
  | "ppb-modal"
  | "ppb-modal-product-grid"
  | "ppb-modal-footer"
  | "ppb-discount-footer"
  | "ppb-selection-loading"
  | "ppb-bottom-sheet"
  | "ppb-slot-cards"
  | "ppb-quantity-pills"
  | "ppb-purchase-options"
  | "ppb-discount-feedback"
  | "ppb-mobile-drawers"
  | "ppb-embed-host"
  | "product-modal-shell"
  | "product-modal-controls";

export type StorefrontPreviewStylesheetManifest = {
  bundleType: BundleContractType;
  stylesheets: readonly StorefrontPreviewStylesheetId[];
};

const FPB_STYLES = {
  standard: "fpb-standard",
  classic: "fpb-classic",
  compact: "fpb-compact",
  horizontal: "fpb-horizontal",
} as const;
const PPB_STYLES = {
  "product-list": "ppb-list",
  "product-grid": "ppb-grid",
  "horizontal-slots": "ppb-modal",
  "vertical-slots": "ppb-modal",
} as const;

export function getStorefrontPreviewStylesheetManifest(
  templateKey: TemplateKey,
): StorefrontPreviewStylesheetManifest {
  if (templateKey in FPB_STYLES) {
    return {
      bundleType: "full_page",
      stylesheets: [
        "fpb-base",
        "fpb-mobile-summary",
        "fpb-responsive",
        FPB_STYLES[templateKey as keyof typeof FPB_STYLES],
      ],
    };
  }
  return {
    bundleType: "product_page",
    stylesheets: [
      "ppb-base",
      "ppb-modal-product-grid",
      "ppb-modal-footer",
      "ppb-discount-footer",
      "ppb-selection-loading",
      "ppb-bottom-sheet",
      "ppb-slot-cards",
      "ppb-quantity-pills",
      "ppb-purchase-options",
      "ppb-discount-feedback",
      "ppb-mobile-drawers",
      "ppb-embed-host",
      PPB_STYLES[templateKey as keyof typeof PPB_STYLES],
      "product-modal-shell",
      "product-modal-controls",
    ],
  };
}

function buildProduct(index: number) {
  const productId = `gid://shopify/Product/900000000000${index}`;
  const variantId = `gid://shopify/ProductVariant/910000000000${index}`;
  const imageUrl = `/design-preview-product-${index}.png`;
  const price = 1200 + (index * 400);
  return {
    id: productId,
    productId,
    graphqlId: productId,
    selectionId: variantId,
    variantId,
    title: `Preview product ${index}`,
    handle: `preview-product-${index}`,
    description: "",
    imageUrl,
    featuredImage: imageUrl,
    images: [{ src: imageUrl, originalSrc: imageUrl }],
    price,
    compareAtPrice: price + 500,
    available: true,
    availableForSale: true,
    quantityAvailable: 25,
    currentlyNotInStock: false,
    variants: [{
      id: variantId,
      variantId,
      selectionId: variantId,
      title: "Default Title",
      price,
      compareAtPrice: price + 500,
      available: true,
      availableForSale: true,
      quantityAvailable: 25,
      currentlyNotInStock: false,
      image: { src: imageUrl },
    }],
  };
}

export function buildStorefrontPreviewFixture(templateKey: TemplateKey) {
  const manifest = getStorefrontPreviewStylesheetManifest(templateKey);
  const selection = manifest.bundleType === "full_page"
    ? mapTemplateSelection("full_page", templateKey)
    : mapTemplateSelection("product_page", templateKey);
  const products = [1, 2, 3, 4].map((index) => buildProduct(index));
  const rendererProducts = manifest.bundleType === "product_page"
    ? products.map((product) => ({
      ...product,
      id: product.id.split("/").pop(),
      selectionId: product.selectionId.split("/").pop(),
      variantId: product.variantId.split("/").pop(),
      variants: product.variants.map((variant) => ({
        ...variant,
        id: variant.id.split("/").pop(),
        selectionId: variant.selectionId.split("/").pop(),
        variantId: variant.variantId.split("/").pop(),
      })),
    }))
    : products;
  const steps = [0, 1].map((stepIndex) => ({
    id: `preview-step-${stepIndex + 1}`,
    name: `Step ${stepIndex + 1}`,
    pageTitle: `Choose products ${stepIndex + 1}`,
    required: true,
    minQuantity: 1,
    maxQuantity: 3,
    conditionType: "quantity",
    conditionOperator: "greater_than_or_equal_to",
    conditionValue: 1,
    products: products.map((product) => ({ ...product })),
    StepProduct: products.map((product) => ({ ...product })),
    categories: [
      {
        id: `preview-category-${stepIndex + 1}-1`,
        name: "Essentials",
        productIds: products.slice(0, 2).map((product) => product.id),
        products: products.slice(0, 2).map((product) => ({ selectionId: product.id })),
        handles: products.slice(0, 2).map((product) => product.handle),
      },
      {
        id: `preview-category-${stepIndex + 1}-2`,
        name: "More choices",
        productIds: products.slice(2).map((product) => product.id),
        products: products.slice(2).map((product) => ({ selectionId: product.id })),
        handles: products.slice(2).map((product) => product.handle),
      },
    ],
  }));

  return {
    capabilities: {
      analytics: false,
      cart: false,
      externalNavigation: false,
      network: false,
      persistence: false,
    } as const,
    bundle: {
      id: "settings-design-preview",
      publicNumber: 1,
      name: "Bundle preview",
      status: "active",
      bundleType: manifest.bundleType,
      ...selection,
      bundleDesignTemplateData: { templateId: selection.bundleDesignPresetId },
      showStepTimeline: true,
      showCategoryTabs: true,
      showSearch: true,
      showTextOnAddButton: false,
      pricing: {
        enabled: true,
        discountMethod: "percentage_off",
        discountValue: 10,
      },
      steps,
    },
    stepProductData: [
      rendererProducts.map((product) => ({ ...product })),
      rendererProducts.map((product) => ({ ...product })),
    ],
  };
}
