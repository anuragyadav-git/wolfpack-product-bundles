import type { CSSProperties } from "react";
import type {
  BundleContractType,
  TemplateKey,
  TemplateSelection,
} from "../../../lib/bundle-config/template-selection";

export type DesignPreviewArea =
  | "bundle-header"
  | "navigation"
  | "categories"
  | "product-card"
  | "product-slots"
  | "cart-summary";
export type DesignPreviewScenario =
  | "default"
  | "product-picker"
  | "loading"
  | "validation"
  | "upsell";
export type DesignPreviewContext =
  | { kind: "area"; value: DesignPreviewArea }
  | { kind: "scenario"; value: Exclude<DesignPreviewScenario, "default"> };
export type DesignPreviewFamily = "full-page" | "product-page";
export type DesignPreviewViewport = "desktop" | "mobile";
export type DesignPreviewAvailableSize = { width: number; height: number };
export type DesignPreviewContextKind =
  | "full-page"
  | "product-page-inpage"
  | "product-page-modal";
export type DesignPreviewContextFidelity = "storefront" | "representative";
export type DesignPreviewNavigation =
  | "timeline"
  | "compact-timeline"
  | "horizontal-timeline"
  | "list-steps"
  | "grid-steps"
  | "none";
export type DesignPreviewCategories =
  | "accordion"
  | "pills"
  | "underline"
  | "tabs"
  | "none";
export type DesignPreviewSummary =
  | "rows"
  | "slot-grid"
  | "compact-slots"
  | "list-selected-drawer"
  | "pdp-footer"
  | "modal-footer";

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
  supportedAreas: readonly DesignPreviewArea[];
  supportedScenarios: readonly DesignPreviewScenario[];
  sceneRegions: Record<DesignPreviewViewport, readonly string[]>;
}

export interface DesignPreviewFieldTarget {
  target: DesignPreviewContext;
  targets?: readonly DesignPreviewContext[];
  elements: readonly string[];
  templates?: readonly TemplateKey[];
  targetOverrides?: Partial<Record<TemplateKey, DesignPreviewContext>>;
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
  context: DesignPreviewContext;
  viewport: DesignPreviewViewport;
  regions: readonly string[];
}

export type DesignPreviewTheme = CSSProperties &
  Record<`--preview-${string}`, string>;
