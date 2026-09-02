/**
 * Shared selected product row renderer.
 *
 * Renders prepared display data only; selection rules, default-product rules,
 * and free-gift lock state stay in the caller until templates migrate.
 */

'use strict';

import { createTrashIcon } from '../svg-icons.js';

const SELECTED_ROW_PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"%3E%3Crect width="96" height="96" fill="%23f3f4f6"/%3E%3C/svg%3E';

export function createSelectedProductRowElement(product: any = null, options: any = {}) {
  const runtimeDocument: Document = options.document || document;
  if (!product) return createEmptyRow(options, runtimeDocument);

  const selectionKey = String(product.selectionId || '');
  const title = product.title || product.parentTitle || '';
  const variantTitle = product.variantTitle || product.variant || '';
  const quantity = Math.max(0, Number(product.quantity || 0));
  const quantityLabel = product.quantityLabel || options.quantityLabel || `x${quantity}`;
  const imageUrl = product.imageUrl || product.image?.src || SELECTED_ROW_PLACEHOLDER_IMAGE;
  const removable = product.isDefault !== true && product.isLocked !== true && options.removable !== false;
  const classes = [
    'bw-selected-row',
    'bw-selected-row--filled',
    product.isDefault ? 'bw-selected-row--default' : '',
    product.isFreeGift ? 'bw-selected-row--free-gift' : '',
    product.isLocked ? 'bw-selected-row--locked' : '',
    options.className || '',
  ].filter(Boolean).join(' ');

  const root = runtimeDocument.createElement('div');
  root.className = classes;
  root.dataset.bwSelectedRow = 'true';
  root.dataset.variantId = selectionKey;
  const media = runtimeDocument.createElement('div');
  media.className = 'bw-selected-row__media';
  const image = runtimeDocument.createElement('img');
  image.className = 'bw-selected-row__image';
  image.src = imageUrl;
  image.alt = title;
  image.loading = 'lazy';
  media.append(image);
  const body = runtimeDocument.createElement('div');
  body.className = 'bw-selected-row__body';
  const titleElement = runtimeDocument.createElement('div');
  titleElement.className = 'bw-selected-row__title';
  titleElement.textContent = title;
  body.append(titleElement);
  if (variantTitle) {
    const variant = runtimeDocument.createElement('div');
    variant.className = 'bw-selected-row__variant';
    variant.textContent = variantTitle;
    body.append(variant);
  }
  if (product.priceText) {
    const price = runtimeDocument.createElement('div');
    price.className = 'bw-selected-row__price';
    price.textContent = product.priceText;
    body.append(price);
  }
  appendBadges(body, product, runtimeDocument);
  const action = runtimeDocument.createElement('div');
  action.className = 'bw-selected-row__action';
  const quantityElement = runtimeDocument.createElement('span');
  quantityElement.className = 'bw-selected-row__quantity';
  quantityElement.setAttribute('aria-label', `Quantity ${quantity}`);
  quantityElement.textContent = quantityLabel;
  action.append(quantityElement);
  if (removable) {
    const remove = runtimeDocument.createElement('button');
    remove.type = 'button';
    remove.className = 'bw-selected-row__remove';
    remove.dataset.action = 'remove-selected-product';
    remove.dataset.variantId = selectionKey;
    remove.setAttribute('aria-label', `Delete ${title}`);
    remove.append(createTrashIcon(runtimeDocument));
    action.append(remove);
  }
  root.append(media, body, action);
  return root;
}

function createEmptyRow(options: any, runtimeDocument: Document) {
  const label = options.emptyLabel || 'Empty slot';
  const root = runtimeDocument.createElement('div');
  root.className = `bw-selected-row bw-selected-row--empty ${options.className || ''}`.trim();
  root.dataset.bwSelectedRow = 'true';
  const media = runtimeDocument.createElement('div');
  media.className = 'bw-selected-row__media bw-selected-row__media--empty';
  const body = runtimeDocument.createElement('div');
  body.className = 'bw-selected-row__body';
  const title = runtimeDocument.createElement('div');
  title.className = 'bw-selected-row__title bw-selected-row__title--empty';
  title.textContent = label;
  const skeleton = runtimeDocument.createElement('div');
  skeleton.className = 'bw-selected-row__skeleton-line';
  body.append(title, skeleton);
  const action = runtimeDocument.createElement('div');
  action.className = 'bw-selected-row__action bw-selected-row__action--empty';
  root.append(media, body, action);
  return root;
}

function appendBadges(parent: HTMLElement, product: any, runtimeDocument: Document) {
  const badges: any[] = [];
  if (product.isDefault) badges.push('Included');
  if (product.isFreeGift) badges.push(product.isLocked ? 'Locked gift' : 'Free gift');
  if (badges.length === 0) return;
  const list = runtimeDocument.createElement('div');
  list.className = 'bw-selected-row__badges';
  badges.forEach((badge) => {
    const element = runtimeDocument.createElement('span');
    element.className = 'bw-selected-row__badge';
    element.textContent = badge;
    list.append(element);
  });
  parent.append(list);
}
