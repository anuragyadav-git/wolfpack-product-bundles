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
import { BUNDLE_WIDGET } from './widgets/shared/constants.js';

export interface BundleProductModal {
  [key: string]: any;
}

export function shouldDismissProductDrawerSwipe({
  distanceY = 0,
  distanceX = 0,
  velocityY = 0,
} = {}) {
  const verticalDistance = Number(distanceY);
  const horizontalDistance = Math.abs(Number(distanceX));
  const downwardVelocity = Number(velocityY);
  if (!Number.isFinite(verticalDistance) || verticalDistance <= 0) return false;
  if (horizontalDistance > verticalDistance) return false;
  return verticalDistance >= 96 || downwardVelocity >= 0.6;
}

export class BundleProductModal {
  constructor(widget) {
    this.widget = widget;
    this.modalElement = null;
    this.currentProduct = null;
    this.currentStep = null;
    this.selectedVariant = null;
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
    const modalHTML = `
      <div class="bundle-modal-overlay" id="bundle-product-modal">
        <div class="bundle-modal-container">
          <!-- Mobile Drag Handle for Swipe-to-Dismiss -->
          <div class="bundle-modal-drag-handle">
            <div class="bundle-modal-drag-indicator"></div>
          </div>
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
                <label class="bundle-modal-quantity-label">Quantity</label>
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

    // Close on overlay click
    this.modalElement.addEventListener('click', (e) => {
      if (e.target === this.modalElement) {
        this.close();
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalElement.classList.contains('active')) {
        this.close();
      }
    });

    // Quantity controls
    document.getElementById('modal-qty-decrease').addEventListener('click', () => {
      this.updateQuantity(Math.max(1, this.selectedQuantity - 1));
    });

    document.getElementById('modal-qty-increase').addEventListener('click', () => {
      this.updateQuantity(this.selectedQuantity + 1);
    });

    // Add To Box button
    document.getElementById('modal-add-to-box').addEventListener('click', () => {
      this.addToBundle();
    });

    this.modalElement.querySelectorAll('[data-modal-image-nav]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.showAdjacentImage(button.dataset.modalImageNav === 'prev' ? -1 : 1);
      });
    });

    // Swipe gesture detection for mobile
    this.setupSwipeGestures();
  }

  /**
   * Setup swipe gestures for mobile
   * - Swipe down on container to dismiss
   */
  setupSwipeGestures() {
    const modalContainer = this.modalElement.querySelector('.bundle-modal-container');
    const dragHandle = this.modalElement.querySelector('.bundle-modal-drag-handle');
    if (!dragHandle || !modalContainer) return;

    let gesture = null;
    const resetDrawerPosition = () => {
      modalContainer.style.transform = '';
      modalContainer.style.opacity = '';
    };

    dragHandle.addEventListener('pointerdown', (event) => {
      gesture = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startedAt: performance.now(),
      };
      modalContainer.style.transition = 'none';
      dragHandle.setPointerCapture?.(event.pointerId);
    });

    dragHandle.addEventListener('pointermove', (event) => {
      if (!gesture || event.pointerId !== gesture.pointerId) return;
      const distanceX = event.clientX - gesture.startX;
      const distanceY = Math.max(0, event.clientY - gesture.startY);
      if (Math.abs(distanceX) > distanceY) return;
      modalContainer.style.transform = `translateY(${distanceY}px)`;
      modalContainer.style.opacity = String(Math.max(0.5, 1 - distanceY / 300));
    });

    const finishGesture = (event) => {
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
  open(product, step, options = {}) {

    this.currentProduct = product;
    this.currentStep = step;
    this.selectedVariant = null;
    this.selectedOptions = {};
    this.selectedQuantity = 1;
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
    document.getElementById('modal-product-title').textContent = displayTitle;

    // Keep the description row mounted so the modal layout remains stable.
    const descriptionEl = document.getElementById('modal-product-description');
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

    // Reset quantity display
    document.getElementById('modal-qty-display').textContent = this.selectedQuantity;
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

    const urls = [];
    const addUrl = (value) => {
      const url = this.normalizeImageUrl(value);
      if (url && !urls.includes(url)) urls.push(url);
    };

    addUrl(product.imageUrl);
    addUrl(product.image);
    addUrl(product.featuredImage);
    (Array.isArray(product.images) ? product.images : []).forEach(addUrl);

    return urls.length > 0 ? urls : [BUNDLE_WIDGET.PLACEHOLDER_IMAGE];
  }

  normalizeImageUrl(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.url || value.src || value.originalSrc || value.transformedSrc || '';
  }

  getProductImage() {
    const images = this.getProductImages();
    return images[this.currentImageIndex] || images[0] || BUNDLE_WIDGET.PLACEHOLDER_IMAGE;
  }

  loadImage() {
    const mainImageEl = document.getElementById('modal-main-image');
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
    this.modalElement.querySelectorAll('[data-modal-image-nav]').forEach((button) => {
      button.hidden = !hasGallery;
    });
  }

  showAdjacentImage(direction) {
    const images = this.getProductImages();
    if (images.length <= 1) return;

    this.currentImageIndex = (this.currentImageIndex + direction + images.length) % images.length;
    this.loadImage();
  }

  updateQuantity(quantity) {
    this.selectedQuantity = Math.max(1, quantity);
    document.getElementById('modal-qty-display').textContent = this.selectedQuantity;
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
    const stepIndex = steps.findIndex(s => s.id === this.currentStep.id);

    if (stepIndex === -1) {
      return;
    }

    // Use variantId if available, otherwise fall back to id
    // This matches how the widget stores product selections
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
