import type { BundleContractType, TemplateKey } from "../../../lib/bundle-config/template-selection";
import {
  getSupportedDesignPreviewAreas,
  getSupportedDesignPreviewScenarios,
  type DesignPreviewArea,
  type DesignPreviewScenario,
  type DesignPreviewViewport,
} from "./design-preview-model";

export const PREVIEW_PROTOCOL_VERSION = 2 as const;

const TEMPLATE_KEYS = new Set<TemplateKey>([
  "standard",
  "classic",
  "compact",
  "horizontal",
  "product-list",
  "product-grid",
  "horizontal-slots",
  "vertical-slots",
]);
const AREAS = new Set<DesignPreviewArea>([
  "bundle-header",
  "navigation",
  "categories",
  "product-card",
  "product-slots",
  "cart-summary",
]);
const SCENARIOS = new Set<DesignPreviewScenario>([
  "default",
  "product-picker",
  "loading",
  "validation",
  "upsell",
]);
const VIEWPORTS = new Set<DesignPreviewViewport>(["desktop", "mobile"]);
const BUNDLE_TYPES = new Set<BundleContractType>(["full_page", "product_page"]);

function templateMatchesBundleType(templateKey: TemplateKey, bundleType: BundleContractType) {
  const isFullPage = ["standard", "classic", "compact", "horizontal"].includes(templateKey);
  return bundleType === "full_page" ? isFullPage : !isFullPage;
}

export type StorefrontPreviewInitializePayload = {
  bundleType: BundleContractType;
  templateKey: TemplateKey;
  viewport: DesignPreviewViewport;
  area: DesignPreviewArea;
  areaLabel: string;
  scenario: DesignPreviewScenario;
  designCss: string;
  locale: string;
  currency: string;
};

export type StorefrontPreviewCommand =
  | { version: 2; type: "INITIALIZE"; payload: StorefrontPreviewInitializePayload }
  | { version: 2; type: "UPDATE_DESIGN"; payload: { designCss: string } }
  | { version: 2; type: "SET_TEMPLATE"; payload: { bundleType: BundleContractType; templateKey: TemplateKey } }
  | { version: 2; type: "SET_VIEWPORT"; payload: { viewport: DesignPreviewViewport } }
  | { version: 2; type: "SET_AREA"; payload: { area: DesignPreviewArea; areaLabel: string } }
  | { version: 2; type: "SET_SCENARIO"; payload: { scenario: DesignPreviewScenario } }
  | { version: 2; type: "RESET_INTERACTION"; payload: Record<string, never> };

export type StorefrontPreviewEvent =
  | { version: 2; type: "READY"; payload: Record<string, never> }
  | { version: 2; type: "INTERACTION_CHANGED"; payload: { selectedQuantity: number } }
  | { version: 2; type: "SCENARIO_CHANGED"; payload: { scenario: DesignPreviewScenario } }
  | { version: 2; type: "ERROR"; payload: { message: string } };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasProtocolEnvelope(value: unknown): value is Record<string, unknown> {
  return isRecord(value)
    && value.version === PREVIEW_PROTOCOL_VERSION
    && typeof value.type === "string"
    && isRecord(value.payload);
}

export function isStorefrontPreviewCommand(value: unknown): value is StorefrontPreviewCommand {
  if (!hasProtocolEnvelope(value)) return false;
  const payload = value.payload as Record<string, unknown>;

  if (value.type === "INITIALIZE") {
    return BUNDLE_TYPES.has(payload.bundleType as BundleContractType)
      && TEMPLATE_KEYS.has(payload.templateKey as TemplateKey)
      && templateMatchesBundleType(payload.templateKey as TemplateKey, payload.bundleType as BundleContractType)
      && VIEWPORTS.has(payload.viewport as DesignPreviewViewport)
      && AREAS.has(payload.area as DesignPreviewArea)
      && getSupportedDesignPreviewAreas(payload.templateKey as TemplateKey).includes(payload.area as DesignPreviewArea)
      && typeof payload.areaLabel === "string"
      && SCENARIOS.has(payload.scenario as DesignPreviewScenario)
      && getSupportedDesignPreviewScenarios(payload.templateKey as TemplateKey).includes(payload.scenario as DesignPreviewScenario)
      && typeof payload.designCss === "string"
      && typeof payload.locale === "string"
      && typeof payload.currency === "string";
  }
  if (value.type === "UPDATE_DESIGN") return typeof payload.designCss === "string";
  if (value.type === "SET_TEMPLATE") {
    return BUNDLE_TYPES.has(payload.bundleType as BundleContractType)
      && TEMPLATE_KEYS.has(payload.templateKey as TemplateKey)
      && templateMatchesBundleType(payload.templateKey as TemplateKey, payload.bundleType as BundleContractType);
  }
  if (value.type === "SET_VIEWPORT") return VIEWPORTS.has(payload.viewport as DesignPreviewViewport);
  if (value.type === "SET_AREA") {
    return AREAS.has(payload.area as DesignPreviewArea) && typeof payload.areaLabel === "string";
  }
  if (value.type === "SET_SCENARIO") return SCENARIOS.has(payload.scenario as DesignPreviewScenario);
  return value.type === "RESET_INTERACTION";
}

export function isStorefrontPreviewEvent(value: unknown): value is StorefrontPreviewEvent {
  if (!hasProtocolEnvelope(value)) return false;
  const payload = value.payload as Record<string, unknown>;
  if (value.type === "READY") return true;
  if (value.type === "INTERACTION_CHANGED") return Number.isFinite(payload.selectedQuantity);
  if (value.type === "SCENARIO_CHANGED") return SCENARIOS.has(payload.scenario as DesignPreviewScenario);
  return value.type === "ERROR" && typeof payload.message === "string";
}

export function isTrustedStorefrontPreviewMessage(
  event: Pick<MessageEvent, "origin" | "source">,
  expectedOrigin: string,
  expectedSource: MessageEventSource | null,
) {
  return event.origin === expectedOrigin && event.source === expectedSource;
}
