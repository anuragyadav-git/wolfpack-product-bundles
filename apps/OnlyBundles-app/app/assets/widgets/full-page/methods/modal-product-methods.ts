import { BUNDLE_WIDGET } from '../../shared/constants.js';
import { CurrencyManager } from '../../shared/currency-manager.js';
import { ToastManager } from '../../shared/toast-manager.js';
import { createSharedProductCardElement, getProductImageUrls } from '../../shared/components/product-card.js';
import { VariantSelectorComponent } from '../../shared/variant-selector.js';
import { shouldRenderInlineVariantSelector } from '../../shared/variant-selector-policy.js';
import { BundleProductModal } from '../../../bundle-modal-component.js';
import { TemplateDesignSystem } from '../../shared/template-design-system.js';
import { getSubscriptionProductCardPrice } from '../../shared/subscription-storefront-methods.js';
import { resolveLowStockAlert } from '../../../../lib/low-stock-alert.js';

const modalProductTemplateSystem = TemplateDesignSystem;

function isClassicFpbPreset(designPreset: any) {
  if (!modalProductTemplateSystem?.fpb?.resolveContract) return false;
  return modalProductTemplateSystem.fpb.resolveContract(designPreset)?.summary?.mode === 'slots';
}

function getSelectionId(item: any = {}) {
  return String(item?.selectionId || '');
}

function resolveCompareAtPrice(variant: any) {
  const rawCompareAtPrice = variant?.compareAtPrice ?? variant?.compare_at_price;
  if (rawCompareAtPrice == null) return null;
  if (typeof rawCompareAtPrice === 'object' && rawCompareAtPrice !== null && typeof rawCompareAtPrice.amount !== 'undefined') {
    return rawCompareAtPrice.amount;
  }
  return rawCompareAtPrice;
}


export const fullPageModalProductMethods: Record<string, any> & ThisType<any> = {
renderModalTabs() {
  const tabsContainer = this.elements.modal?.querySelector('.modal-tabs');
  if (!tabsContainer) return; // Modal not active (full-page mode)
  tabsContainer.replaceChildren();

  this.selectedBundle.steps.forEach((step: any, index: number) => {
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
      this.elements.modal.querySelector('.modal-step-title').textContent = headerText;

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

renderModalProducts(stepIndex: number, productsToRender: any = null) {
  // Use all products from step data
  const products = productsToRender || this.stepProductData[stepIndex];
  const selectedProducts = this.selectedProducts[stepIndex];
  const productGrid = this.elements.modal.querySelector('.product-grid');
  const step = this.selectedBundle?.steps?.[stepIndex] || {};
  const resolveText = (key: string, fallback: string) => (
    typeof this._resolveText === 'function' ? this._resolveText(key, fallback) : fallback
  );
  if (products.length === 0) {
    if (!this._shouldRenderProductSlots()) {
      const emptyMessage = typeof this.getNoProductsAvailableMessage === 'function'
        ? this.getNoProductsAvailableMessage()
        : 'No Products Available';
      const empty = document.createElement('div');
      empty.className = 'empty-products-message';
      const copy = document.createElement('p');
      copy.textContent = emptyMessage;
      empty.append(copy);
      productGrid.replaceChildren(empty);
      return;
    }

    // Show empty state cards like in Settings design preview
    const currentStep = this.selectedBundle.steps[stepIndex];
    const stepName = currentStep?.name || `Step ${stepIndex + 1}`;
    const labelText = `Select ${stepName}`;
    const emptyStateIconUrl = String(this.selectedBundle?.productSlotIconUrl || '');
    productGrid.replaceChildren();
    Array(3).fill(0).forEach(() => {
      const card = document.createElement('div');
      card.className = 'empty-state-card';
      if (emptyStateIconUrl) {
        const image = document.createElement('img');
        image.className = 'empty-state-card-icon';
        image.src = emptyStateIconUrl;
        image.alt = '';
        image.width = 69;
        image.height = 69;
        card.append(image);
      } else {
        const icon = document.createElement('span');
        icon.className = 'empty-state-card-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '+';
        card.append(icon);
      }
      const label = document.createElement('p');
      label.className = 'empty-state-card-text';
      label.textContent = labelText;
      card.append(label);
      productGrid.append(card);
    });
    return;
  }

  const cards = products.map((product: any)  => {
    const selectionKey = getSelectionId(product);
    const currentQuantity = selectedProducts[selectionKey] || 0;
    const currencyInfo = CurrencyManager.getCurrencyInfo();

    const imageUrl = product.imageUrl || product.image?.src || product.featuredImage?.url || product.images?.[0]?.url || BUNDLE_WIDGET.PLACEHOLDER_IMAGE;
    product.imageUrl = imageUrl;

    if (!product.imageUrl || product.imageUrl === '') {
      product.imageUrl = BUNDLE_WIDGET.PLACEHOLDER_IMAGE;
    }

    const variantSelectorElement = this.renderVariantSelector(product, step);

    // Per-variant stock state derived from Storefront API quantityAvailable
    const { available, outOfStock } = this.getVariantAvailable(stepIndex, selectionKey);
    const atMaxStock = available !== null && available > 0 && currentQuantity >= available;
    const increaseDisabled = outOfStock || atMaxStock;
    const addDisabled = outOfStock;
    const outOfStockLabel = resolveText('outOfStockText', 'Out of stock');
    const lowStockAlert = this.selectedBundle?.lowStockAlert
      ? resolveLowStockAlert(this.selectedBundle.lowStockAlert, [{
        quantityAvailable: typeof product.quantityAvailable === 'number'
          ? product.quantityAvailable
          : null,
        currentlyNotInStock: product.currentlyNotInStock === true,
        availableForSale: product.available !== false,
        requiredQuantity: 1,
      }])
      : null;

    // Low-stock / out-of-stock badge — shown on the image, not in the CTA.
    const stockBadgeElement = outOfStock || lowStockAlert ? document.createElement('div') : null;
    if (stockBadgeElement) {
      stockBadgeElement.className = `product-stock-badge ${outOfStock ? 'product-stock-badge--out' : 'product-stock-badge--low'}`;
      stockBadgeElement.textContent = outOfStock
        ? outOfStockLabel
        : lowStockAlert?.message ?? '';
    }

    return createSharedProductCardElement(
      {
        ...product,
        imageUrl,
      },
      currentQuantity,
      currencyInfo,
      {
        productDetailsEnabled: true,
        displayPrice: getSubscriptionProductCardPrice(this, product.price),
        variantSelectorElement,
        stockBadgeElement,
        showCompareAtPrice: this._getLandingPageControls?.()?.showCompareAtPrice === true,
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
  });
  productGrid.replaceChildren(...cards);

  // Attach event handlers
  this.attachProductEventHandlers(productGrid, stepIndex);
},

renderVariantSelector(product: any, step: any) {
  if (!product.variants || product.variants.length <= 1) {
    return null;
  }
  const primaryOptionName = step?.primaryVariantOption || null;
  const displayVariantsAsIndividualProducts = step?.displayVariantsAsIndividualProducts === true
    || step?.displayVariantsAsIndividual === true;
  if (!shouldRenderInlineVariantSelector({
    bundleVariantSelectorEnabled: this.selectedBundle?.variantSelectorEnabled !== false,
    product,
    displayVariantsAsIndividualProducts,
  })) {
    return null;
  }
  return VariantSelectorComponent.createDropdownElement(product, primaryOptionName, {
    placeholder: this._resolveText?.('chooseOptionsButton', 'Choose Options') || 'Choose Options',
    mobileMode: 'drawer',
    hideUnavailable: true,
  });
},

attachProductEventHandlers(productGrid: any, stepIndex: string|number) {
  // Remove existing event listeners to prevent duplicates
  const newProductGrid = productGrid.cloneNode(true);
  productGrid.parentNode.replaceChild(newProductGrid, productGrid);

  // Get step data for modal
  const step = this.selectedBundle.steps[stepIndex];

  // Helper to find product by ID
  const findProduct = (productId: any) => {
    const targetId = String(productId || '');
    return this.stepProductData[stepIndex]?.find((p: any) => {
      const selectionKey = getSelectionId(p);
      const variantId = String(p?.variantId || p?.id || '');
      return String(selectionKey) === targetId || variantId === targetId;
    });
  };

  const openProductModalForCard = (productCard: any) => {
    if (!this.productModal) {
      this.productModal = new BundleProductModal(this);
    }
    if (!productCard || !this.productModal) return;
    const productId = productCard.dataset.productId;
    const product = findProduct(productId);

    if (product && step) {
      const initialImageIndex = Number(productCard.dataset.bwCardImageIndex || 0);
      const isClassicQuickView = isClassicFpbPreset(this.getFullPageDesignPreset?.());
      this.productModal.open(product, step, {
        initialImageIndex,
        readOnly: isClassicQuickView,
      });
    }
  };

  // Quantity button handlers
  newProductGrid.addEventListener('click', (e: any) => {
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
  newProductGrid.addEventListener('click', (e: any) => {
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
  newProductGrid.addEventListener('click', (e: any) => {
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

  const isActivationKey = (event: any) => event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar';
  const isProductCardControl = (element: any) => element.closest(
    '.inline-qty-btn, .product-add-btn, .bw-product-card__image-nav, .product-card-action, .variant-selector, .vs-wrapper',
  );

  newProductGrid.addEventListener('keydown', (e: any) => {
    if (!isActivationKey(e)) return;

    const target = e.target || newProductGrid;
    if (!target || isProductCardControl(target)) return;
    if (!target.closest('.product-image, .product-title') && !target.closest('.product-card')) return;
    e.preventDefault();
    e.stopPropagation();
    openProductModalForCard(target.closest('.product-card'));
  });

  newProductGrid.querySelectorAll('.product-image, .product-title').forEach((element: any) => {
    element.addEventListener('click', (event: any) => {
      if (event.target.closest('.bw-product-card__image-nav')) return;
      event.stopPropagation();
      openProductModalForCard(event.target.closest('.product-card'));
    });
  });

  const displayVariantsAsIndividualProducts = step?.displayVariantsAsIndividualProducts === true
    || step?.displayVariantsAsIndividual === true;
  newProductGrid.querySelectorAll('.product-card').forEach((cardElement: any) => {
    const product = findProduct(cardElement.dataset.productId);
    if (!product) return;
    if (!shouldRenderInlineVariantSelector({
      bundleVariantSelectorEnabled: this.selectedBundle?.variantSelectorEnabled !== false,
      product,
      displayVariantsAsIndividualProducts,
    })) {
      return;
    }
    if (!cardElement.querySelector('.vs-wrapper')) {
      return;
    }
    VariantSelectorComponent.attachListeners(cardElement, product, (newVariantId: string|number, oldVariantId: string|number) => {
      const oldQuantity = this.selectedProducts[stepIndex]?.[oldVariantId] || 0;
      if (oldQuantity > 0 && oldVariantId !== newVariantId) {
        delete this.selectedProducts[stepIndex][oldVariantId];

        const newQtyAvail = product.quantityAvailable;
        const newOOS = this.isVariantOutOfStock(product);
        const trackInventoryOnAddToCart = typeof this.isInventoryTrackingOnAddToCartEnabled === 'function'
          ? this.isInventoryTrackingOnAddToCartEnabled()
          : false;
        let migratedQty = oldQuantity;
        if (newOOS) {
          ToastManager.show('Selected variant is out of stock — selection cleared.');
          migratedQty = 0;
        } else if (trackInventoryOnAddToCart && newQtyAvail !== null && oldQuantity > newQtyAvail) {
          migratedQty = newQtyAvail;
          ToastManager.show('Only ' + newQtyAvail + ' in stock — quantity adjusted.');
        }
        if (migratedQty > 0) {
          this.selectedProducts[stepIndex][newVariantId] = migratedQty;
        }
        const qtyDisplay = cardElement.querySelector('.inline-qty-display');
        if (qtyDisplay) {
          qtyDisplay.textContent = String(migratedQty);
        }
      }

      product.selectionId = String(newVariantId);
      product.variantId = String(newVariantId);

      cardElement.dataset.productId = newVariantId;
      cardElement.dataset.currentSelectedVariantId = newVariantId;
      cardElement.querySelectorAll('[data-product-id]').forEach((el: any) => {
        if (el !== cardElement) {
          el.dataset.productId = newVariantId;
        }
      });

      this.updateProductCardVariantDisplay(cardElement, product, step);
      const sidePanel = this.elements.stepsContainer.querySelector('.full-page-side-panel');
      this.renderSidePanel(sidePanel);
      if (this._syncSummaryPresentationMode?.() === 'tray') {
        this._renderMobileSummaryTray({ preserveOpen: true });
      }
      this.updateStepTimeline?.();
      this.updateModalNavigation();
      this.updateModalFooterMessaging();
    });
  });

  // Variant selector handler
  newProductGrid.addEventListener('change', (e: any) => {
    if (e.target.classList.contains('variant-selector')) {
      e.stopPropagation();
      const newVariantId = e.target.value;
      const baseProductId = e.target.dataset.baseProductId || e.target.dataset.productId;

      // Find the product and update its variant
      const cardElement = e.target.closest('.product-card');
      const product = findProduct(baseProductId)
        || (cardElement ? findProduct(cardElement.dataset.productId) : null);
      if (product) {
        const variantData = product.variants.find((v: any)  => getSelectionId(v) === String(newVariantId));
        if (variantData) {
          const oldSelectionKey = getSelectionId(product);
          const oldQuantity = this.selectedProducts[stepIndex]?.[oldSelectionKey] || 0;

          product.selectionId = String(newVariantId);
          // Sync the new variant's stock fields onto the product so
          // getVariantAvailable() reflects post-swap state.
          product.quantityAvailable = typeof variantData.quantityAvailable === 'number'
            ? variantData.quantityAvailable
            : null;
          product.currentlyNotInStock = variantData.currentlyNotInStock === true;
          product.available = variantData.available === true;
          product.price = variantData.price;
          product.compareAtPrice = resolveCompareAtPrice(variantData);

          // Move quantity from old variant to new variant, re-clamping against
          // the new variant's quantityAvailable. If the new variant can't hold
          // the old quantity, reduce it and surface a toast.
          if (oldQuantity > 0) {
            delete this.selectedProducts[stepIndex][oldSelectionKey];

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

            const qtyDisplay = cardElement?.querySelector('.inline-qty-display');
            if (qtyDisplay) {
              qtyDisplay.textContent = String(migratedQty);
            }
          }

          // Update product properties
          product.variantId = newVariantId;
          product.selectionId = newVariantId;

          if (cardElement) {
            cardElement.dataset.productId = newVariantId;
            cardElement.dataset.currentSelectedVariantId = newVariantId;
            cardElement.querySelectorAll('[data-product-id]').forEach((el: any) => {
              if (el !== cardElement) {
                el.dataset.productId = newVariantId;
              }
            });
            this.updateProductCardVariantDisplay(cardElement, product, step);
          }

          // Update UI without full re-render
          this.updateModalNavigation();
          this.updateModalFooterMessaging();
        }
      }
    }
  });

},
};
