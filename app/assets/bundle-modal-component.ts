/**
 * Bundle Product Modal Component
 *
 * Handles the product variant selection modal for full-page bundles.
 * Opens when user clicks "Choose Options" on a product card.
 *
 * Features:
 * - Product image, title, and description
 * - Variant selection dropdowns
 * - Quantity controls
 * - Add To Box functionality
 * - Responsive mobile layout
 *
 * @version 1.0.0
 */

'use strict';

import { BundleModalVariantMethods } from './widgets/full-page/modal/variant-methods.js';
import { sanitizeRichHtmlFragment } from './widgets/shared/rich-html.js';
import { createChevronIcon, createCloseIcon } from './widgets/shared/svg-icons.js';
import { BUNDLE_WIDGET } from './widgets/shared/constants.js';
import { shouldDismissDrawerSwipe } from './widgets/shared/drawer-layer-manager.js';

export interface BundleProductModal {
  [key: string]: any;
}

export function shouldDismissProductDrawerSwipe({
  distanceY = 0,
  distanceX = 0,
  velocityY = 0,
}: any = {}) {
  return shouldDismissDrawerSwipe({ distanceY, distanceX, velocityY });
}

export function getProductCarouselSwipeDirection({
  distanceX = 0,
  distanceY = 0,
}: any = {}) {
  const horizontalDistance = Number(distanceX);
  const verticalDistance = Math.abs(Number(distanceY));
  if (!Number.isFinite(horizontalDistance) || !Number.isFinite(verticalDistance)) return 0;
  if (Math.abs(horizontalDistance) < 48 || verticalDistance >= Math.abs(horizontalDistance)) return 0;
  return horizontalDistance < 0 ? 1 : -1;
}

export class BundleProductModal {
  widget: any;
  modalElement: any;
  currentProduct: any;
  currentStep: any;
  selectedVariant: any;
  selectedOptions: Record<string, any>;
  selectedQuantity: number;
  currentImageIndex: number;
  readOnly: boolean;
  lockedScrollY: number;
  isDocumentScrollLocked: boolean;

  constructor(widget: any) {
    this.widget = widget;
    this.modalElement = null;
    this.currentProduct = null;
    this.currentStep = null;
    this.selectedVariant = null;
    this.selectedOptions = {};
    this.selectedQuantity = 1;
    this.currentImageIndex = 0;
    this.readOnly = false;
    this.lockedScrollY = 0;
    this.isDocumentScrollLocked = false;

    this.init();
  }

  lockDocumentScroll() {
    if (this.isDocumentScrollLocked) return;

    this.lockedScrollY = Math.max(0, Number(window.scrollY) || 0);
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    document.body.style.setProperty(
      '--bundle-modal-scroll-offset',
      `-${this.lockedScrollY}px`,
    );
    this.isDocumentScrollLocked = true;
  }

  unlockDocumentScroll() {
    if (!this.isDocumentScrollLocked) return;

    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('--bundle-modal-scroll-offset');
    document.documentElement.scrollTop = this.lockedScrollY;
    document.body.scrollTop = this.lockedScrollY;
    this.lockedScrollY = 0;
    this.isDocumentScrollLocked = false;
  }

  /**
   * Initialize modal
   */
  init() {
    this.createModalHTML();
    this.attachEventListeners();
  }

  /**
   * Create modal DOM structure
   */
  createModalHTML() {
    const modal = document.createElement('div');
    modal.className = 'bundle-modal-overlay';
    modal.id = 'bundle-product-modal';
    const container = document.createElement('div');
    container.className = 'bundle-modal-container';
    const dragHandle = document.createElement('div');
    dragHandle.className = 'bundle-modal-drag-handle';
    dragHandle.setAttribute('aria-hidden', 'true');
    const dragIndicator = document.createElement('div');
    dragIndicator.className = 'bundle-modal-drag-indicator';
    dragHandle.appendChild(dragIndicator);
    const close = document.createElement('button');
    close.className = 'bundle-modal-close';
    close.setAttribute('aria-label', 'Close modal');
    close.appendChild(createCloseIcon(document));

    const content = document.createElement('div');
    content.className = 'bundle-modal-content';
    const images = document.createElement('div');
    images.className = 'bundle-modal-images';
    const imageContainer = document.createElement('div');
    imageContainer.className = 'bundle-modal-main-image-container';
    const mainImageWrap = document.createElement('div');
    mainImageWrap.className = 'bundle-modal-main-image';
    const mainImage = document.createElement('img');
    mainImage.id = 'modal-main-image';
    mainImage.alt = 'Product image';
    const previousImage = document.createElement('button');
    previousImage.type = 'button';
    previousImage.className = 'bundle-modal-image-nav bundle-modal-image-nav--prev';
    previousImage.dataset.modalImageNav = 'prev';
    previousImage.setAttribute('aria-label', 'Previous image');
    previousImage.hidden = true;
    previousImage.appendChild(createChevronIcon(document, 'left'));
    const nextImage = document.createElement('button');
    nextImage.type = 'button';
    nextImage.className = 'bundle-modal-image-nav bundle-modal-image-nav--next';
    nextImage.dataset.modalImageNav = 'next';
    nextImage.setAttribute('aria-label', 'Next image');
    nextImage.hidden = true;
    nextImage.appendChild(createChevronIcon(document, 'right'));
    mainImageWrap.append(mainImage, previousImage, nextImage);
    imageContainer.appendChild(mainImageWrap);
    images.appendChild(imageContainer);

    const details = document.createElement('div');
    details.className = 'bundle-modal-details';
    const header = document.createElement('div');
    header.className = 'bundle-modal-header';
    const title = document.createElement('h2');
    title.className = 'bundle-modal-title';
    title.id = 'modal-product-title';
    const selection = document.createElement('div');
    selection.className = 'bundle-modal-selection-summary';
    selection.id = 'modal-selection-summary';
    selection.hidden = true;
    const selectionTextWrap = document.createElement('span');
    selectionTextWrap.append(document.createTextNode('Selected: '));
    const selectionText = document.createElement('strong');
    selectionText.id = 'modal-selection-text';
    selectionTextWrap.appendChild(selectionText);
    selection.appendChild(selectionTextWrap);
    const price = document.createElement('div');
    price.className = 'bundle-modal-price';
    price.id = 'modal-product-price';
    header.append(title, selection, price);
    const description = document.createElement('div');
    description.className = 'bundle-modal-description';
    description.id = 'modal-product-description';
    const variants = document.createElement('div');
    variants.className = 'bundle-modal-variants';
    variants.id = 'modal-variants-container';
    const quantity = document.createElement('div');
    quantity.className = 'bundle-modal-quantity';
    const quantityLabel = document.createElement('span');
    quantityLabel.className = 'bundle-modal-quantity-label';
    quantityLabel.textContent = 'Quantity';
    const quantityControls = document.createElement('div');
    quantityControls.className = 'bundle-modal-quantity-controls';
    const decrease = document.createElement('button');
    decrease.className = 'bundle-modal-qty-btn';
    decrease.id = 'modal-qty-decrease';
    decrease.textContent = '−';
    const quantityDisplay = document.createElement('span');
    quantityDisplay.className = 'bundle-modal-qty-display';
    quantityDisplay.id = 'modal-qty-display';
    quantityDisplay.textContent = '1';
    const increase = document.createElement('button');
    increase.className = 'bundle-modal-qty-btn';
    increase.id = 'modal-qty-increase';
    increase.textContent = '+';
    quantityControls.append(decrease, quantityDisplay, increase);
    quantity.append(quantityLabel, quantityControls);
    const add = document.createElement('button');
    add.className = 'bundle-modal-add-btn';
    add.id = 'modal-add-to-box';
    add.textContent = 'Add To Box';
    details.append(header, description, variants, quantity, add);
    content.append(images, details);
    container.append(dragHandle, close, content);
    modal.appendChild(container);
    document.body.appendChild(modal);
    this.modalElement = modal;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    const closeBtn = this.modalElement.querySelector('.bundle-modal-close');
    closeBtn.addEventListener('click', () => this.close());

    // Close on overlay click
    this.modalElement.addEventListener('click', (e: any) => {
      if (e.target === this.modalElement) {
        this.close();
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e: any) => {
      if (!this.modalElement.classList.contains('active')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation?.();
        this.close();
      }
    });

    // Quantity controls
    document.getElementById('modal-qty-decrease')!.addEventListener('click', () => {
      this.updateQuantity(Math.max(1, this.selectedQuantity - 1));
    });

    document.getElementById('modal-qty-increase')!.addEventListener('click', () => {
      this.updateQuantity(this.selectedQuantity + 1);
    });

    // Add To Box button
    document.getElementById('modal-add-to-box')!.addEventListener('click', () => {
      this.addToBundle();
    });

    this.modalElement.querySelectorAll('[data-modal-image-nav]').forEach((button: any) => {
      button.addEventListener('click', (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        this.showAdjacentImage(button.dataset.modalImageNav === 'prev' ? -1 : 1);
      });
    });
    this.setupImageCarouselGestures();

    // Swipe gesture detection for mobile
    this.setupSwipeGestures();
  }

  setupImageCarouselGestures() {
    const imageFrame = this.modalElement.querySelector('.bundle-modal-main-image');
    if (!imageFrame) return;

    let gesture: any = null;
    imageFrame.addEventListener('pointerdown', (event: any) => {
      gesture = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
      };
      imageFrame.setPointerCapture?.(event.pointerId);
    });
    imageFrame.addEventListener('pointerup', (event: any) => {
      if (!gesture || event.pointerId !== gesture.pointerId) return;
      const direction = getProductCarouselSwipeDirection({
        distanceX: event.clientX - gesture.startX,
        distanceY: event.clientY - gesture.startY,
      });
      gesture = null;
      if (direction !== 0) this.showAdjacentImage(direction);
    });
    imageFrame.addEventListener('pointercancel', () => {
      gesture = null;
    });
  }

  /**
   * Setup swipe gestures for mobile
   * - Swipe down on container to dismiss
   */
  setupSwipeGestures() {
    const modalContainer = this.modalElement.querySelector('.bundle-modal-container');
    const dragHandle = this.modalElement.querySelector('.bundle-modal-drag-handle');
    if (!dragHandle || !modalContainer) return;

    let gesture: any = null;
    const resetDrawerPosition = () => {
      modalContainer.style.transform = '';
      modalContainer.style.opacity = '';
    };

    dragHandle.addEventListener('pointerdown', (event: any) => {
      gesture = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startedAt: performance.now(),
      };
      modalContainer.style.transition = 'none';
      dragHandle.setPointerCapture?.(event.pointerId);
    });

    dragHandle.addEventListener('pointermove', (event: any) => {
      if (!gesture || event.pointerId !== gesture.pointerId) return;
      const distanceX = event.clientX - gesture.startX;
      const distanceY = Math.max(0, event.clientY - gesture.startY);
      if (Math.abs(distanceX) > distanceY) return;
      modalContainer.style.transform = `translateY(${distanceY}px)`;
      modalContainer.style.opacity = String(Math.max(0.5, 1 - distanceY / 300));
    });

    const finishGesture = (event: any) => {
      if (!gesture || event.pointerId !== gesture.pointerId) return;
      const elapsed = Math.max(1, performance.now() - gesture.startedAt);
      const distanceY = event.clientY - gesture.startY;
      const distanceX = event.clientX - gesture.startX;
      gesture = null;
      modalContainer.style.transition = 'transform 0.24s ease, opacity 0.24s ease';

      if (shouldDismissProductDrawerSwipe({
        distanceY,
        distanceX,
        velocityY: distanceY / elapsed,
      })) {
        modalContainer.style.transform = 'translateY(100%)';
        modalContainer.style.opacity = '0';
        setTimeout(() => {
          this.close();
          resetDrawerPosition();
        }, 240);
        return;
      }

      resetDrawerPosition();
    };

    dragHandle.addEventListener('pointerup', finishGesture);
    dragHandle.addEventListener('pointercancel', () => {
      gesture = null;
      modalContainer.style.transition = 'transform 0.24s ease, opacity 0.24s ease';
      resetDrawerPosition();
    });
  }

  /**
   * Open modal with product data
   * @param {Object} product - Product data
   * @param {Object} step - Step data
   */
  open(product: any, step: any, options: any = {}) {

    this.currentProduct = product;
    this.currentStep = step;
    this.selectedVariant = null;
    this.selectedOptions = {};
    this.selectedQuantity = Math.max(1, Number(options.selectedQuantity || 1));
    this.readOnly = options.readOnly === true;
    const imageCount = this.getProductImages().length;
    const initialImageIndex = Number(options.initialImageIndex || 0);
    this.currentImageIndex = imageCount > 0
      ? Math.min(Math.max(0, initialImageIndex), imageCount - 1)
      : 0;

    // Populate modal content
    this.populateModal();
    this.updateReadOnlyState();

    // Show modal
    this.modalElement.classList.add('active');
    this.lockDocumentScroll();
  }

  /**
   * Close modal
   */
  close() {
    this.modalElement.classList.remove('active');
    this.unlockDocumentScroll();

    // Reset state
    this.currentProduct = null;
    this.currentStep = null;
    this.selectedVariant = null;
    this.selectedQuantity = 1;
    this.currentImageIndex = 0;
    this.readOnly = false;
    this.updateReadOnlyState();
  }

  /**
   * Populate modal with product data
   */
  populateModal() {
    // Set title - use parent title if this is a flattened variant
    const displayTitle = this.currentProduct.parentTitle || this.currentProduct.title;
    document.getElementById('modal-product-title')!.textContent = displayTitle;

    // Keep the description row mounted so the modal layout remains stable.
    const descriptionEl = document.getElementById('modal-product-description')!;
    const descriptionHtml = typeof this.currentProduct.descriptionHtml === 'string'
      ? this.currentProduct.descriptionHtml.trim()
      : '';
    if (descriptionHtml) {
      descriptionEl.replaceChildren(sanitizeRichHtmlFragment(descriptionHtml, 'product-description'));
    } else {
      descriptionEl.textContent = this.currentProduct.description || '';
    }

    // Load image
    this.loadImage();

    // Create variant selectors
    this.createVariantSelectors();

    // Set initial price
    this.updatePrice();

    // Reset quantity display
    document.getElementById('modal-qty-display')!.textContent = String(this.selectedQuantity);
  }

  updateReadOnlyState() {
    if (!this.modalElement) return;

    this.modalElement.dataset.readOnly = this.readOnly ? 'true' : 'false';
    [
      '#modal-product-price',
      '#modal-variants-container',
      '.bundle-modal-quantity',
      '#modal-add-to-box',
    ].forEach((selector) => {
      const element = this.modalElement.querySelector(selector);
      if (element) {
        element.hidden = this.readOnly;
      }
    });
  }

  /**
   * Get normalized product image.
   * Handles imageUrl, image.src, images array, and featuredImage.url.
   * @returns {string} Image URL
   */
  getProductImages() {
    const product = this.currentProduct;
    if (!product) return [BUNDLE_WIDGET.PLACEHOLDER_IMAGE];

    const urls: any[] = [];
    const addUrl = (value: any) => {
      const url = this.normalizeImageUrl(value);
      if (url && !urls.includes(url)) urls.push(url);
    };

    addUrl(product.imageUrl);
    addUrl(product.image);
    addUrl(product.featuredImage);
    (Array.isArray(product.images) ? product.images : []).forEach(addUrl);

    return urls.length > 0 ? urls : [BUNDLE_WIDGET.PLACEHOLDER_IMAGE];
  }

  normalizeImageUrl(value: any) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.url || value.src || value.originalSrc || value.transformedSrc || '';
  }

  getProductImage() {
    const images = this.getProductImages();
    return images[this.currentImageIndex] || images[0] || BUNDLE_WIDGET.PLACEHOLDER_IMAGE;
  }

  loadImage() {
    const mainImageEl = document.getElementById('modal-main-image') as HTMLImageElement | null;
    if (!mainImageEl) return;

    const images = this.getProductImages();
    this.currentImageIndex = Math.min(Math.max(0, this.currentImageIndex), images.length - 1);
    mainImageEl.src = this.getProductImage();
    mainImageEl.alt = this.currentProduct?.title || 'Product image';

    const hasGallery = images.length > 1;
    const imageFrame = this.modalElement.querySelector('.bundle-modal-main-image');
    if (imageFrame) {
      imageFrame.classList.toggle('bundle-modal-main-image--has-gallery', hasGallery);
    }
    this.modalElement.querySelectorAll('[data-modal-image-nav]').forEach((button: any) => {
      button.hidden = !hasGallery;
    });
  }

  showAdjacentImage(direction: number) {
    const images = this.getProductImages();
    if (images.length <= 1) return;

    this.currentImageIndex = (this.currentImageIndex + direction + images.length) % images.length;
    this.loadImage();
  }

  updateQuantity(quantity: number) {
    this.selectedQuantity = Math.max(1, quantity);
    document.getElementById('modal-qty-display')!.textContent = String(this.selectedQuantity);
  }

  /**
   * Add product to bundle
   */
  addToBundle() {
    if (this.readOnly) {
      return;
    }

    if (!this.currentProduct || !this.currentStep) {
      return;
    }

    const variant = this.selectedVariant || this.currentProduct;

    // Check availability before adding
    const isAvailable = variant.available !== false &&
                        variant.availableForSale !== false;

    if (!isAvailable) {
      return;
    }

    // Use selectedBundle.steps (not widget.steps which doesn't exist)
    const steps = this.widget.selectedBundle?.steps || [];
    const stepIndex = steps.findIndex((s: any)  => s.id === this.currentStep.id);

    if (stepIndex === -1) {
      return;
    }

    const productId = variant.variantId || variant.id || this.currentProduct.id;
    // Call widget's method to add product
    if (this.widget.updateProductSelection) {
      this.widget.updateProductSelection(
        stepIndex,
        productId,
        this.selectedQuantity
      );
    } else {
      return;
    }

    // Close modal
    this.close();

    // Show success feedback
    this.showSuccessFeedback();
  }

  /**
   * Show success feedback after adding product
   */
  showSuccessFeedback() {
    // Use widget's toast manager if available
    if (this.widget && this.widget.showToast) {
      this.widget.showToast('Product added to bundle!', 'success');
    } else {
    }
  }
}

Object.assign(
  BundleProductModal.prototype,
  BundleModalVariantMethods,
);
