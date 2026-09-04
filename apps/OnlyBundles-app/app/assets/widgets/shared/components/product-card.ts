/**
 * Shared product card renderer.
 *
 * The DOM contract reserves a stable action area so selected state swaps the
 * add button for quantity controls without changing the surrounding layout.
 */

'use strict';

import { createQuantityControlElement } from './quantity-control.js';
import { createMagnifierIcon } from '../svg-icons.js';


const DEFAULT_PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3C/svg%3E';
const PRODUCT_DESCRIPTION_PREVIEW_LENGTH = 110;

export function createSharedProductCardElement(product: any = {}, currentQuantity = 0, currencyInfo: any = {}, options: any = {}) {
  const runtimeDocument: Document = options.document || document;
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
  const productDetailsEnabled = options.productDetailsEnabled === true;
  const activationLabel = productDetailsEnabled ? (openImageLabel || openTitleLabel || title) : title;
  const cardInteractive = productDetailsEnabled && options.cardInteractive !== false;
  const titleInteractive = productDetailsEnabled && options.titleInteractive !== false;
  const rootClasses = [
    'bw-product-card',
    'product-card',
    `bw-product-card--mode-${mode}`,
    variantText ? 'bw-product-card--has-variant product-card--has-variant' : '',
    isIndividualVariantCard ? 'bw-product-card--individual-variant product-card--individual-variant' : '',
    isSelected ? 'bw-product-card--selected' : '',
    options.displaySeeMoreLink === true && descriptionText ? 'bw-product-card--see-more' : '',
    options.expandProductCardOnHover === true ? 'bw-product-card--hover-expand' : '',
    options.className || '',
  ].filter(Boolean).join(' ');

  const rootAriaLabel = resolveProductCardSelectionAriaLabel(activationLabel, isSelected);

  const root = runtimeDocument.createElement('div');
  root.className = rootClasses;
  Object.assign(root.dataset, {
    bwProductCard: 'true',
    productId: selectionKey,
    currentSelectedVariantId: selectionKey,
    bwCardImageCount: String(imageUrls.length),
    bwCardImageIndex: '0',
  });
  if (isIndividualVariantCard) root.dataset.bwCardIndividualVariant = 'true';
  if (hasMultipleImages) root.dataset.bwCardHasMultipleImages = 'true';
  if (cardInteractive) root.tabIndex = 0;
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', rootAriaLabel);

  const media = runtimeDocument.createElement('div');
  media.className = 'bw-product-card__media product-image';
  media.dataset.bwProductMedia = 'true';
  if (productDetailsEnabled) {
    media.setAttribute('role', 'button');
    media.tabIndex = 0;
    media.setAttribute('aria-label', openImageLabel);
  }
  const image = runtimeDocument.createElement('img');
  image.className = 'bw-product-card__image';
  image.src = normalizeSafeImageUrl(imageUrl, runtimeDocument) || DEFAULT_PLACEHOLDER_IMAGE;
  image.alt = title;
  image.loading = 'lazy';
  const fallbackUrl = normalizeSafeImageUrl(options.imageFallbackUrl, runtimeDocument);
  if (fallbackUrl) image.addEventListener('error', () => {
    if (image.src !== fallbackUrl) image.src = fallbackUrl;
  }, { once: true });
  media.append(image);
  if (productDetailsEnabled && hasMultipleImages) {
    media.append(
      createImageNavButton('prev', imageNavPrevLabel, runtimeDocument),
      createImageNavButton('next', imageNavNextLabel, runtimeDocument),
    );
  }
  if (productDetailsEnabled) {
    const overlay = runtimeDocument.createElement('span');
    overlay.className = 'bw-product-card__image-overlay product-image-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    const magnifier = runtimeDocument.createElement('span');
    magnifier.className = 'bw-product-card__magnifier';
    magnifier.append(createMagnifierIcon(runtimeDocument, 16));
    overlay.append(magnifier);
    media.append(overlay);
  }
  if (options.stockBadgeElement?.nodeType) media.append(options.stockBadgeElement);
  root.append(media);
  if (options.cardBadgeElement?.nodeType) root.append(options.cardBadgeElement);

  const body = runtimeDocument.createElement('div');
  body.className = 'bw-product-card__body product-content-wrapper';
  const text = runtimeDocument.createElement('div');
  text.className = [
    'bw-product-card__text product-text-container',
    variantText ? 'bw-product-card__text--has-variant product-text-container--has-variant' : '',
  ].filter(Boolean).join(' ');
  const titleElement = runtimeDocument.createElement('div');
  titleElement.className = 'bw-product-card__title product-title';
  titleElement.textContent = title;
  if (titleInteractive) {
    titleElement.setAttribute('role', 'button');
    titleElement.tabIndex = 0;
    titleElement.setAttribute('aria-label', openTitleLabel);
  }
  text.append(titleElement);
  if (variantText) {
    const variant = runtimeDocument.createElement('div');
    variant.className = 'bw-product-card__variant product-variant-row';
    variant.dataset.bwCardVariantRow = 'true';
    variant.setAttribute('aria-label', `${variantLabel}: ${variantText}`);
    variant.textContent = variantText;
    text.append(variant);
  }
  const description = createProductDescription({
    description: descriptionText,
    displaySeeMoreLink: options.displaySeeMoreLink === true,
    descriptionMaxLength: options.descriptionMaxLength,
    seeMoreText: seeMoreLabel,
  }, runtimeDocument);
  if (description) text.append(description);
  body.append(text);

  const priceAction = runtimeDocument.createElement('div');
  priceAction.className = 'product-card-price-action';
  priceAction.setAttribute('role', 'group');
  priceAction.setAttribute('aria-label', `${quantityControlLabel} controls`);
  priceAction.setAttribute('aria-expanded', isSelected ? 'true' : 'false');
  if (variantSelectorBeforePrice && options.variantSelectorElement?.nodeType) {
    priceAction.append(options.variantSelectorElement);
  }
  if (shouldRenderPriceRow) {
    const priceRow = runtimeDocument.createElement('div');
    priceRow.className = 'bw-product-card__price product-price-row';
    if (compareAtPrice) {
      const compare = runtimeDocument.createElement('span');
      compare.className = 'bw-product-card__compare-price product-price-strike';
      compare.textContent = compareAtPrice;
      priceRow.append(compare);
    }
    if (price) {
      const current = runtimeDocument.createElement('span');
      current.className = 'bw-product-card__current-price product-price';
      current.textContent = price;
      priceRow.append(current);
    }
    priceAction.append(priceRow);
  }
  if (!variantSelectorBeforePrice && options.variantSelectorElement?.nodeType) {
    priceAction.append(options.variantSelectorElement);
  }
  const action = runtimeDocument.createElement('div');
  action.className = `bw-product-card__action product-card-action${isSelected ? ' is-expanded' : ''}`;
  action.append(isSelected && options.selectedAction === 'button'
    ? createAddButton(selectionKey, {
      ...options,
      addButtonText: options.selectedButtonText || options.addButtonText,
      addButtonAriaLabel: `${resolvedSelectedLabel} ${title}`,
      isPressed: true,
    }, runtimeDocument)
    : isSelected
      ? createQuantityControlElement({
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
        document: runtimeDocument,
      })
      : createAddButton(selectionKey, {
        ...options,
        addButtonText,
        addButtonAriaLabel: `${resolvedAddButtonLabel} ${title}`,
      }, runtimeDocument));
  priceAction.append(action);
  body.append(priceAction);
  root.append(body);
  return root;
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

function createAddButton(selectionKey: string, options: any, runtimeDocument: Document) {
  const disabled = options.addDisabled === true;
  const text = options.addButtonText || '+';
  const addLabel = options.addButtonAriaLabel || 'Add';
  const button = runtimeDocument.createElement('button');
  button.type = 'button';
  button.className = 'bw-product-card__add-button product-add-btn';
  button.dataset.productId = selectionKey;
  button.setAttribute('aria-label', addLabel);
  button.setAttribute('aria-pressed', options.isPressed === true ? 'true' : 'false');
  button.disabled = disabled;
  if (disabled) button.setAttribute('aria-disabled', 'true');
  button.textContent = text;
  return button;
}

function createImageNavButton(direction: string, label: any, runtimeDocument: Document) {
  const safeLabel = String(label || (direction === 'prev' ? 'Previous image' : 'Next image'));
  const button = runtimeDocument.createElement('button');
  button.type = 'button';
  button.className = `bw-product-card__image-nav bw-product-card__image-nav--${direction}`;
  button.dataset.bwImageNav = direction;
  button.setAttribute('aria-label', safeLabel);
  button.textContent = direction === 'prev' ? '❮' : '❯';
  return button;
}

function createProductDescription({
  description = '',
  displaySeeMoreLink = false,
  descriptionMaxLength = PRODUCT_DESCRIPTION_PREVIEW_LENGTH,
  seeMoreText = 'See more',
}: any, runtimeDocument: Document) {
  const descriptionText = resolveProductDescriptionText(description);
  if (!descriptionText) return null;

  const showToggle = displaySeeMoreLink === true;
  if (!showToggle) {
    const descriptionElement = runtimeDocument.createElement('div');
    descriptionElement.className = 'bw-product-card__description';
    descriptionElement.textContent = descriptionText;
    return descriptionElement;
  }

  const maxLength = Math.max(24, Number(descriptionMaxLength) || PRODUCT_DESCRIPTION_PREVIEW_LENGTH);
  const isClamped = descriptionText.length > maxLength;
  const shortDescription = isClamped
    ? `${descriptionText.slice(0, maxLength)}...`
    : descriptionText;

  const root = runtimeDocument.createElement('div');
  root.className = 'bw-product-card__description';
  root.dataset.bwCardDescription = 'true';
  root.dataset.bwCardDescriptionExpanded = 'false';
  const short = runtimeDocument.createElement('span');
  short.className = 'bw-product-card__description-short';
  short.hidden = !isClamped;
  short.textContent = shortDescription;
  const full = runtimeDocument.createElement('span');
  full.className = 'bw-product-card__description-full';
  full.hidden = isClamped;
  full.textContent = descriptionText;
  root.append(short, full);
  if (isClamped) {
    const toggle = runtimeDocument.createElement('button');
    toggle.type = 'button';
    toggle.className = 'bw-product-card__see-more';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = seeMoreText;
    root.append(toggle);
  }
  return root;
}

function normalizeImageUrl(value: any) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.url || value.src || value.originalSrc || value.transformedSrc || '';
}

function normalizeSafeImageUrl(value: any, runtimeDocument: Document) {
  const source = normalizeImageUrl(value).trim();
  if (!source) return '';
  if (/^data:image\/(?:avif|gif|jpeg|png|svg\+xml|webp);/i.test(source)) return source;
  try {
    const parsed = new URL(source, runtimeDocument.location?.href || 'https://storefront.invalid');
    return ['http:', 'https:', 'blob:'].includes(parsed.protocol) ? parsed.href : '';
  } catch {
    return '';
  }
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
