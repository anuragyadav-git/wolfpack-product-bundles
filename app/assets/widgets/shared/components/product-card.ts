/**
 * Shared product card renderer.
 *
 * The DOM contract reserves a stable action area so selected state swaps the
 * add button for quantity controls without changing the surrounding layout.
 */

'use strict';

import { renderQuantityControl } from './quantity-control.js';

const DEFAULT_PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3C/svg%3E';
const PRODUCT_DESCRIPTION_PREVIEW_LENGTH = 110;

export function renderSharedProductCard(product: any = {}, currentQuantity = 0, currencyInfo: any = {}, options: any = {}) {
  const selectionKey = String(product.selectionId || '');
  const quantity = Math.max(0, Number(currentQuantity || 0));
  const isSelected = quantity > 0;
  const mode = options.mode || 'grid';
  const descriptionText = resolveProductDescriptionText(
    Object.prototype.hasOwnProperty.call(options, 'description')
      ? options.description
      : product.description,
  );
  const variantText = getVariantDisplayText(product);
  const isIndividualVariantCard = Boolean(product.parentProductId && selectionKey && variantText);
  const title = getDisplayTitle(product, variantText);
  const imageUrls = getProductImageUrls(product);
  const imageUrl = imageUrls[0] || DEFAULT_PLACEHOLDER_IMAGE;
  const hasMultipleImages = imageUrls.length > 1;
  const displayPrice = Object.prototype.hasOwnProperty.call(options, 'displayPrice')
    ? options.displayPrice
    : product.price;
  const price = formatPrice(displayPrice, currencyInfo);
  const shouldRenderCompareAtPrice = product.compareAtPrice !== null
    && product.compareAtPrice !== undefined;
  const compareAtPrice = shouldRenderCompareAtPrice
    ? formatPrice(product.compareAtPrice, currencyInfo)
    : '';
  const hasPriceText = Boolean(price);
  const hasCompareAtText = Boolean(compareAtPrice);
  const shouldRenderPriceRow = hasPriceText || hasCompareAtText;
  const variantSelectorBeforePrice = options.variantSelectorPlacement === 'beforePrice';
  const addButtonText = options.addButtonText || '+';
  const resolvedAddButtonLabel = options.addButtonAriaLabel || addButtonText;
  const resolvedSelectedLabel = options.selectedStateLabel || options.addedLabel || 'Added';
  const quantityControlLabel = options.quantityAriaLabel || options.quantityLabel || 'Quantity';
  const variantLabel = options.variantAriaLabel || 'Variant';
  const removeLabel = options.removeAriaLabel || 'Remove';
  const soldOutLabel = options.soldOutAriaLabel || 'Out of stock';
  const openImageLabel = options.openImageLabel || 'Open product details';
  const openTitleLabel = options.openTitleLabel || 'Open product details';
  const imageNavPrevLabel = options.imageNavPreviousLabel || options.imageNavLabel || 'Previous image';
  const imageNavNextLabel = options.imageNavNextLabel || 'Next image';
  const seeMoreLabel = options.seeMoreText || 'See more';
  const decreaseQuantityLabel = options.decreaseQuantityAriaLabel || options.decreaseLabel || 'Decrease quantity';
  const increaseQuantityLabel = options.increaseQuantityAriaLabel || options.increaseLabel || 'Increase quantity';
  const activationLabel = openImageLabel || openTitleLabel || title;
  const cardInteractive = options.cardInteractive !== false;
  const titleInteractive = options.titleInteractive !== false;
  const rootClasses = [
    'bw-product-card',
    'product-card',
    `bw-product-card--mode-${escapeAttribute(mode)}`,
    variantText ? 'bw-product-card--has-variant product-card--has-variant' : '',
    isIndividualVariantCard ? 'bw-product-card--individual-variant product-card--individual-variant' : '',
    isSelected ? 'bw-product-card--selected' : '',
    options.displaySeeMoreLink === true && descriptionText ? 'bw-product-card--see-more' : '',
    options.expandProductCardOnHover === true ? 'bw-product-card--hover-expand' : '',
    options.className || '',
  ].filter(Boolean).join(' ');

  const rootAriaLabel = resolveProductCardSelectionAriaLabel(activationLabel, isSelected);

  return `
    <div class="${rootClasses}" data-bw-product-card="true" data-product-id="${escapeAttribute(selectionKey)}" data-current-selected-variant-id="${escapeAttribute(selectionKey)}" data-bw-card-image-count="${imageUrls.length}" data-bw-card-image-index="0"${isIndividualVariantCard ? ' data-bw-card-individual-variant="true"' : ''}${hasMultipleImages ? ' data-bw-card-has-multiple-images="true"' : ''}${cardInteractive ? ' tabindex="0"' : ''} role="group" aria-label="${escapeAttribute(rootAriaLabel)}">
      <div class="bw-product-card__media product-image" data-bw-product-media="true" role="button" tabindex="0" aria-label="${escapeAttribute(openImageLabel)}">
        <img class="bw-product-card__image" src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(title)}" loading="lazy">
        ${hasMultipleImages ? renderImageNavButton('prev', imageNavPrevLabel) : ''}
        ${hasMultipleImages ? renderImageNavButton('next', imageNavNextLabel) : ''}
        <span class="bw-product-card__image-overlay product-image-overlay" aria-hidden="true">
          <span class="bw-product-card__magnifier"></span>
        </span>
        ${options.stockBadgeHtml || ''}
      </div>
      ${options.cardBadgeHtml || ''}
      <div class="bw-product-card__body product-content-wrapper">
      <div class="bw-product-card__text product-text-container ${variantText ? 'bw-product-card__text--has-variant product-text-container--has-variant' : ''}">
          <div class="bw-product-card__title product-title"${titleInteractive ? ` role="button" tabindex="0" aria-label="${escapeAttribute(openTitleLabel)}"` : ''}>${escapeHtml(title)}</div>
          ${variantText ? `<div class="bw-product-card__variant product-variant-row" data-bw-card-variant-row="true" aria-label="${escapeAttribute(`${variantLabel}: ${variantText}`)}">${escapeHtml(variantText)}</div>` : ''}
          ${renderProductDescription({
            description: descriptionText,
            displaySeeMoreLink: options.displaySeeMoreLink === true,
            descriptionMaxLength: options.descriptionMaxLength,
            seeMoreText: seeMoreLabel,
          })}
        </div>
        <div class="product-card-price-action" role="group" aria-label="${escapeAttribute(`${quantityControlLabel} controls`)}" aria-expanded="${isSelected ? 'true' : 'false'}">
          ${variantSelectorBeforePrice ? options.variantSelectorHtml || '' : ''}
          ${shouldRenderPriceRow ? `
            <div class="bw-product-card__price product-price-row">
              ${compareAtPrice ? `<span class="bw-product-card__compare-price product-price-strike">${escapeHtml(compareAtPrice)}</span>` : ''}
              ${price ? `<span class="bw-product-card__current-price product-price">${escapeHtml(price)}</span>` : ''}
            </div>
          ` : ''}
          ${variantSelectorBeforePrice ? '' : options.variantSelectorHtml || ''}
          <div class="bw-product-card__action product-card-action ${isSelected ? 'is-expanded' : ''}">
            ${isSelected && options.selectedAction === 'button'
            ? renderAddButton(selectionKey, {
                ...options,
                addButtonText: options.selectedButtonText || options.addButtonText,
                addButtonAriaLabel: `${resolvedSelectedLabel} ${title}`,
                isPressed: true,
              })
              : isSelected
              ? renderQuantityControl({
                selectionId: selectionKey,
                quantity,
                productName: title,
                quantityAriaLabel: quantityControlLabel,
                decreaseLabel: decreaseQuantityLabel,
                increaseLabel: increaseQuantityLabel,
                removeLabel,
                soldOutAriaLabel: soldOutLabel,
                decreaseDisabled: options.decreaseDisabled === true,
                increaseDisabled: options.increaseDisabled === true,
              })
              : renderAddButton(selectionKey, {
                ...options,
                addButtonText,
                addButtonAriaLabel: `${resolvedAddButtonLabel} ${title}`,
              })}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function resolveProductCardSelectionAriaLabel(label = '', isSelected = false) {
  const baseLabel = String(label).replace(/\s+\((?:not )?selected\)$/, '');
  if (!baseLabel) return '';

  return `${baseLabel} (${isSelected ? 'selected' : 'not selected'})`;
}

export function getProductImageUrls(product: any = {}) {
  const urls: any[] = [];
  const addUrl = (value: any) => {
    const url = normalizeImageUrl(value);
    if (url && !urls.includes(url)) urls.push(url);
  };

  addUrl(product.imageUrl);
  addUrl(product.image);
  addUrl(product.featuredImage);
  (Array.isArray(product.images) ? product.images : []).forEach(addUrl);

  return urls.length > 0 ? urls : [DEFAULT_PLACEHOLDER_IMAGE];
}

function getDisplayTitle(product: any, variantText: any) {
  const parentTitle = typeof product.parentTitle === 'string' ? product.parentTitle.trim() : '';
  const rawTitle = typeof product.title === 'string' ? product.title.trim() : '';

  if (variantText && parentTitle) return parentTitle;

  const separatorIndex = rawTitle.indexOf(' - ');
  if (variantText && separatorIndex > 0) {
    return rawTitle.slice(0, separatorIndex).trim();
  }

  return parentTitle || rawTitle;
}

function getVariantDisplayText(product: any) {
  const explicitVariantTitle = typeof product.variantTitle === 'string' ? product.variantTitle.trim() : '';
  if (explicitVariantTitle && explicitVariantTitle !== 'Default Title') {
    return explicitVariantTitle;
  }

  const parentTitle = typeof product.parentTitle === 'string' ? product.parentTitle.trim() : '';
  const rawTitle = typeof product.title === 'string' ? product.title.trim() : '';
  const canInferExpandedVariant = Boolean(product.parentProductId || parentTitle);
  if (!rawTitle) return '';

  if (parentTitle) {
    const parentPrefix = `${parentTitle} - `;
    if (rawTitle.startsWith(parentPrefix)) {
      return rawTitle.slice(parentPrefix.length).trim();
    }
  }

  const separatorIndex = rawTitle.indexOf(' - ');
  if (canInferExpandedVariant && separatorIndex > 0) {
    return rawTitle.slice(separatorIndex + 3).trim();
  }

  return '';
}

function renderAddButton(selectionKey: string, options: any) {
  const disabled = options.addDisabled === true;
  const text = options.addButtonText || '+';
  const addLabel = options.addButtonAriaLabel || 'Add';
  const isPressed = options.isPressed === true ? 'true' : 'false';

  return `
    <button type="button" class="bw-product-card__add-button product-add-btn" data-product-id="${escapeAttribute(selectionKey)}" aria-label="${escapeAttribute(addLabel)}" aria-pressed="${isPressed}" ${disabled ? 'disabled aria-disabled="true"' : ''}>
      ${escapeHtml(text)}
    </button>
  `;
}

function renderImageNavButton(direction: string, label: any) {
  const safeLabel = String(label || (direction === 'prev' ? 'Previous image' : 'Next image'));
  const symbol = direction === 'prev' ? '&#10094;' : '&#10095;';
  return `
    <button type="button" class="bw-product-card__image-nav bw-product-card__image-nav--${direction}" data-bw-image-nav="${direction}" aria-label="${escapeAttribute(safeLabel)}">
      ${symbol}
    </button>
  `;
}

function renderProductDescription({
  description = '',
  displaySeeMoreLink = false,
  descriptionMaxLength = PRODUCT_DESCRIPTION_PREVIEW_LENGTH,
  seeMoreText = 'See more',
}: any) {
  const descriptionText = resolveProductDescriptionText(description);
  if (!descriptionText) return '';

  const showToggle = displaySeeMoreLink === true;
  if (!showToggle) {
    return `
      <div class="bw-product-card__description">${escapeHtml(descriptionText)}</div>
    `;
  }

  const maxLength = Math.max(24, Number(descriptionMaxLength) || PRODUCT_DESCRIPTION_PREVIEW_LENGTH);
  const isClamped = descriptionText.length > maxLength;
  const shortDescription = isClamped
    ? `${descriptionText.slice(0, maxLength)}...`
    : descriptionText;

  return `
    <div class="bw-product-card__description" data-bw-card-description="true" data-bw-card-description-expanded="false">
      <span class="bw-product-card__description-short"${isClamped ? '' : ' hidden'}>${escapeHtml(shortDescription)}</span>
      <span class="bw-product-card__description-full"${isClamped ? ' hidden' : ''}>${escapeHtml(descriptionText)}</span>
      ${isClamped ? `<button type="button" class="bw-product-card__see-more" aria-expanded="false">${escapeHtml(seeMoreText)}</button>` : ''}
    </div>
  `;
}

function normalizeImageUrl(value: any) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.url || value.src || value.originalSrc || value.transformedSrc || '';
}

function formatPrice(value: string|null, currencyInfo: any) {
  if (value == null || value === '') return '';

  const amount = Number(value || 0) / 100;
  const format = currencyInfo?.display?.format || '${{amount}}';
  return format.replace('{{amount}}', amount.toFixed(2));
}

function resolveProductDescriptionText(value: string|null) {
  if (value == null) return '';

  return String(value);
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
