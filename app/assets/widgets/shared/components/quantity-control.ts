/**
 * Shared quantity control renderer.
 *
 * Keeps legacy class names for event-handler compatibility while adding a
 * stable `bw-quantity-control` contract for migrated templates.
 */

'use strict';

export function renderQuantityControl({
  selectionId,
  quantity = 0,
  decreaseDisabled = false,
  increaseDisabled = false,
  className = '',
  productName = '',
  quantityAriaLabel = 'Quantity',
  decreaseLabel = 'Decrease quantity',
  increaseLabel = 'Increase quantity',
  removeLabel = 'Remove',
  soldOutAriaLabel = 'Out of stock',
}: any = {}) {
  const key = escapeHtml(selectionId || '');
  const normalizedQuantity = Math.max(0, Number(quantity || 0));
  const safeProductName = String(productName || '').trim();
  const baseAriaTarget = safeProductName ? `${safeProductName}` : 'product';
  const quantityLabel = `${quantityAriaLabel}: ${normalizedQuantity}`;
  const decreaseAriaLabel = `${normalizedQuantity <= 1 ? `${removeLabel} ${baseAriaTarget}` : `${decreaseLabel} ${baseAriaTarget}`}`;
  const increaseAriaLabel = `${increaseLabel} ${baseAriaTarget}`;
  const stockAriaState = normalizedQuantity === 0 && (decreaseDisabled || increaseDisabled)
    ? soldOutAriaLabel
    : quantityLabel;
  const classes = ['bw-quantity-control', 'inline-quantity-controls', className]
    .filter(Boolean)
    .join(' ');

  return `
    <div class="${classes}" data-product-id="${key}" role="group" aria-label="${escapeHtml(quantityAriaLabel)} controls" aria-live="polite">
      <button type="button" class="bw-quantity-control__button inline-qty-btn qty-decrease" data-product-id="${key}" aria-label="${escapeAttribute(decreaseAriaLabel)}" ${decreaseDisabled || normalizedQuantity === 0 ? 'disabled aria-disabled="true"' : ''}>−</button>
      <span class="bw-quantity-control__value inline-qty-display" aria-label="${escapeAttribute(stockAriaState)}" aria-live="polite">${normalizedQuantity}</span>
      <button type="button" class="bw-quantity-control__button inline-qty-btn qty-increase" data-product-id="${key}" aria-label="${escapeAttribute(increaseAriaLabel)}" ${increaseDisabled ? 'disabled aria-disabled="true"' : ''}>+</button>
    </div>
  `;
}

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
