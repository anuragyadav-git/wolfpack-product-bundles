import {
  BUNDLE_WIDGET,
  CurrencyManager,
  BundleDataManager,
  PricingCalculator,
  ToastManager,
  TemplateManager,
  ComponentGenerator
} from '../../../bundle-widget-components.js';
import { ConditionValidator } from '../../shared/condition-validator.js';
import { createDefaultLoadingAnimation } from '../../shared/default-loading-animation.js';
import { hideLoadingOverlayElement, markLoadingOverlayVisible } from '../../shared/loading-overlay.js';
import { getDiscountProgressData, getSelectedQuantity, getTimelineEntryState } from '../../shared/engine/bundle-selectors.js';
import { renderDiscountProgress } from '../../shared/components/discount-progress.js';
import { createBundleBannerElement, createStepBannerImageElement } from '../../shared/components/bundle-banners.js';
import { getProductImageUrls, renderSharedProductCard } from '../../shared/components/product-card.js';
import { renderSelectedProductRow } from '../../shared/components/selected-product-row.js';
import { renderSelectedProductSlots } from '../../shared/components/selected-product-slots.js';
import { renderStepTimelineEntry } from '../../shared/components/step-timeline.js';
import { VariantSelectorComponent } from '../../shared/variant-selector.js';
import {
  buildCartLineDisplayProperties,
  buildCartLineSourceProperties,
} from '../../shared/engine/cart-lines.js';

function getSelectionId(item = {}) {
  return String(item?.selectionId || '');
}


export const fullPageModalProductMethods = {
getSelectedSellingPlanAllocationId(product, variantId) {
  if (!this.shouldApplyIndividualSellingPlanSelectionForProduct(product, variantId)) {
    return null;
  }

  const normalizedSelectedId = getSelectionId({ selectionId: variantId });
  const variant = Array.isArray(product?.variants)
    ? product.variants.find((candidate) => getSelectionId(candidate) === normalizedSelectedId)
    : null;

  const normalizedProduct = (variant?.sellingPlanAllocations !== undefined ? variant : product) || {};
  const allocations = Array.isArray(normalizedProduct.sellingPlanAllocations)
    ? normalizedProduct.sellingPlanAllocations
    : [];

  if (allocations.length === 0) {
    return null;
  }

  const firstAllocationId = this.extractId(allocations[0]?.id);
  return firstAllocationId || null;
},

renderModalTabs() {
  const tabsContainer = this.elements.modal?.querySelector('.modal-tabs');
  if (!tabsContainer) return; // Modal not active (full-page mode)
  tabsContainer.innerHTML = '';

  this.selectedBundle.steps.forEach((step, index) => {
    const isAccessible = this.isStepAccessible(index);
    const isActive = index === this.currentStepIndex;

    // Create tab button
    const tabButton = document.createElement('button');
    tabButton.className = `bundle-header-tab ${isActive ? 'active' : ''} ${!isAccessible ? 'locked' : ''}`;
    tabButton.textContent = step.name || `Step ${index + 1}`;
    tabButton.dataset.stepIndex = index.toString();

    // Click handler
    tabButton.addEventListener('click', async () => {
      if (!isAccessible) {
        ToastManager.show('Please complete the previous steps first.');
        return;
      }

      this.currentStepIndex = index;

      // Update modal header
      const headerText = this.getFormattedHeaderText();
      this.elements.modal.querySelector('.modal-step-title').innerHTML = headerText;

      // Load products for this step if not already loaded
      await this.loadStepProducts(index);

      // Re-render everything
      this.renderModalTabs();
      this.renderModalProducts(index);
      this.updateModalNavigation();
      this.updateModalFooterMessaging();
    });

    tabsContainer.appendChild(tabButton);
  });

  // Update arrow visibility after rendering tabs
  if (this.updateTabArrows) {
    setTimeout(() => this.updateTabArrows(), 50);
  }
},

renderModalProducts(stepIndex, productsToRender = null) {
  // Use all products from step data
  const products = productsToRender || this.stepProductData[stepIndex];
  const selectedProducts = this.selectedProducts[stepIndex];
  const productGrid = this.elements.modal.querySelector('.product-grid');
  const step = this.selectedBundle?.steps?.[stepIndex] || {};
  const resolveText = (key, fallback) => (
    typeof this._resolveText === 'function' ? this._resolveText(key, fallback) : fallback
  );
  const escapeText = (value) => (
    typeof this._escapeHTML === 'function' ? this._escapeHTML(value) : String(value)
  );

  if (products.length === 0) {
    if (!this._shouldRenderProductSlots()) {
      const emptyMessage = typeof this.getNoProductsAvailableMessage === 'function'
        ? this.getNoProductsAvailableMessage()
        : 'No Products Available';
      const escapedEmptyMessage = typeof this._escapeHTML === 'function'
        ? this._escapeHTML(emptyMessage)
        : String(emptyMessage).replace(/[&<>"']/g, (char) => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[char]);
      productGrid.innerHTML = `
        <div class="empty-products-message">
          <p>${escapedEmptyMessage}</p>
        </div>
      `;
      return;
    }

    // Show empty state cards like in Settings design preview
    const currentStep = this.selectedBundle.steps[stepIndex];
    const stepName = this._escapeHTML(currentStep?.name) || `Step ${stepIndex + 1}`;
    const labelText = `Select ${stepName}`;
    const emptyStateIconUrl = this._escapeHTML(this.selectedBundle?.productSlotIconUrl || '');
    const emptyStateIcon = emptyStateIconUrl
      ? `<img class="empty-state-card-icon" src="${emptyStateIconUrl}" alt="" width="69" height="69">`
      : `<svg class="empty-state-card-icon" width="69" height="69" viewBox="0 0 69 69" fill="none">
          <line x1="34.5" y1="15" x2="34.5" y2="54" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
          <line x1="15" y1="34.5" x2="54" y2="34.5" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
        </svg>`;

    const emptyStateCards = Array(3).fill(0).map((_, index) => `
      <div class="empty-state-card">
        ${emptyStateIcon}
        <p class="empty-state-card-text">${labelText}</p>
      </div>
    `).join('');

    productGrid.innerHTML = emptyStateCards;
    return;
  }

  productGrid.innerHTML = products.map(product => {
    const selectionKey = getSelectionId(product);
    const currentQuantity = selectedProducts[selectionKey] || 0;
    const currencyInfo = CurrencyManager.getCurrencyInfo();

    const imageUrl = product.imageUrl || product.image?.src || product.featuredImage?.url || product.images?.[0]?.url || BUNDLE_WIDGET.PLACEHOLDER_IMAGE;
    product.imageUrl = imageUrl;

    if (!product.imageUrl || product.imageUrl === '') {
      product.imageUrl = BUNDLE_WIDGET.PLACEHOLDER_IMAGE;
    }

    const variantSelectorHtml = this.renderVariantSelector(product, step);

    // Per-variant stock state derived from Storefront API quantityAvailable
    const { available, outOfStock } = this.getVariantAvailable(stepIndex, selectionKey);
    const atMaxStock = available !== null && available > 0 && currentQuantity >= available;
    const lowStock = available !== null && available > 0 && available <= 3;
    const increaseDisabled = outOfStock || atMaxStock;
    const addDisabled = outOfStock;
    const outOfStockLabel = resolveText('outOfStockText', 'Out of stock');
    const lowStockTemplate = resolveText('lowStockText', 'Only {{count}} left');
    const lowStockLabel = lowStockTemplate.replace('{{count}}', String(available));

    // Low-stock / out-of-stock badge — shown on the image, not in the CTA.
    const stockBadge = outOfStock
      ? `<div class="product-stock-badge product-stock-badge--out">${escapeText(outOfStockLabel)}</div>`
      : lowStock
        ? `<div class="product-stock-badge product-stock-badge--low">${escapeText(lowStockLabel)}</div>`
        : '';

    return renderSharedProductCard(
      {
        ...product,
        imageUrl,
      },
      currentQuantity,
      currencyInfo,
      {
        variantSelectorHtml,
        stockBadgeHtml: stockBadge,
        showCompareAtPrice: this.selectedBundle?.showProductComparedAtPrice === true,
        openImageLabel: resolveText('productImageLabel', 'Open product details'),
        openTitleLabel: resolveText('productTitleLabel', 'Open product details'),
        imageNavPreviousLabel: resolveText('productImagePreviousLabel', 'Previous image'),
        imageNavNextLabel: resolveText('productImageNextLabel', 'Next image'),
        seeMoreText: resolveText('productDescriptionSeeMoreText', 'See more'),
        decreaseLabel: resolveText('decreaseQuantityText', 'Decrease quantity'),
        increaseLabel: resolveText('increaseQuantityText', 'Increase quantity'),
        selectedStateLabel: resolveText('addedLabel', 'Added'),
        quantityAriaLabel: resolveText('quantityLabel', 'Quantity'),
        variantAriaLabel: resolveText('variantLabel', 'Variant'),
        removeAriaLabel: resolveText('removeProductFromFooterText', 'Remove this product from step'),
        soldOutAriaLabel: resolveText('noProductsAvailableText', 'No Products Available'),
        addButtonAriaLabel: resolveText('addButtonText', 'Add'),
        addButtonText: outOfStock ? outOfStockLabel : this.getProductAddButtonText(),
        addDisabled,
        decreaseDisabled: currentQuantity <= 0,
        increaseDisabled,
      }
    );
  }).join('');

  // Attach event handlers
  this.attachProductEventHandlers(productGrid, stepIndex);
},

renderVariantSelector(product, step) {
  if (!product.variants || product.variants.length <= 1) {
    return '';
  }
  const primaryOptionName = step?.primaryVariantOption || null;
  return VariantSelectorComponent.renderHtml(product, primaryOptionName);
},

attachProductEventHandlers(productGrid, stepIndex) {
  // Remove existing event listeners to prevent duplicates
  const newProductGrid = productGrid.cloneNode(true);
  productGrid.parentNode.replaceChild(newProductGrid, productGrid);

  // Get step data for modal
  const step = this.selectedBundle.steps[stepIndex];

  // Helper to find product by ID
  const findProduct = (productId) => {
    return this.stepProductData[stepIndex]?.find(p => {
      const selectionKey = getSelectionId(p);
      return String(selectionKey) === String(productId);
    });
  };

  const openProductModalForCard = (productCard) => {
    if (!this.productModal && window.BundleProductModal) {
      this.productModal = new window.BundleProductModal(this);
    }
    if (!productCard || !this.productModal) return;
    const productId = productCard.dataset.productId;
    const product = findProduct(productId);

    if (product && step) {
      const initialImageIndex = Number(productCard.dataset.bwCardImageIndex || 0);
      const isClassicQuickView = this.getFullPageDesignPreset?.() === 'CLASSIC';
      this.productModal.open(product, step, {
        initialImageIndex,
        readOnly: isClassicQuickView,
      });
    }
  };

  // Quantity button handlers
  newProductGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('inline-qty-btn')) {
      e.stopPropagation();
      const productId = e.target.dataset.productId;
      const isIncrease = e.target.classList.contains('qty-increase');
      const currentQuantity = this.selectedProducts[stepIndex][productId] || 0;

      const newQuantity = isIncrease ? currentQuantity + 1 : Math.max(0, currentQuantity - 1);
      this.updateProductSelection(stepIndex, productId, newQuantity);
    }
  });

  // Add to Bundle button handler - adds directly without opening modal
  newProductGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('product-add-btn')) {
      e.stopPropagation();
      const productId = e.target.dataset.productId;
      const currentQuantity = this.selectedProducts[stepIndex][productId] || 0;
      const directDefaultQuantities = this._getDirectDefaultSelectionQuantities?.(stepIndex) || {};
      const hasDirectDefaultQuantity = Object.prototype.hasOwnProperty.call(
        directDefaultQuantities,
        String(productId),
      );
      const directDefaultQuantity = hasDirectDefaultQuantity
        ? Number(directDefaultQuantities[String(productId)] || 0)
        : null;
      const nextQuantity = currentQuantity > 0
        ? 0
        : (directDefaultQuantity ?? 1);

      // Toggle: If already added, remove; otherwise add with quantity 1
      if (nextQuantity > 0 || currentQuantity > 0) {
        this.updateProductSelection(stepIndex, productId, nextQuantity);
      }
    }
  });

  // Product image/title click - open modal
  newProductGrid.addEventListener('click', (e) => {
    const imageNav = e.target.closest('.bw-product-card__image-nav');
    if (imageNav) {
      e.preventDefault();
      e.stopPropagation();
      const productCard = imageNav.closest('.product-card');
      if (!productCard) return;
      const product = findProduct(productCard.dataset.productId);
      const imageUrls = getProductImageUrls(product);
      if (imageUrls.length <= 1) return;

      const currentIndex = Number(productCard.dataset.bwCardImageIndex || 0);
      const direction = imageNav.dataset.bwImageNav === 'prev' ? -1 : 1;
      const nextIndex = (currentIndex + direction + imageUrls.length) % imageUrls.length;
      const imageEl = productCard.querySelector('.bw-product-card__image');
      if (imageEl) {
        imageEl.src = imageUrls[nextIndex];
      }
      productCard.dataset.bwCardImageIndex = String(nextIndex);
      return;
    }

    if (e.target.closest('.product-image, .product-title')) {
      openProductModalForCard(e.target.closest('.product-card'));
    }
  });

  newProductGrid.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') {
      return;
    }

    const target = e.target.closest('.product-image, .product-title');
    if (!target) return;
    if (target.closest('.bw-product-card__image-nav')) return;
    e.preventDefault();
    e.stopPropagation();
    openProductModalForCard(target.closest('.product-card'));
  });

  newProductGrid.querySelectorAll('.product-image, .product-title').forEach((element) => {
    element.addEventListener('click', (event) => {
      if (event.target.closest('.bw-product-card__image-nav')) return;
      event.stopPropagation();
      openProductModalForCard(event.target.closest('.product-card'));
    });
  });

  // Variant selector handler
  newProductGrid.addEventListener('change', (e) => {
    if (e.target.classList.contains('variant-selector')) {
      e.stopPropagation();
      const newVariantId = e.target.value;
      const baseProductId = e.target.dataset.baseProductId;

      // Find the product and update its variant
      const product = this.stepProductData[stepIndex].find(p => getSelectionId(p) === String(baseProductId));
      if (product) {
        const variantData = product.variants.find(v => getSelectionId(v) === String(newVariantId));
        if (variantData) {
          // Sync the new variant's stock fields onto the product so
          // getVariantAvailable() reflects post-swap state.
          product.quantityAvailable = typeof variantData.quantityAvailable === 'number'
            ? variantData.quantityAvailable
            : null;
          product.currentlyNotInStock = variantData.currentlyNotInStock === true;
          product.available = variantData.available === true;

          // Move quantity from old variant to new variant, re-clamping against
          // the new variant's quantityAvailable. If the new variant can't hold
          // the old quantity, reduce it and surface a toast.
          const productSelectionKey = getSelectionId(product);
          const oldQuantity = this.selectedProducts[stepIndex][productSelectionKey] || 0;
          if (oldQuantity > 0) {
            delete this.selectedProducts[stepIndex][productSelectionKey];

            const newQtyAvail = product.quantityAvailable;
            const newOOS = this.isVariantOutOfStock(product);
            const trackInventoryOnAddToCart = typeof this.isInventoryTrackingOnAddToCartEnabled === 'function'
              ? this.isInventoryTrackingOnAddToCartEnabled()
              : false;
            let migratedQty = oldQuantity;
            if (newOOS) {
              ToastManager.show('Selected variant is out of stock — selection cleared.');
              migratedQty = 0;
            } else if (trackInventoryOnAddToCart && newQtyAvail !== null && newQtyAvail > 0 && oldQuantity > newQtyAvail) {
              migratedQty = newQtyAvail;
              ToastManager.show('Only ' + newQtyAvail + ' in stock — quantity adjusted.');
            }
            if (migratedQty > 0) {
              this.selectedProducts[stepIndex][newVariantId] = migratedQty;
            }
          }

          // Update product properties
          product.variantId = newVariantId;
          product.selectionId = newVariantId;
          product.price = variantData.price;

          // Update UI without full re-render
          this.updateModalNavigation();
          this.updateModalFooterMessaging();
        }
      }
    }
  });

  // Add cursor pointer styles to product images and titles
  newProductGrid.querySelectorAll('.product-image, .product-title').forEach(el => {
    el.style.cursor = 'pointer';
  });
},
};
