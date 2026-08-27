import type { BundleContractType, TemplateKey } from "../../../lib/bundle-config/template-selection";
import type { DesignPreviewSurface, DesignPreviewViewport } from "./design-preview-model";

export const PREVIEW_PROTOCOL_VERSION = 1 as const;

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
const SURFACES = new Set<DesignPreviewSurface>([
  "bundle-header",
  "navigation",
  "categories",
  "product-card",
  "product-slots",
  "product-picker",
  "cart-summary",
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
  surface: DesignPreviewSurface;
  designCss: string;
  locale: string;
  currency: string;
};

export type StorefrontPreviewCommand =
  | { version: 1; type: "INITIALIZE"; payload: StorefrontPreviewInitializePayload }
  | { version: 1; type: "UPDATE_DESIGN"; payload: { designCss: string } }
  | { version: 1; type: "SET_TEMPLATE"; payload: { bundleType: BundleContractType; templateKey: TemplateKey } }
  | { version: 1; type: "SET_VIEWPORT"; payload: { viewport: DesignPreviewViewport } }
  | { version: 1; type: "SET_SURFACE"; payload: { surface: DesignPreviewSurface } }
  | { version: 1; type: "RESET_INTERACTION"; payload: Record<string, never> };

export type StorefrontPreviewEvent =
  | { version: 1; type: "READY"; payload: Record<string, never> }
  | { version: 1; type: "STATE_CHANGED"; payload: { surface: DesignPreviewSurface; selectedQuantity: number } }
  | { version: 1; type: "ERROR"; payload: { message: string } };

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
      && SURFACES.has(payload.surface as DesignPreviewSurface)
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
  if (value.type === "SET_SURFACE") return SURFACES.has(payload.surface as DesignPreviewSurface);
  return value.type === "RESET_INTERACTION";
}

export function isStorefrontPreviewEvent(value: unknown): value is StorefrontPreviewEvent {
  if (!hasProtocolEnvelope(value)) return false;
  const payload = value.payload as Record<string, unknown>;
  if (value.type === "READY") return true;
  if (value.type === "STATE_CHANGED") {
    return SURFACES.has(payload.surface as DesignPreviewSurface)
      && Number.isFinite(payload.selectedQuantity);
  }
  return value.type === "ERROR" && typeof payload.message === "string";
}

export function isTrustedStorefrontPreviewMessage(
  event: Pick<MessageEvent, "origin" | "source">,
  expectedOrigin: string,
  expectedSource: MessageEventSource | null,
) {
  return event.origin === expectedOrigin && event.source === expectedSource;
}
