import type { CSSProperties } from "react";
import { FPB_TEMPLATE_CONFIGS } from "../../../assets/widgets/full-page/templates/registry";
import { PPB_TEMPLATE_CONFIGS } from "../../../assets/widgets/product-page/templates/registry";
import {
  mapTemplateSelection,
  type BundleContractType,
  type TemplateKey,
  type TemplateSelection,
} from "../../../lib/bundle-config/template-selection";
import { buildSettingsDesignRuntime, normalizeSlotIconFit } from "../../../lib/settings-design-runtime";
import { generateCSSFromSettings } from "../../../lib/css-generators";
import type { ShopBrandColors } from "../../../lib/shop-brand-colors";
import type { SettingsField } from "../../../lib/admin-configuration-surfaces";

export type DesignPreviewSurface =
  | "bundle-header"
  | "navigation"
  | "categories"
  | "product-card"
  | "product-slots"
  | "product-picker"
  | "cart-summary"
  | "loading"
  | "validation"
  | "upsell";
export type DesignPreviewFamily = "full-page" | "product-page";
export type DesignPreviewViewport = "desktop" | "mobile";
export type DesignPreviewAvailableSize = { width: number; height: number };
export type DesignPreviewContextKind =
  | "full-page"
  | "product-page-inpage"
  | "product-page-modal";
export type DesignPreviewSurfaceFidelity = "storefront" | "representative";
export type DesignPreviewNavigation =
  | "timeline"
  | "compact-timeline"
  | "horizontal-timeline"
  | "list-steps"
  | "grid-steps"
  | "none";
export type DesignPreviewCategories = "accordion" | "pills" | "underline" | "tabs" | "none";
export type DesignPreviewSummary = "rows" | "slot-grid" | "compact-slots" | "list-selected-drawer" | "pdp-footer" | "modal-footer";

export interface DesignPreviewProductCardContract {
  mode: "grid" | "compact" | "row";
  columns: {
    desktop: number;
    mobile: number;
  };
}

export interface DesignPreviewTemplateDescriptor {
  key: TemplateKey;
  bundleType: BundleContractType;
  translationKey: string;
  family: DesignPreviewFamily;
  selection: TemplateSelection;
  productCard: DesignPreviewProductCardContract;
  navigation: DesignPreviewNavigation;
  categories: DesignPreviewCategories;
  summary: DesignPreviewSummary;
  slotOrientation?: "horizontal" | "vertical";
  supportedSurfaces: readonly DesignPreviewSurface[];
  sceneRegions: Record<DesignPreviewViewport, readonly string[]>;
}

export interface DesignPreviewFieldTarget {
  surface: DesignPreviewSurface;
  surfaces?: readonly DesignPreviewSurface[];
  elements: readonly string[];
  templates?: readonly TemplateKey[];
  surfaceOverrides?: Partial<Record<TemplateKey, DesignPreviewSurface>>;
}

export interface DesignPreviewFixtureProduct {
  id: string;
  translationKey: string;
  imageUrl: string;
  selected: boolean;
  quantity: number;
  priceCents: number;
}

export interface DesignPreviewFixture {
  steps: readonly { id: string; translationKey: string }[];
  categories: readonly { id: string; translationKey: string }[];
  products: readonly DesignPreviewFixtureProduct[];
  discountTiers: readonly { minimum: number; percentage: number }[];
  emptySlots: readonly { id: string; position: number }[];
  validationMessage: string;
  upsell: DesignPreviewFixtureProduct;
}

export interface DesignPreviewScene {
  templateKey: TemplateKey;
  surface: DesignPreviewSurface;
  viewport: DesignPreviewViewport;
  regions: readonly string[];
}

export type DesignPreviewTheme = CSSProperties & Record<`--preview-${string}`, string>;

export const DESIGN_PREVIEW_VIEWPORTS: Readonly<
  Record<DesignPreviewViewport, { width: number; height: number }>
> = {
  desktop: { width: 1280, height: 1136 },
  mobile: { width: 390, height: 844 },
};

const DESIGN_PREVIEW_MOBILE_DEVICE_SIZE = { width: 428, height: 882 } as const;

export function getDesignPreviewCanvasSize(viewport: DesignPreviewViewport) {
  return viewport === "mobile"
    ? DESIGN_PREVIEW_MOBILE_DEVICE_SIZE
    : DESIGN_PREVIEW_VIEWPORTS.desktop;
}

export function calculateDesignPreviewFitScale(
  availableSize: DesignPreviewAvailableSize,
  viewport: DesignPreviewViewport,
) {
  const logicalViewport = getDesignPreviewCanvasSize(viewport);
  const ratios = [
    Number.isFinite(availableSize.width) && availableSize.width > 0
      ? availableSize.width / logicalViewport.width
      : null,
    Number.isFinite(availableSize.height) && availableSize.height > 0
      ? availableSize.height / logicalViewport.height
      : null,
  ].filter((ratio): ratio is number => ratio !== null);

  return ratios.length > 0 ? Math.min(1, ...ratios) : 1;
}

export function getDesignPreviewFitPresentation(
  availableSize: DesignPreviewAvailableSize,
  viewport: DesignPreviewViewport,
) {
  const logicalCanvas = getDesignPreviewCanvasSize(viewport);
  const scale = calculateDesignPreviewFitScale(availableSize, viewport);

  return {
    scale,
    canvasWidth: logicalCanvas.width * scale,
    canvasHeight: logicalCanvas.height * scale,
  };
}

export function getDesignPreviewSurfaceFidelity(
  _templateKey: TemplateKey,
  _surface: DesignPreviewSurface,
): DesignPreviewSurfaceFidelity {
  return "storefront";
}

type RuntimeTemplateConfig = {
  productCard?: {
    mode?: string;
    columns?: { desktop?: number; mobile?: number };
  };
  summary?: { mode?: string };
  timeline?: { mode?: string };
  slots?: { orientation?: string };
};

function resolveProductCardMode(mode: string | undefined): DesignPreviewProductCardContract["mode"] {
  return mode === "compact" || mode === "row" ? mode : "grid";
}

function resolveSlotOrientation(orientation: string | undefined) {
  return orientation === "horizontal" || orientation === "vertical" ? orientation : undefined;
}

function resolveFullPageNavigation(mode: string | undefined): DesignPreviewNavigation {
  if (mode === "compact") return "compact-timeline";
  if (mode === "horizontal") return "horizontal-timeline";
  return "timeline";
}

function resolveFullPageSummary(mode: string | undefined): DesignPreviewSummary {
  if (mode === "slots") return "slot-grid";
  if (mode === "compactSlots") return "compact-slots";
  return "rows";
}

function resolveProductPageNavigation(selection: TemplateSelection): DesignPreviewNavigation {
  if (selection.bundleDesignPresetId === "LIST") return "list-steps";
  if (selection.bundleDesignPresetId === "GRID") return "grid-steps";
  return "none";
}

function resolveProductPageSummary(mode: string | undefined): DesignPreviewSummary {
  if (mode === "drawerRows") return "list-selected-drawer";
  if (mode === "drawer") return "pdp-footer";
  return "modal-footer";
}

const ALL_FPB_TEMPLATES: readonly TemplateKey[] = ["standard", "classic", "compact", "horizontal"];
const PRODUCT_PAGE_TEMPLATES: readonly TemplateKey[] = ["product-list", "product-grid", "horizontal-slots", "vertical-slots"];
const ALL_TEMPLATES: readonly TemplateKey[] = [...ALL_FPB_TEMPLATES, ...PRODUCT_PAGE_TEMPLATES];
const CATEGORY_TEMPLATES: readonly TemplateKey[] = ["classic", "compact", "horizontal", "product-list", "product-grid"];
const FULL_PAGE_SURFACES = ["navigation", "categories", "product-card", "product-slots", "cart-summary", "loading", "validation", "upsell"] as const;
const PRODUCT_PAGE_SURFACES = ["bundle-header", "navigation", "categories", "product-card", "product-slots", "cart-summary", "loading", "validation", "upsell"] as const;
const SLOT_SURFACES = ["bundle-header", "product-slots", "product-picker", "cart-summary", "loading", "validation", "upsell"] as const;

export function getDesignPreviewContextKind(
  templateKey: TemplateKey,
): DesignPreviewContextKind {
  if (ALL_FPB_TEMPLATES.includes(templateKey)) return "full-page";
  return templateKey === "product-list" || templateKey === "product-grid"
    ? "product-page-inpage"
    : "product-page-modal";
}

function fullPageDescriptor(
  key: "standard" | "classic" | "compact" | "horizontal",
  translationKey: string,
  config: RuntimeTemplateConfig,
  adapter: Pick<DesignPreviewTemplateDescriptor, "categories" | "sceneRegions">,
): DesignPreviewTemplateDescriptor {
  const configuredColumns = config.productCard?.columns;
  return {
    key,
    bundleType: "full_page",
    translationKey,
    family: "full-page",
    selection: mapTemplateSelection("full_page", key),
    navigation: resolveFullPageNavigation(config.timeline?.mode),
    summary: resolveFullPageSummary(config.summary?.mode),
    productCard: {
      mode: resolveProductCardMode(config.productCard?.mode),
      columns: {
        // Horizontal renders two intrinsic row tracks in the storefront shell even
        // though each row primitive owns a single-column internal contract.
        desktop: key === "horizontal" ? 2 : configuredColumns?.desktop ?? 3,
        mobile: configuredColumns?.mobile ?? 2,
      },
    },
    supportedSurfaces: FULL_PAGE_SURFACES,
    ...adapter,
  };
}

function productPageDescriptor(
  key: "product-list" | "product-grid" | "horizontal-slots" | "vertical-slots",
  translationKey: string,
  config: RuntimeTemplateConfig,
  adapter: Pick<DesignPreviewTemplateDescriptor, "categories" | "sceneRegions">,
): DesignPreviewTemplateDescriptor {
  const slotOrientation = resolveSlotOrientation(config.slots?.orientation);
  const isSlotTemplate = Boolean(slotOrientation);
  const selection = mapTemplateSelection("product_page", key);
  return {
    key,
    bundleType: "product_page",
    translationKey,
    family: "product-page",
    selection,
    navigation: resolveProductPageNavigation(selection),
    summary: resolveProductPageSummary(config.summary?.mode),
    productCard: {
      mode: resolveProductCardMode(config.productCard?.mode),
      columns: key === "product-list"
        ? { desktop: 1, mobile: 1 }
        : key === "product-grid"
          ? { desktop: 4, mobile: 2 }
          : { desktop: 3, mobile: 2 },
    },
    slotOrientation,
    supportedSurfaces: isSlotTemplate ? SLOT_SURFACES : PRODUCT_PAGE_SURFACES,
    ...adapter,
  };
}

export const DESIGN_PREVIEW_TEMPLATES: readonly DesignPreviewTemplateDescriptor[] = [
  fullPageDescriptor("standard", "settingsDcp.preview.templates.standard", FPB_TEMPLATE_CONFIGS.STANDARD, {
    categories: "accordion",
    sceneRegions: {
      desktop: ["timeline", "category-accordion", "product-grid", "summary-sidebar"],
      mobile: ["timeline", "category-accordion", "product-grid", "sticky-summary-tray"],
    },
  }),
  fullPageDescriptor("classic", "settingsDcp.preview.templates.classic", FPB_TEMPLATE_CONFIGS.CLASSIC, {
    categories: "pills",
    sceneRegions: {
      desktop: ["timeline", "pill-categories", "product-grid", "slot-summary"],
      mobile: ["timeline", "pill-categories", "product-grid", "expandable-summary-tray"],
    },
  }),
  fullPageDescriptor("compact", "settingsDcp.preview.templates.compact", FPB_TEMPLATE_CONFIGS.COMPACT, {
    categories: "pills",
    sceneRegions: {
      desktop: ["compact-timeline", "pill-categories", "product-grid", "compact-slot-summary"],
      mobile: ["compact-timeline", "pill-categories", "product-grid", "compact-summary-tray"],
    },
  }),
  fullPageDescriptor("horizontal", "settingsDcp.preview.templates.horizontal", FPB_TEMPLATE_CONFIGS.HORIZONTAL, {
    categories: "underline",
    sceneRegions: {
      desktop: ["horizontal-timeline", "underline-categories", "product-rows", "summary-sidebar"],
      mobile: ["horizontal-timeline", "underline-categories", "product-rows", "sticky-summary-tray"],
    },
  }),
  productPageDescriptor("product-list", "settingsDcp.preview.templates.productList", PPB_TEMPLATE_CONFIGS.LIST, {
    categories: "tabs",
    sceneRegions: {
      desktop: ["neutral-pdp-shell", "product-list-step-flow", "category-tabs", "product-rows", "pdp-footer"],
      mobile: ["neutral-pdp-shell", "product-list-step-flow", "category-tabs", "product-rows", "pdp-footer"],
    },
  }),
  productPageDescriptor("product-grid", "settingsDcp.preview.templates.productGrid", PPB_TEMPLATE_CONFIGS.GRID, {
    categories: "tabs",
    sceneRegions: {
      desktop: ["neutral-pdp-shell", "product-grid-step-headers", "category-tabs", "product-grid", "pdp-footer"],
      mobile: ["neutral-pdp-shell", "product-grid-step-headers", "category-tabs", "product-grid", "pdp-footer"],
    },
  }),
  productPageDescriptor("horizontal-slots", "settingsDcp.preview.templates.horizontalSlots", PPB_TEMPLATE_CONFIGS.HORIZONTAL_SLOTS, {
    categories: "none",
    sceneRegions: {
      desktop: ["neutral-pdp-shell", "horizontal-slots", "modal-footer"],
      mobile: ["neutral-pdp-shell", "horizontal-slots", "modal-footer"],
    },
  }),
  productPageDescriptor("vertical-slots", "settingsDcp.preview.templates.verticalSlots", PPB_TEMPLATE_CONFIGS.VERTICAL_SLOTS, {
    categories: "none",
    sceneRegions: {
      desktop: ["neutral-pdp-shell", "vertical-slots", "modal-footer"],
      mobile: ["neutral-pdp-shell", "vertical-slots", "modal-footer"],
    },
  }),
] as const;

export const DESIGN_PREVIEW_FIXTURE: DesignPreviewFixture = {
  steps: [
    { id: "products", translationKey: "settingsDcp.preview.surface.stepOne" },
    { id: "review", translationKey: "settingsDcp.preview.surface.stepTwo" },
  ],
  categories: [
    { id: "essentials", translationKey: "settingsDcp.preview.surface.categoryOne" },
    { id: "favourites", translationKey: "settingsDcp.preview.surface.categoryTwo" },
    { id: "extras", translationKey: "settingsDcp.preview.surface.categoryThree" },
  ],
  products: [
    { id: "first", translationKey: "settingsDcp.preview.surface.products.first", imageUrl: "/design-preview-product-1.png", selected: true, quantity: 1, priceCents: 2400 },
    { id: "second", translationKey: "settingsDcp.preview.surface.products.second", imageUrl: "/design-preview-product-2.png", selected: true, quantity: 1, priceCents: 1800 },
    { id: "third", translationKey: "settingsDcp.preview.surface.products.third", imageUrl: "/design-preview-product-3.png", selected: false, quantity: 0, priceCents: 1600 },
    { id: "fourth", translationKey: "settingsDcp.preview.surface.products.fourth", imageUrl: "/design-preview-product-4.png", selected: false, quantity: 0, priceCents: 1200 },
  ],
  discountTiers: [
    { minimum: 2, percentage: 10 },
    { minimum: 3, percentage: 15 },
    { minimum: 4, percentage: 20 },
  ],
  emptySlots: [
    { id: "slot-2", position: 2 },
    { id: "slot-3", position: 3 },
  ],
  validationMessage: "settingsDcp.preview.surface.validationMessage",
  upsell: { id: "fourth", translationKey: "settingsDcp.preview.surface.products.fourth", imageUrl: "/design-preview-product-4.png", selected: false, quantity: 0, priceCents: 1200 },
};

const target = (
  surface: DesignPreviewSurface,
  elements: readonly string[],
  options: Pick<DesignPreviewFieldTarget, "templates" | "surfaceOverrides"> = {},
): DesignPreviewFieldTarget => ({ surface, elements, ...options });
const productTarget = (...elements: string[]) => target("product-card", elements, {
  surfaceOverrides: { "horizontal-slots": "product-picker", "vertical-slots": "product-picker" },
});
const sharedProductCartTarget = (...elements: string[]) => ({
  ...productTarget(...elements),
  surfaces: ["product-card", "product-picker", "cart-summary"] as const,
});
const cartTarget = (...elements: string[]) => target("cart-summary", elements);

export const DESIGN_PREVIEW_FIELD_TARGETS: Readonly<Record<string, DesignPreviewFieldTarget>> = {
  "Primary Color": sharedProductCartTarget("product action"),
  "Button Text Color": sharedProductCartTarget("action text"),
  "Primary Text Color": sharedProductCartTarget("product text", "prices"),
  "Secondary Color": sharedProductCartTarget("quantity controls"),
  "Product Background Color": sharedProductCartTarget("product cards", "cart", "empty slots"),
  "stylePresets.colors.discountTierBackgroundColor": cartTarget("discount feedback pill"),
  "stylePresets.colors.discountTierTextColor": cartTarget("discount feedback pill text"),
  "stylePresets.colors.discountCompletionBackgroundColor": cartTarget("discount completion pill"),
  "stylePresets.colors.discountCompletionTextColor": cartTarget("discount completion pill text"),
  "Primary Font Size": sharedProductCartTarget("product titles", "primary prices", "step text"),
  "Primary Font Weight": sharedProductCartTarget("product titles", "primary prices"),
  "Secondary Font Size": sharedProductCartTarget("compare-at prices", "discount text"),
  "Secondary Font Weight": sharedProductCartTarget("compare-at prices", "discount text"),
  "Body Font Size": sharedProductCartTarget("variant labels", "supporting text"),
  "Body Font Weight": sharedProductCartTarget("variant labels", "supporting text"),
  "Bundle Buttons Corner Style": sharedProductCartTarget("buttons", "tabs", "quantity controls"),
  "Bundle Buttons Base": sharedProductCartTarget("buttons", "tabs", "quantity controls"),
  "Product Card & Cart Corner Style": sharedProductCartTarget("product cards", "cart"),
  "Product Card & Cart Base": sharedProductCartTarget("product cards", "cart", "product images"),
  "Image Fit": productTarget("product images"),
  "stylePresets.images.slotIconUrl": target("product-slots", ["empty slot icon"], { templates: ALL_TEMPLATES }),
  "stylePresets.images.slotIconFit": target("product-slots", ["empty slot icon presentation"], { templates: ALL_TEMPLATES }),
  "generalSettings.loadingGifUrl": target("loading", ["loading animation"], { templates: ALL_FPB_TEMPLATES }),
  "generalSettings.loadingBgColor": target("loading", ["loading screen background"], { templates: ALL_FPB_TEMPLATES }),
  "expert.navigationBanner.navigationBannerStepCompletionColor": target("navigation", ["completed steps"], { templates: ALL_FPB_TEMPLATES }),
  "expert.navigationBanner.navigationCheckColor": target("navigation", ["completed step checks"], { templates: ALL_FPB_TEMPLATES }),
  "expert.navigationBanner.navigationBannerStepTextColor": target("navigation", ["step labels"], { templates: ALL_FPB_TEMPLATES }),
  "expert.generalSettings.productPageTitleColor": target("bundle-header", ["product-page title"], { templates: PRODUCT_PAGE_TEMPLATES }),
  "expert.navigationBanner.navigationBannerStepProgressBarEmptyColor": target("navigation", ["step progress"], { templates: ALL_FPB_TEMPLATES }),
  "expert.generalSettings.conditionToastBgColor": target("validation", ["condition toast"]),
  "expert.generalSettings.conditionToastTextColor": target("validation", ["condition toast text"]),
  "expert.navigationBanner.tabsActiveBgColor": target("categories", ["active categories"], { templates: CATEGORY_TEMPLATES }),
  "expert.navigationBanner.tabsActiveTextColor": target("categories", ["active category text"], { templates: CATEGORY_TEMPLATES }),
  "expert.navigationBanner.tabsInactiveBgColor": target("categories", ["inactive categories"], { templates: CATEGORY_TEMPLATES }),
  "expert.navigationBanner.tabsInactiveTextColor": target("categories", ["inactive category text"], { templates: CATEGORY_TEMPLATES }),
  "expert.productCard.productCardBgColor": productTarget("product cards"),
  "expert.productCard.productCardTextColor": productTarget("product titles"),
  "expert.productCard.productCardButtonColor": productTarget("product actions"),
  "expert.productCard.productCardButtonTextColor": productTarget("product action text"),
  "expert.emptyStateCard.emptyStateCardBorderColor": target("product-slots", ["empty slot border", "empty slot icon"], { templates: ALL_TEMPLATES }),
  "expert.emptyStateCard.emptyStateCardTextColor": target("product-slots", ["empty slot text"], { templates: ALL_TEMPLATES }),
  "expert.cartFooter.cartFooterBgColor": cartTarget("cart"),
  "expert.cartFooter.cartFooterTextColor": cartTarget("cart text"),
  "expert.cartFooter.cartFooterNextButtonColor": cartTarget("next action"),
  "expert.cartFooter.cartFooterNextButtonTextColor": cartTarget("next action text"),
  "expert.cartFooter.cartFooterBackButtonColor": target("cart-summary", ["back action"], { templates: ALL_FPB_TEMPLATES }),
  "expert.cartFooter.cartFooterBackButtonTextColor": cartTarget("back action text"),
  "expert.cartFooter.cartFooterDiscountTextColor": cartTarget("discount message"),
  "expert.cartFooter.cartFooterDiscountProgressBarEmptyColor": cartTarget("discount progress remainder"),
  "expert.cartFooter.cartFooterDiscountProgressBarFilledColor": cartTarget("discount progress fill"),
  "expert.mixAndMatchConfig.generalSettings.bundleUpsellButtonBg": target("upsell", ["upsell action"]),
  "expert.mixAndMatchConfig.generalSettings.bundleUpsellButtonTextColor": target("upsell", ["upsell action text"]),
  "expert.mixAndMatchConfig.generalSettings.bundleUpsellFontColor": target("upsell", ["upsell text"]),
};
const DESIGN_PREVIEW_FIELD_TARGET_MAP = new Map(Object.entries(DESIGN_PREVIEW_FIELD_TARGETS));

type JsonObject = Record<string, unknown>;

function readPath(source: JsonObject, path: string): string | undefined {
  let current: unknown = source;
  for (const segment of path.split(".")) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    // Runtime paths are drawn only from this module's fixed token mapping.
    // eslint-disable-next-line security/detect-object-injection
    current = (current as JsonObject)[segment];
  }
  return current === null || current === undefined || current === "" ? undefined : String(current);
}

function readFirstPath(source: JsonObject, paths: readonly string[], fallback: string) {
  for (const path of paths) {
    const value = readPath(source, path);
    if (value !== undefined) return value;
  }
  return fallback;
}

function weightValue(value: string) {
  return value.toLowerCase() === "bold" ? "700" : "400";
}

export function getDesignPreviewTemplate(templateKey: TemplateKey) {
  return DESIGN_PREVIEW_TEMPLATES.find((template) => template.key === templateKey);
}

export function getSupportedDesignPreviewSurfaces(templateKey: TemplateKey) {
  return getDesignPreviewTemplate(templateKey)?.supportedSurfaces ?? FULL_PAGE_SURFACES;
}

export function getDefaultDesignPreviewSurface(templateKey: TemplateKey): DesignPreviewSurface {
  return getDesignPreviewTemplate(templateKey)?.slotOrientation ? "product-slots" : "product-card";
}

export function getDesignPreviewFieldTarget(fieldKey: string, templateKey?: TemplateKey) {
  const fieldTarget = DESIGN_PREVIEW_FIELD_TARGET_MAP.get(fieldKey);
  if (!fieldTarget || !templateKey) return fieldTarget;
  const override = fieldTarget.surfaceOverrides
    ? new Map(Object.entries(fieldTarget.surfaceOverrides)).get(templateKey)
    : undefined;
  return override ? { ...fieldTarget, surface: override } : fieldTarget;
}

export function isDesignPreviewFieldApplicable(fieldKey: string, templateKey: TemplateKey) {
  const fieldTarget = getDesignPreviewFieldTarget(fieldKey, templateKey);
  return !fieldTarget?.templates || fieldTarget.templates.includes(templateKey);
}

export function getDesignFieldsForPreviewContext(
  fields: readonly SettingsField[],
  templateKey: TemplateKey,
  surface: DesignPreviewSurface,
) {
  return fields.filter((field) => {
    if (field.kind === "loadingSpinner") return false;
    const fieldKey = field.key ?? field.label;
    const fieldTarget = getDesignPreviewFieldTarget(fieldKey, templateKey);
    return Boolean(
      fieldTarget
      && (fieldTarget.surface === surface || fieldTarget.surfaces?.includes(surface))
      && isDesignPreviewFieldApplicable(fieldKey, templateKey),
    );
  });
}

export function getDesignPreviewScene(
  templateKey: TemplateKey,
  surface: DesignPreviewSurface,
  viewport: DesignPreviewViewport,
): DesignPreviewScene {
  const descriptor = getDesignPreviewTemplate(templateKey);
  if (!descriptor) throw new Error(`Unknown Design preview template "${templateKey}"`);

  const navigationRegion = descriptor.navigation === "list-steps"
    ? "product-list-step-flow"
    : descriptor.navigation === "grid-steps"
      ? "product-grid-step-headers"
      : descriptor.navigation;
  const categoryRegion = descriptor.categories === "accordion"
    ? "category-accordion"
    : descriptor.categories === "pills"
      ? "pill-categories"
      : descriptor.categories === "underline"
        ? "underline-categories"
        : "category-tabs";
  const regions: string[] = [];

  if (surface === "bundle-header") {
    regions.push("bundle-header");
  } else if (surface === "navigation" && navigationRegion !== "none") {
    regions.push(navigationRegion);
  } else if (surface === "categories" && descriptor.categories !== "none") {
    regions.push(categoryRegion);
  } else if (surface === "product-card") {
    regions.push(descriptor.productCard.mode === "row" ? "product-rows" : "product-grid");
  } else if (surface === "product-slots") {
    regions.push(`${descriptor.slotOrientation ?? "horizontal"}-slots`);
  } else if (surface === "product-picker" && descriptor.slotOrientation) {
    regions.push(viewport === "mobile" ? "product-picker-bottom-sheet" : "product-picker-modal");
  } else if (surface === "cart-summary") {
    if (templateKey === "product-list") regions.push("product-list-selected-drawer", "pdp-footer");
    else if (descriptor.family === "product-page") regions.push(descriptor.summary);
    else regions.push(viewport === "mobile" ? descriptor.sceneRegions.mobile.at(-1) ?? "sticky-summary-tray" : "summary-sidebar");
  } else {
    regions.push(`${surface}-overlay`);
  }

  return { templateKey, surface, viewport, regions: [...new Set(regions)] };
}

export function buildDesignPreviewTheme(
  fieldValues: Record<string, string>,
  inheritedColorFieldKeys: string[] = [],
  shopBrandColors: ShopBrandColors | null = null,
  templateKey: TemplateKey = "standard",
): DesignPreviewTheme {
  let runtime: ReturnType<typeof buildSettingsDesignRuntime>;
  try {
    runtime = buildSettingsDesignRuntime({ fieldValues, inheritedColorFieldKeys }, {}, shopBrandColors);
  } catch {
    runtime = buildSettingsDesignRuntime({ fieldValues: {}, inheritedColorFieldKeys: [] });
  }
  const page = runtime.pageCustomization as JsonObject;
  const styles = page.stylePresets as JsonObject;
  const isProductPage = getDesignPreviewTemplate(templateKey)?.family === "product-page";
  const productRoot = isProductPage ? "mixAndMatchConfig.productCard" : "productCard";
  const footerRoot = isProductPage ? "mixAndMatchConfig.footer" : "cartFooter";
  const tabsRoot = isProductPage ? "mixAndMatchConfig.tabs" : "navigationBanner";
  const toastRoot = isProductPage ? "mixAndMatchConfig.toast" : "generalSettings";
  const upsellRoot = isProductPage ? "mixAndMatchConfig.generalSettings" : "generalSettings";
  const slotIconUrl = readFirstPath(page, ["mixAndMatchConfig.emptyStateCard.slotIconUrl", "stylePresets.images.slotIconUrl"], "");
  const slotIconFit = normalizeSlotIconFit(readFirstPath(page, ["mixAndMatchConfig.emptyStateCard.slotIconFit", "stylePresets.images.slotIconFit"], "badge"));
  const slotIconImage = slotIconUrl ? `url("${slotIconUrl}")` : "none";

  return {
    "--preview-primary": readFirstPath(styles, ["colors.primaryColor"], "#000000"),
    "--preview-button-text": readFirstPath(styles, ["colors.buttonTextColor"], "#ffffff"),
    "--preview-primary-text": readFirstPath(styles, ["colors.primaryTextColor"], "#000000"),
    "--preview-accent": readFirstPath(styles, ["colors.accentColor"], "#eeeeee"),
    "--preview-discount-feedback-tier-bg": readFirstPath(styles, ["colors.discountTierBackgroundColor"], "#D1FAE5"),
    "--preview-discount-feedback-tier-text": readFirstPath(styles, ["colors.discountTierTextColor"], "#065F46"),
    "--preview-discount-feedback-complete-bg": readFirstPath(styles, ["colors.discountCompletionBackgroundColor"], "#047857"),
    "--preview-discount-feedback-complete-text": readFirstPath(styles, ["colors.discountCompletionTextColor"], "#FFFFFF"),
    "--preview-product-bg": readFirstPath(page, [`${productRoot}.productCardBgColor`], "#ffffff"),
    "--preview-product-text": readFirstPath(page, [`${productRoot}.${isProductPage ? "productCardTitleColor" : "productCardTextColor"}`], "#000000"),
    "--preview-product-button-bg": readFirstPath(page, [`${productRoot}.${isProductPage ? "productCardButtonBgColor" : "productCardButtonColor"}`], "#000000"),
    "--preview-product-button-text": readFirstPath(page, [`${productRoot}.productCardButtonTextColor`], "#ffffff"),
    "--preview-compare-price": readFirstPath(page, [`${productRoot}.${isProductPage ? "productCardComparedAtPriceColor" : "compareAtPriceColor"}`], "#000000"),
    "--preview-quantity-bg": readFirstPath(page, [`${productRoot}.${isProductPage ? "productCardQuantityButtonBgColor" : "productCardQuantitySelectorBgColor"}`], "#eeeeee"),
    "--preview-quantity-text": readFirstPath(page, [`${productRoot}.${isProductPage ? "productCardQuantityLabelColor" : "quantitySelectorButtonTextColor"}`], "#000000"),
    "--preview-primary-font-size": readFirstPath(styles, ["typography.primaryFontSize"], "16px"),
    "--preview-primary-font-weight": weightValue(readFirstPath(styles, ["typography.primaryFontWeight"], "Bold")),
    "--preview-secondary-font-size": readFirstPath(styles, ["typography.secondaryFontSize"], "14px"),
    "--preview-secondary-font-weight": weightValue(readFirstPath(styles, ["typography.secondaryFontWeight"], "Bold")),
    "--preview-body-font-size": readFirstPath(styles, ["typography.bodyFontSize"], "14px"),
    "--preview-body-font-weight": weightValue(readFirstPath(styles, ["typography.bodyFontWeight"], "Regular")),
    "--preview-button-radius": readFirstPath(page, [`${productRoot}.${isProductPage ? "productCardButtonBorderRadius" : "buttonBorderRadius"}`], "5px"),
    "--preview-card-radius": readFirstPath(page, [`${productRoot}.${isProductPage ? "productCardBorderRadius" : "cardBorderRadius"}`], "10px"),
    "--preview-image-radius": readFirstPath(page, [`${productRoot}.${isProductPage ? "productCardImageBorderRadius" : "cardImageBorderRadius"}`], "8px"),
    "--preview-image-fit": readFirstPath(page, [`${productRoot}.${isProductPage ? "productCardImageFit" : "productImageFit"}`], "cover"),
    "--preview-step-completed": readFirstPath(page, ["navigationBanner.navigationBannerStepCompletionColor"], "#000000"),
    "--preview-step-check": readFirstPath(page, ["navigationBanner.navigationCheckColor"], "#ffffff"),
    "--preview-step-text": readFirstPath(page, ["navigationBanner.navigationBannerStepTextColor"], "#000000"),
    "--preview-step-empty": readFirstPath(page, ["navigationBanner.navigationBannerStepProgressBarEmptyColor"], "#cccccc"),
    "--preview-page-title": readFirstPath(page, ["generalSettings.productPageTitleColor"], "#000000"),
    "--preview-loading-bg": readFirstPath(page, ["generalSettings.loadingBgColor"], "rgba(255,255,255,0.92)"),
    "--preview-toast-bg": readFirstPath(page, [`${toastRoot}.${isProductPage ? "toastBgColor" : "conditionToastBgColor"}`], "#000000"),
    "--preview-toast-text": readFirstPath(page, [`${toastRoot}.${isProductPage ? "toastTextColor" : "conditionToastTextColor"}`], "#ffffff"),
    "--preview-tab-active-bg": readFirstPath(page, [`${tabsRoot}.tabsActiveBgColor`, "categoryBlock.tabActiveBgColor"], "#000000"),
    "--preview-tab-active-text": readFirstPath(page, [`${tabsRoot}.tabsActiveTextColor`, "categoryBlock.tabActiveTextColor"], "#ffffff"),
    "--preview-tab-inactive-bg": readFirstPath(page, [`${tabsRoot}.tabsInactiveBgColor`, "categoryBlock.tabInactiveBgColor"], "#eeeeee"),
    "--preview-tab-inactive-text": readFirstPath(page, [`${tabsRoot}.tabsInactiveTextColor`, "categoryBlock.tabInactiveTextColor"], "#000000"),
    "--preview-empty-bg": readFirstPath(page, ["mixAndMatchConfig.emptyStateCard.emptyStateCardBgColor"], "#ffffff"),
    "--preview-empty-border": readFirstPath(page, ["mixAndMatchConfig.emptyStateCard.emptyStateCardBorderColor"], "#000000"),
    "--preview-empty-icon": readFirstPath(page, ["mixAndMatchConfig.emptyStateCard.emptyStateCardIconColor"], "#000000"),
    "--preview-empty-text": readFirstPath(page, ["mixAndMatchConfig.emptyStateCard.emptyStateCardTextColor"], "#3e3e3e"),
    "--preview-slot-icon-url": slotIconUrl,
    "--preview-slot-icon-fit": slotIconFit,
    "--preview-slot-icon-badge-image": slotIconFit === "badge" ? slotIconImage : "none",
    "--preview-slot-icon-card-image": slotIconFit === "badge" ? "none" : slotIconImage,
    "--preview-slot-icon-card-size": slotIconFit === "cover" ? "cover" : "contain",
    "--preview-slot-icon-plus-display": slotIconFit === "badge" && slotIconUrl ? "none" : "flex",
    "--preview-slot-icon-badge-display": slotIconFit !== "badge" && slotIconUrl ? "none" : "flex",
    "--preview-cart-bg": readFirstPath(page, [`${footerRoot}.${isProductPage ? "footerBgColor" : "cartFooterBgColor"}`], "#ffffff"),
    "--preview-cart-text": readFirstPath(page, [`${footerRoot}.${isProductPage ? "footerTextColor" : "cartFooterTextColor"}`], "#000000"),
    "--preview-cart-next-bg": readFirstPath(page, [`${footerRoot}.${isProductPage ? "footerNextBtnBgColor" : "cartFooterNextButtonColor"}`], "#000000"),
    "--preview-cart-next-text": readFirstPath(page, [`${footerRoot}.${isProductPage ? "footerNextBtnTextColor" : "cartFooterNextButtonTextColor"}`], "#ffffff"),
    "--preview-cart-back-bg": readFirstPath(page, ["cartFooter.cartFooterBackButtonColor"], "#6d7175"),
    "--preview-cart-back-text": readFirstPath(page, [`${footerRoot}.${isProductPage ? "footerBackBtnTextColor" : "cartFooterBackButtonTextColor"}`], "#000000"),
    "--preview-discount-text": readFirstPath(page, [isProductPage ? "mixAndMatchConfig.bundleHeader.headerDiscountTextColor" : "cartFooter.cartFooterDiscountTextColor"], "#000000"),
    "--preview-discount-progress-empty": readFirstPath(page, [`${footerRoot}.${isProductPage ? "footerDiscountProgressBarEmptyColor" : "cartFooterDiscountProgressBarEmptyColor"}`], "#c1e7c5"),
    "--preview-discount-progress-filled": readFirstPath(page, [`${footerRoot}.${isProductPage ? "footerDiscountProgressBarFilledColor" : "cartFooterDiscountProgressBarFilledColor"}`], "#15a524"),
    "--preview-add-bundle-bg": readFirstPath(page, ["mixAndMatchConfig.addBundleBtn.addBundleBtnBgColor"], "#000000"),
    "--preview-add-bundle-text": readFirstPath(page, ["mixAndMatchConfig.addBundleBtn.addBundleBtnTextColor"], "#ffffff"),
    "--preview-upsell-button-bg": readFirstPath(page, [`${upsellRoot}.${isProductPage ? "bundleUpsellButtonBg" : "bundleUpSellButtonBg"}`], "#000000"),
    "--preview-upsell-button-text": readFirstPath(page, [`${upsellRoot}.${isProductPage ? "bundleUpsellButtonTextColor" : "bundleUpsellTextColor"}`], "#ffffff"),
    "--preview-upsell-text": readFirstPath(page, [`${upsellRoot}.bundleUpsellFontColor`], "#000000"),
  };
}

export function buildDesignPreviewStorefrontCss({
  fieldValues,
  inheritedColorFieldKeys = [],
  shopBrandColors = null,
  templateKey,
}: {
  fieldValues: Record<string, string>;
  inheritedColorFieldKeys?: string[];
  shopBrandColors?: ShopBrandColors | null;
  templateKey: TemplateKey;
}) {
  const runtime = buildSettingsDesignRuntime(
    { fieldValues, inheritedColorFieldKeys },
    {},
    shopBrandColors,
  );
  const bundleType = getDesignPreviewTemplate(templateKey)?.bundleType ?? "full_page";
  return generateCSSFromSettings(
    runtime.cssSettings,
    bundleType,
    "",
    shopBrandColors,
  );
}
