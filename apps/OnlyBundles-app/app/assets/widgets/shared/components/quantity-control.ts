/**
 * Shared quantity control renderer.
 *
 * Keeps legacy class names for event-handler compatibility while adding a
 * stable `bw-quantity-control` contract for migrated templates.
 */

'use strict';

export function createQuantityControlElement({
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
  document: runtimeDocument = document,
}: any = {}) {
  const key = String(selectionId || '');
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

  const root = runtimeDocument.createElement('div');
  root.className = classes;
  root.dataset.productId = key;
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', `${quantityAriaLabel} controls`);
  root.setAttribute('aria-live', 'polite');

  const decrease = runtimeDocument.createElement('button');
  decrease.type = 'button';
  decrease.className = 'bw-quantity-control__button inline-qty-btn qty-decrease';
  decrease.dataset.productId = key;
  decrease.setAttribute('aria-label', decreaseAriaLabel);
  decrease.textContent = '−';
  decrease.disabled = decreaseDisabled || normalizedQuantity === 0;
  if (decrease.disabled) decrease.setAttribute('aria-disabled', 'true');

  const display = runtimeDocument.createElement('span');
  display.className = 'bw-quantity-control__value inline-qty-display';
  display.setAttribute('aria-label', stockAriaState);
  display.setAttribute('aria-live', 'polite');
  display.textContent = String(normalizedQuantity);

  const increase = runtimeDocument.createElement('button');
  increase.type = 'button';
  increase.className = 'bw-quantity-control__button inline-qty-btn qty-increase';
  increase.dataset.productId = key;
  increase.setAttribute('aria-label', increaseAriaLabel);
  increase.textContent = '+';
  increase.disabled = increaseDisabled;
  if (increase.disabled) increase.setAttribute('aria-disabled', 'true');

  root.append(decrease, display, increase);
  return root;
}
