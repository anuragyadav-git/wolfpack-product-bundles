/**
 * Shared cart-line metadata helpers.
 *
 * These helpers build the display metadata used by FPB and PPB cart lines.
 * Cart submission, variant IDs, selling plans, and post-add behavior stay owned
 * by the widget controllers for now.
 */

'use strict';

const DEFAULT_CART_LINE_LABELS: any = {
  items: 'Items',
  retailPrice: 'Retail Price',
  youSave: 'You Save',
};

function formatCartLineItemTitle(product: any = {}) {
  const title = String(product.title || product.id || '');
  const variantTitle = String(product.variantTitle || product.variant || '').trim();
  if (!variantTitle || variantTitle === 'Default Title' || title.endsWith(`(${variantTitle})`)) {
    return title;
  }
  return `${title} (${variantTitle})`;
}

export function buildCartLineSourceProperties({
  selectedLines = [],
  retailPrice = '',
  discountAmount = '',
  discountPercentage = null,
  box = '1',
  includeBox = true,
  labels = null,
}: any = {}) {
  const displayProperties: any = {
    items: selectedLines
      .map(({ product = {}, quantity = 0 }: any) => `${Number(quantity || 0)} x ${formatCartLineItemTitle(product)}`)
      .join(', '),
    retailPrice: String(retailPrice || ''),
  };

  if (includeBox !== false) {
    displayProperties.box = String(box || '1');
  }

  if (discountAmount) {
    const percentage = `${Math.round(Number(discountPercentage || 0))}%`;
    displayProperties.youSave = {
      amount: String(discountAmount),
      percentage,
      amountPercentage: `${discountAmount} (${percentage})`,
    };
  }

  if (labels) {
    displayProperties.labels = {
      ...DEFAULT_CART_LINE_LABELS,
      ...labels,
    };
  }

  return {
    _bundle_display_properties: JSON.stringify(displayProperties),
  };
}

export function buildCartLineDisplayProperties(displayProperties: any = {}, labels = DEFAULT_CART_LINE_LABELS) {
  const cartLineLabels: any = {
    ...DEFAULT_CART_LINE_LABELS,
    ...labels,
  };
  const properties: any = {
    Box: displayProperties.box || '1',
    [cartLineLabels.items]: displayProperties.items,
    [cartLineLabels.retailPrice]: displayProperties.retailPrice,
    _bundle_display_properties: JSON.stringify(displayProperties),
  };

  if (displayProperties.youSave?.amountPercentage) {
    properties[cartLineLabels.youSave] = displayProperties.youSave.amountPercentage;
  }

  return properties;
}
