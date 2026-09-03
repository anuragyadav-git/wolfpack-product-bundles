export const PRICING_TIER_BADGE_SHAPES = [
  "pill",
  "folded",
  "banner_rounded",
] as const;

export const PRICING_TIER_BADGE_VISIBILITIES = ["always", "selected"] as const;

export type PricingTierBadgeShape = typeof PRICING_TIER_BADGE_SHAPES[number];
export type PricingTierBadgeVisibility = typeof PRICING_TIER_BADGE_VISIBILITIES[number];

export interface PricingTierBadge {
  enabled: boolean;
  text: string;
  shape: PricingTierBadgeShape;
  visibility: PricingTierBadgeVisibility;
  foregroundColor?: string;
  backgroundColor?: string;
}

export interface PricingTierBadgeTemplateValues {
  savedPercentage?: string;
  savedTotal?: string;
}

const VARIABLE_TO_VALUE = {
  saved_percentage: "savedPercentage",
  saved_total: "savedTotal",
} as const;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const TEMPLATE_VARIABLE = /{{\s*([a-z_]+)\s*}}/g;

function normalizedOptionalColor(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const color = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!HEX_COLOR.test(color)) {
    throw new Error(`pricing tier badge: invalid ${field} color`);
  }
  return color;
}

function templateVariables(text: string): string[] {
  return Array.from(text.matchAll(TEMPLATE_VARIABLE), (match) => match[1]);
}

export function parsePricingTierBadge(raw: unknown): PricingTierBadge | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("pricing tier badge: input must be an object");
  }

  const input = raw as Record<string, unknown>;
  const enabled = input.enabled === true;
  const text = typeof input.text === "string" ? input.text.trim() : "";
  const shape = input.shape ?? "pill";
  const visibility = input.visibility ?? "always";

  if (!PRICING_TIER_BADGE_SHAPES.includes(shape as PricingTierBadgeShape)) {
    throw new Error("pricing tier badge: invalid shape");
  }
  if (!PRICING_TIER_BADGE_VISIBILITIES.includes(visibility as PricingTierBadgeVisibility)) {
    throw new Error("pricing tier badge: invalid visibility");
  }
  if (enabled && !text) {
    throw new Error("pricing tier badge: text is required when enabled");
  }

  const variables = templateVariables(text);
  const unsupported = variables.find((variable) => !(variable in VARIABLE_TO_VALUE));
  if (unsupported) {
    throw new Error(`pricing tier badge: unsupported variable {{${unsupported}}}`);
  }
  const textWithoutVariables = text.replace(TEMPLATE_VARIABLE, "");
  if (textWithoutVariables.includes("{{") || textWithoutVariables.includes("}}")) {
    throw new Error("pricing tier badge: malformed variable");
  }

  const foregroundColor = normalizedOptionalColor(input.foregroundColor, "foreground");
  const backgroundColor = normalizedOptionalColor(input.backgroundColor, "background");

  return {
    enabled,
    text,
    shape: shape as PricingTierBadgeShape,
    visibility: visibility as PricingTierBadgeVisibility,
    ...(foregroundColor ? { foregroundColor } : {}),
    ...(backgroundColor ? { backgroundColor } : {}),
  };
}

export function validatePricingTierBadgeForMethod(
  badge: PricingTierBadge,
  method: string,
  bxyDiscountType?: string,
): string | null {
  if (!badge.enabled) return null;
  const variables = new Set(templateVariables(badge.text));
  const normalizedMethod = String(method || "").toLowerCase();
  const percentageAvailable = normalizedMethod === "percentage_off"
    || (normalizedMethod === "buy_x_get_y" && bxyDiscountType !== "fixed_amount");
  const totalAvailable = normalizedMethod === "fixed_amount_off";

  if (variables.has("saved_percentage") && !percentageAvailable) {
    return "{{saved_percentage}} is available only for percentage discounts.";
  }
  if (variables.has("saved_total") && !totalAvailable) {
    return "{{saved_total}} is available only for fixed amount discounts.";
  }
  return null;
}

export function renderPricingTierBadgeText(
  badge: PricingTierBadge,
  values: PricingTierBadgeTemplateValues,
): string | null {
  if (!badge.enabled || !badge.text) return null;

  let unresolved = false;
  const rendered = badge.text.replace(TEMPLATE_VARIABLE, (_match, variable: keyof typeof VARIABLE_TO_VALUE) => {
    const value = values[VARIABLE_TO_VALUE[variable]];
    if (typeof value !== "string" || !value.trim()) {
      unresolved = true;
      return "";
    }
    return value.trim();
  });

  return unresolved || !rendered.trim() ? null : rendered.trim();
}
