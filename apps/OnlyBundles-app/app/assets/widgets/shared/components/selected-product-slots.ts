/**
 * Shared selected product slot renderer.
 *
 * Slots can be used by sidebars, modal summaries, and mobile trays. The caller
 * supplies prepared slot/product state and owns all business rules.
 */

'use strict';

import { createSelectedProductRowElement } from './selected-product-row.js';

export function createSelectedProductSlotsElement(slots: any[] = [], options: any = {}) {
  const runtimeDocument: Document = options.document || document;
  const mode = options.mode || 'grid';
  const classes = [
    'bw-selected-slots',
    `bw-selected-slots--mode-${mode}`,
    options.className || '',
  ].filter(Boolean).join(' ');

  const root = runtimeDocument.createElement('div');
  root.className = classes;
  root.dataset.bwSelectedSlots = 'true';
  slots.forEach((slot, index) => root.append(createSlot(slot, index, options, runtimeDocument)));
  return root;
}

function createSlot(slot: any = {}, index: number, options: any, runtimeDocument: Document) {
  const product = slot.product || null;
  const slotId = slot.id || `slot-${index}`;
  const label = slot.label || `Slot ${index + 1}`;
  const statusClasses = getStatusClasses(product);
  const classes = [
    'bw-selected-slot',
    product ? 'bw-selected-slot--filled' : 'bw-selected-slot--empty',
    ...statusClasses,
  ].join(' ');

  if (!product) {
    const iconUrl = slot.iconUrl || options.emptySlotIconUrl || '';
    const button = runtimeDocument.createElement('button');
    button.type = 'button';
    button.className = classes;
    button.dataset.bwSelectedSlot = 'true';
    button.dataset.slotId = String(slotId);
    button.dataset.action = 'select-slot';
    if (iconUrl) {
      const image = runtimeDocument.createElement('img');
      image.className = 'bw-selected-slot__icon';
      image.src = iconUrl;
      image.alt = '';
      image.loading = 'lazy';
      button.append(image);
    } else {
      const placeholder = runtimeDocument.createElement('span');
      placeholder.className = 'bw-selected-slot__placeholder';
      button.append(placeholder);
    }
    const labelElement = runtimeDocument.createElement('span');
    labelElement.className = 'bw-selected-slot__label';
    labelElement.textContent = label;
    button.append(labelElement);
    return button;
  }

  const root = runtimeDocument.createElement('div');
  root.className = classes;
  root.dataset.bwSelectedSlot = 'true';
  root.dataset.slotId = String(slotId);
  if (slot.label) {
    const labelElement = runtimeDocument.createElement('div');
    labelElement.className = 'bw-selected-slot__label';
    labelElement.textContent = slot.label;
    root.append(labelElement);
  }
  root.append(createSelectedProductRowElement(product, {
    className: 'bw-selected-slot__row',
    removable: product.isDefault !== true && product.isLocked !== true && options.removable !== false,
    document: runtimeDocument,
  }));
  return root;
}

function getStatusClasses(product: any) {
  if (!product) return [];

  return [
    product.isDefault ? 'bw-selected-slot--default' : '',
    product.isFreeGift ? 'bw-selected-slot--free-gift' : '',
    product.isLocked ? 'bw-selected-slot--locked' : '',
  ].filter(Boolean);
}
