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

export function resolveBundleProductModalActionText({
  originalSelectionKey = '',
  currentStep = {},
  resolveText,
  fallbackText = '',
}: any = {}) {
  const action = originalSelectionKey ? 'update' : 'add';
  const text = action === 'update'
    ? (currentStep?.addonReplaceText
      || resolveText?.('productDetailsUpdateButton', fallbackText)
      || fallbackText)
    : (currentStep?.addonAddText
      || resolveText?.('productCardAddButton', fallbackText)
      || fallbackText);

  return { action, text };
}
import { BUNDLE_WIDGET } from './widgets/shared/constants.js';
import {
  drawerLayerManager,
  shouldDismissDrawerSwipe,
} from './widgets/shared/drawer-layer-manager.js';
import { resolvePpbDetailsCommit } from './widgets/product-page/ppb-modal-card-presentation.js';

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
  isPpbOwned: boolean;
  drawerLayer: any;
  focusOrigin: any;
  originalSelectionKey: string;

  constructor(widget: any, options: any = {}) {
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
    this.isPpbOwned = options.drawerOwner === 'ppb'
      || Boolean(widget?.container?.closest?.('[data-ppb-template-type]'));
    this.drawerLayer = null;
    this.focusOrigin = null;
    this.originalSelectionKey = '';

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
    const modalHTML = `
      <div class="bundle-modal-overlay" id="bundle-product-modal"${this.isPpbOwned ? ' data-ppb-drawer-surface="product-details" role="dialog" aria-modal="true" aria-labelledby="modal-product-title"' : ''}>
        <div class="bundle-modal-container">
          <!-- Mobile Drag Handle for Swipe-to-Dismiss -->
          ${this.isPpbOwned ? '<button type="button" class="bundle-modal-drag-handle" aria-label="Close modal">' : '<div class="bundle-modal-drag-handle" aria-hidden="true">'}
            <div class="bundle-modal-drag-indicator"></div>
          ${this.isPpbOwned ? '</button>' : '</div>'}
          <button class="bundle-modal-close" aria-label="Close modal">&times;</button>

          <div class="bundle-modal-content">
            <!-- Left Column: Product Image -->
            <div class="bundle-modal-images">
              <div class="bundle-modal-main-image-container">
                <div class="bundle-modal-main-image">
                  <img src="" alt="Product image" id="modal-main-image">
                  <button type="button" class="bundle-modal-image-nav bundle-modal-image-nav--prev" data-modal-image-nav="prev" aria-label="Previous image" hidden>&#10094;</button>
                  <button type="button" class="bundle-modal-image-nav bundle-modal-image-nav--next" data-modal-image-nav="next" aria-label="Next image" hidden>&#10095;</button>
                </div>
              </div>
            </div>

            <!-- Right Column: Product Details -->
            <div class="bundle-modal-details">
              <div class="bundle-modal-header">
                <h2 class="bundle-modal-title" id="modal-product-title"></h2>
                <div class="bundle-modal-selection-summary" id="modal-selection-summary" hidden>
                  <svg class="selection-check-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Selected: <strong id="modal-selection-text"></strong></span>
                </div>
                <div class="bundle-modal-price" id="modal-product-price"></div>
              </div>

              <div class="bundle-modal-description" id="modal-product-description"></div>

              <!-- Variant Selectors (above quantity) -->
              <div class="bundle-modal-variants" id="modal-variants-container">
                <!-- Variant selectors will be inserted here -->
              </div>

              <!-- Quantity Selector (below variants) -->
              <div class="bundle-modal-quantity">
                <span class="bundle-modal-quantity-label">Quantity</span>
                <div class="bundle-modal-quantity-controls">
                  <button class="bundle-modal-qty-btn" id="modal-qty-decrease">−</button>
                  <span class="bundle-modal-qty-display" id="modal-qty-display">1</span>
                  <button class="bundle-modal-qty-btn" id="modal-qty-increase">+</button>
                </div>
              </div>

              <button class="bundle-modal-add-btn" id="modal-add-to-box">
                Add To Box
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insert modal into document body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modalElement = document.getElementById('bundle-product-modal');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    const closeBtn = this.modalElement.querySelector('.bundle-modal-close');
    closeBtn.addEventListener('click', () => this.close());
    if (this.isPpbOwned) {
      this.modalElement.querySelector('.bundle-modal-drag-handle')?.addEventListener('click', () => this.close());
    }

    // Close on overlay click
    this.modalElement.addEventListener('click', (e: any) => {
      if (e.target === this.modalElement) {
        if (!this.drawerLayer || drawerLayerManager.isTopmost(this.drawerLayer)) this.close();
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e: any) => {
      if (!this.modalElement.classList.contains('active')) return;
      if (this.drawerLayer && !drawerLayerManager.isTopmost(this.drawerLayer)) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation?.();
        this.close();
        return;
      }
      if (e.key === 'Tab' && this.isPpbOwned) {
        const focusable = Array.from(this.modalElement.querySelectorAll(
          'button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )).filter((element: any) => element.getClientRects?.().length !== 0) as HTMLElement[];
        if (focusable.length === 0) return;
        const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
        const nextIndex = e.shiftKey
          ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
          : (currentIndex < 0 || currentIndex === focusable.length - 1 ? 0 : currentIndex + 1);
        e.preventDefault();
        focusable[nextIndex]?.focus?.();
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
    this.originalSelectionKey = String(options.originalSelectionKey || '');
    this.selectedQuantity = Math.max(1, Number(options.selectedQuantity || 1));
    this.readOnly = options.readOnly === true;
    this.focusOrigin = document.activeElement;
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
    if (this.isPpbOwned) {
      this.drawerLayer = drawerLayerManager.open({
        id: 'product-details',
        requestClose: () => this.close(),
        trigger: this.focusOrigin,
      });
      const isMobileDrawer = window.matchMedia?.('(max-width: 767px)').matches
        || window.innerWidth <= 767;
      const initialControl = this.modalElement.querySelector(
        isMobileDrawer ? '.bundle-modal-drag-handle' : '.bundle-modal-close',
      );
      initialControl?.focus?.({ preventScroll: true });
    } else {
      this.lockDocumentScroll();
    }
  }

  /**
   * Close modal
   */
  close() {
    this.modalElement.classList.remove('active');
    if (this.drawerLayer) {
      drawerLayerManager.close(this.drawerLayer, { restoreFocus: true });
      this.drawerLayer = null;
    } else {
      this.unlockDocumentScroll();
    }
    this.focusOrigin = null;

    // Reset state
    this.currentProduct = null;
    this.currentStep = null;
    this.selectedVariant = null;
    this.selectedQuantity = 1;
    this.currentImageIndex = 0;
    this.readOnly = false;
    this.originalSelectionKey = '';
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
    descriptionEl.textContent = '';
    descriptionEl.innerHTML = '';
    if (descriptionHtml) {
      descriptionEl.innerHTML = descriptionHtml;
    } else {
      descriptionEl.textContent = this.currentProduct.description || '';
    }

    // Load image
    this.loadImage();

    // Create variant selectors
    this.createVariantSelectors();

    // Set initial price
    this.updatePrice();

    const actionButton = document.getElementById('modal-add-to-box');
    if (this.isPpbOwned && actionButton) {
      const presentation = resolveBundleProductModalActionText({
        originalSelectionKey: this.originalSelectionKey,
        currentStep: this.currentStep,
        resolveText: this.widget?._resolveText?.bind(this.widget),
        fallbackText: actionButton.textContent,
      });
      actionButton.textContent = presentation.text;
      actionButton.dataset.action = presentation.action;
    }

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
    const commit = resolvePpbDetailsCommit({
      stepIndex,
      originalSelectionKey: this.isPpbOwned ? this.originalSelectionKey : '',
      nextSelectionKey: productId,
      quantity: this.selectedQuantity,
    });


    // Call widget's method to add product
    if (this.widget.updateProductSelection) {
      if (this.isPpbOwned && commit.removeSelectionKey) {
        this.widget._modalSlotReplacementTarget = {
          stepIndex: commit.stepIndex,
          selectionKey: commit.removeSelectionKey,
        };
      }
      this.widget.updateProductSelection(
        commit.stepIndex,
        commit.nextSelectionKey,
        commit.quantity
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
