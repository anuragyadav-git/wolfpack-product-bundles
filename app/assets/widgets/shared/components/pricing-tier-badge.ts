import {
  parsePricingTierBadge,
  renderPricingTierBadgeText,
  type PricingTierBadgeTemplateValues,
} from '../../../../lib/pricing-tier-badge.js';

export function getPricingTierBadgeTemplateValues(
  rule: Record<string, any>,
  method: string,
  formatMoney?: (cents: number) => string,
): PricingTierBadgeTemplateValues {
  const normalizedMethod = String(method || '').toLowerCase();
  const discountValue = Number(rule?.discountValue ?? 0);
  if (!Number.isFinite(discountValue) || discountValue < 0) return {};

  if (
    normalizedMethod === 'percentage_off'
    || (normalizedMethod === 'buy_x_get_y' && rule?.bxyDiscountType !== 'fixed_amount')
  ) {
    return { savedPercentage: `${Number(discountValue.toFixed(2))}%` };
  }
  if (normalizedMethod === 'fixed_amount_off' && typeof formatMoney === 'function') {
    return { savedTotal: formatMoney(discountValue) };
  }
  return {};
}
export function createPricingTierBadgeElement(
  rawBadge: unknown,
  values: PricingTierBadgeTemplateValues,
  options: {
    document?: Document;
    id?: string;
    selected?: boolean;
  } = {},
): HTMLElement | null {
  let badge;
  try {
    badge = parsePricingTierBadge(rawBadge);
  } catch {
    return null;
  }
  if (!badge) return null;

  const text = renderPricingTierBadgeText(badge, values);
  if (!text) return null;

  const runtimeDocument = options.document || document;
  const element = runtimeDocument.createElement('span');
  element.className = 'wpb-pricing-tier-badge';
  element.dataset.wpbPricingTierBadge = 'true';
  element.dataset.shape = badge.shape;
  element.dataset.visibility = badge.visibility;
  element.textContent = text;
  element.hidden = badge.visibility === 'selected' && options.selected !== true;
  if (options.id) element.id = options.id;
  if (badge.foregroundColor) {
    element.style.setProperty('--wpb-tier-badge-color', badge.foregroundColor);
  }
  if (badge.backgroundColor) {
    element.style.setProperty('--wpb-tier-badge-background', badge.backgroundColor);
  }
  return element;
}
