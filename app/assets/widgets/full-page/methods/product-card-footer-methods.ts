import { BUNDLE_WIDGET } from '../../shared/constants.js';
import { CurrencyManager } from '../../shared/currency-manager.js';
import { ToastManager } from '../../shared/toast-manager.js';
import { ConditionValidator } from '../../shared/condition-validator.js';
import { createSharedProductCardElement, getProductImageUrls } from '../../shared/components/product-card.js';
import { VariantSelectorComponent } from '../../shared/variant-selector.js';
import {
  getInlineVariantSelectorPresentation,
  shouldRenderInlineVariantSelector,
} from '../../shared/variant-selector-policy.js';
import { BundleProductModal } from '../../../bundle-modal-component.js';
import { TemplateDesignSystem } from '../../shared/template-design-system.js';
import { getSubscriptionProductCardPrice } from '../../shared/subscription-storefront-methods.js';

const productCardFooterTemplateSystem = TemplateDesignSystem;

function getSelectionId(item: any = {}) {
  return String(item?.selectionId || '');
}

function getFpbPresetContract(designPreset: any) {
  if (typeof productCardFooterTemplateSystem?.fpb?.resolveContract !== 'function') return null;
  return productCardFooterTemplateSystem.fpb.resolveContract(designPreset) || null;
}

function getFpbProductCardMode(designPreset: any) {
  return getFpbPresetContract(designPreset)?.productCard?.mode || null;
}

function isClassicFpbPreset(designPreset: any) {
  return getFpbPresetContract(designPreset)?.summary?.mode === 'slots';
}

function shouldUseAddonDiscountBadge(designPreset: any) {
  const contract = getFpbPresetContract(designPreset);
  if (!contract) return false;

  const summaryMode = contract?.summary?.mode || '';
  const cardMode = contract?.productCard?.mode || '';
  return summaryMode !== 'compactSlots' && cardMode !== 'row';
}


export const fullPageProductCardFooterMethods: Record<string, any> & ThisType<any> = {
createProductCard(product: any, stepIndex: string|number, options: any = {}) {
  const resolveText = (key: string, fallback: string) => (
    typeof this._resolveText === 'function' ? this._resolveText(key, fallback) : fallback
  );
  const productId = getSelectionId(product);
  const selectedQuantity = this.selectedProducts[stepIndex]?.[productId] || 0;
  const directDefaultQuantity = product?.isDirectDefaultProduct
    ? Math.max(0, Number.parseFloat(product.defaultRequiredQuantity) || 0)
    : 0;
  const currentQuantity = Math.max(0, selectedQuantity - directDefaultQuantity);


  // Ensure product has an image URL (use multiple fallbacks)
  if (!product.imageUrl || product.imageUrl === '') {
    product.imageUrl = product.image?.src ||
                      product.featuredImage?.url ||
                      product.images?.[0]?.url ||
                      BUNDLE_WIDGET.PLACEHOLDER_IMAGE;
  }

  // Get currency info for formatting
  const currencyInfo = CurrencyManager.getCurrencyInfo();

  // Build inline variant selector using the step's merchant-configured primary option
  const step = (this.selectedBundle?.steps || [])[stepIndex];
  const primaryOptionName = step?.primaryVariantOption || null;
  const displayVariantsAsIndividualProducts =
    typeof options.displayVariantsAsIndividualProducts === 'boolean'
      ? options.displayVariantsAsIndividualProducts
      : step?.displayVariantsAsIndividualProducts === true || step?.displayVariantsAsIndividual === true;
  const designPreset = this.getFullPageDesignPreset();
  const variantSelectorPresentation = getInlineVariantSelectorPresentation(designPreset);
  const usesDropdownVariantSelector = variantSelectorPresentation.type === 'dropdown';
  const shouldRenderVariantSelector = shouldRenderInlineVariantSelector({
    bundleVariantSelectorEnabled: this.selectedBundle?.variantSelectorEnabled !== false,
    product,
    displayVariantsAsIndividualProducts,
  });
  const selectableVariantCount = Array.isArray(product?.variants)
    ? product.variants.filter((variant: any)  => variant?.available !== false).length
    : 0;
  const openVariantModalOnAdd =
    this.selectedBundle?.variantSelectorEnabled === false
    && displayVariantsAsIndividualProducts === false
    && selectableVariantCount > 1;
  const addButtonText = openVariantModalOnAdd
    ? resolveText('chooseOptionsButton', 'Choose Options')
    : this.getProductCardAddButtonText(step);
  const variantSelectorElement = shouldRenderVariantSelector
    ? usesDropdownVariantSelector
      ? VariantSelectorComponent.createDropdownElement(product, primaryOptionName, {
        placeholder: getFpbProductCardMode(designPreset) === 'row'
          ? ''
          : resolveText('chooseOptionsButton', 'Choose Options'),
        mobileMode: variantSelectorPresentation.mobileMode,
        hideUnavailable: true,
      })
      : VariantSelectorComponent.createElement(product, primaryOptionName)
    : null;

  const displayProduct = this.buildPaidAddonProductDisplayData(product, step);
  const outOfStock = typeof this.isVariantOutOfStock === 'function'
    ? this.isVariantOutOfStock(displayProduct)
    : displayProduct?.available === false;
  const increaseDisabled = ConditionValidator.isProductQuantityIncreaseDisabled(
    this.selectedBundle?.validateQuantityPerProduct,
    currentQuantity,
  );
  const normalizedStepName = typeof step?.name === 'string' && step?.name.trim().length > 0
    ? step.name
    : typeof step?.title === 'string' && step.title.trim().length > 0
      ? step.title
      : 'step';
  const removeLabelSource = resolveText(
    'removeProductFromFooterText',
    'Remove this product from step',
  );
  const removeActionLabel = removeLabelSource
    .replace('{{stepName}}', normalizedStepName)
    .replace('{{quantity}}', String(currentQuantity));
  const supportsAddonDiscountBadge = shouldUseAddonDiscountBadge(designPreset);
  const hasAddonDiscountBadge = supportsAddonDiscountBadge && displayProduct.addonDiscountBadgeText;
  const cardBadgeElement = hasAddonDiscountBadge
    ? document.createElement('span')
    : null;
  if (cardBadgeElement) {
    cardBadgeElement.className = 'fpb-addon-discount-badge';
    cardBadgeElement.textContent = displayProduct.addonDiscountBadgeText;
  }
  const cardElement = createSharedProductCardElement(
      displayProduct,
      currentQuantity,
      currencyInfo,
      {
        displayPrice: getSubscriptionProductCardPrice(this, displayProduct.price),
        description: '',
        variantSelectorElement,
        mode: getFpbProductCardMode(designPreset) || 'grid',
        className: outOfStock ? 'is-out-of-stock' : '',
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
        removeAriaLabel: removeActionLabel,
        soldOutAriaLabel: resolveText('noProductsAvailableText', 'No Products Available'),
        addButtonAriaLabel: resolveText('addButtonText', 'Add'),
        addButtonText,
        increaseDisabled,
        cardBadgeElement,
        variantSelectorPlacement: usesDropdownVariantSelector ? 'beforePrice' : undefined,
      }
    );

  this.applyStandardExpandedVariantTitle(cardElement, displayProduct);

  // Default (included) step: add "Included" badge and disable interaction controls
  const currentStepData = (this.selectedBundle?.steps || [])[stepIndex];
  if (currentStepData?.isDefault) {
    cardElement.classList.add('fpb-card--default-included');
    const imgEl = cardElement.querySelector('.product-image, .product-img, img');
    if (imgEl && imgEl.parentElement) {
      imgEl.parentElement.classList.add('fpb-card-image-wrapper');
      const badge = document.createElement('span');
      badge.className = 'fpb-included-badge';
      const _includedBadgeUrl = (() => {
        const v = getComputedStyle(document.documentElement).getPropertyValue('--bundle-included-badge-url').trim();
        if (!v || v === 'none') return null;
        const m = v.match(/^url\(['"]?(.*?)['"]?\)$/);
        return m ? m[1] : null;
      })();
      if (_includedBadgeUrl) {
        const img = document.createElement('img');
        img.src = _includedBadgeUrl;
        img.alt = 'Included';
        img.className = 'fpb-included-badge-img';
        badge.appendChild(img);
      } else {
        badge.textContent = resolveText('includedBadge', 'Included');
}
      imgEl.parentElement.appendChild(badge);
    }
  }

  // Free gift step: add "Free" badge and override price display to $0.00
  if (currentStepData?.isFreeGift && currentStepData?.addonDisplayFree === true && !hasAddonDiscountBadge) {
    const imgEl = cardElement.querySelector('.product-image, .product-img, img');
    if (imgEl && imgEl.parentElement) {
      imgEl.parentElement.classList.add('fpb-card-image-wrapper');
      const badge = document.createElement('span');
      badge.className = 'fpb-free-badge';
      const _badgeUrl = (() => {
        const v = getComputedStyle(document.documentElement).getPropertyValue('--bundle-free-gift-badge-url').trim();
        if (!v || v === 'none') return null;
        const m = v.match(/^url\(['"]?(.*?)['"]?\)$/);
        return m ? m[1] : null;
      })();
      if (_badgeUrl) {
        const img = document.createElement('img');
        img.src = _badgeUrl;
        img.alt = 'Free gift';
        img.className = 'fpb-free-badge-img';
        badge.appendChild(img);
      } else {
        badge.textContent = resolveText('freeBadge', 'Free');
      }
      imgEl.parentElement.appendChild(badge);
    }
    const priceEl = cardElement.querySelector('.product-price, .price');
    if (priceEl) {
      const originalPriceText = priceEl.textContent;
      const _ci = CurrencyManager.getCurrencyInfo();
      const originalPrice = document.createElement('span');
      originalPrice.className = 'side-panel-product-original-price';
      originalPrice.textContent = originalPriceText;
      priceEl.replaceChildren(
        document.createTextNode(`${CurrencyManager.convertAndFormat(0, _ci)} `),
        originalPrice,
      );
    }
  }

  // Attach event listeners for full-page specific interactions
  this.attachProductCardListeners(cardElement, product, stepIndex, {
    displayVariantsAsIndividualProducts,
    openVariantModalOnAdd,
  });

  return cardElement;
},

buildPaidAddonProductDisplayData(product: any, step: any) {
  const isAddonDiscountStep = step?.isFreeGift === true;
  if (!isAddonDiscountStep || typeof this.getAddonLineDiscount !== 'function') return product;

  const addonDiscount = this.getAddonLineDiscount(step);
  if (!addonDiscount || addonDiscount.type !== 'PERCENTAGE') return product;

  const originalPrice = Number(product?.price || 0);
  const discountValue = Number(addonDiscount.value || 0);
  if (!Number.isFinite(originalPrice) || originalPrice <= 0 || !Number.isFinite(discountValue) || discountValue <= 0) {
    return product;
  }

  const normalizedDiscountValue = Math.min(100, Math.max(0, discountValue));
  const discountedPrice = Math.max(0, Math.round(originalPrice * (100 - normalizedDiscountValue) / 100));
  return {
    ...product,
    price: discountedPrice,
    compareAtPrice: originalPrice,
    addonDiscountBadgeText: `${normalizedDiscountValue}% off`,
  };
  },

getProductCardAddButtonText(step: any) {
  const isPaidAddonStep = step?.isFreeGift === true && step?.addonDisplayFree !== true;
  if (isPaidAddonStep) {
    if (isClassicFpbPreset(this.getFullPageDesignPreset?.())) {
      return this.getProductAddButtonText();
    }
    return this._resolveText('addToCartButton', this.config?.addToCartText || 'Add to Cart');
  }

  return this.getProductAddButtonText();
},

applyStandardExpandedVariantTitle(cardElement: any, product: any) {
  const contract = getFpbPresetContract(this.getFullPageDesignPreset?.());
  if (!contract || contract.summary?.mode !== 'rows') return;
  if (!cardElement) return;
  if (cardElement.querySelector('[data-bw-card-variant-row="true"]')) return;

  const variantTitle = this.getSummaryProductVariantDisplay(product);
  if (!product?.parentProductId || !variantTitle) return;

  const titleEl = cardElement.querySelector('.product-title');
  if (!titleEl) return;

  const parentTitle = this.getSummaryProductDisplayTitle({
    ...product,
    variantTitle: product.variantTitle || 'Default Title',
    title: product.title || '',
    parentTitle: product.parentTitle || ''
  });
  if (!parentTitle) return;

  cardElement.classList.add('product-card--expanded-variant');
  titleEl.textContent = parentTitle;
  const variantDividerEl = document.createElement('div');
  variantDividerEl.className = 'bw-product-card__variant-divider';
  variantDividerEl.setAttribute('aria-hidden', 'true');
  titleEl.insertAdjacentElement('afterend', variantDividerEl);
  const variantEl = document.createElement('div');
  variantEl.className = 'bw-product-card__variant product-variant-row';
  variantEl.setAttribute('data-bw-card-variant-row', 'true');
  variantEl.textContent = variantTitle;
  variantDividerEl.insertAdjacentElement('afterend', variantEl);
},

getSummaryProductDisplayTitle(item: any) {
  if (!item) return '';
  const hasVariantLabel = item.variantTitle && item.variantTitle !== 'Default Title';
  const hasUsableParentTitle = typeof item.parentTitle === 'string' && item.parentTitle.trim().length > 0;
  if (hasVariantLabel && hasUsableParentTitle) return item.parentTitle;

  const inferredParentTitle = this.getParentTitleFromDisplayTitle(item.title);
  if (inferredParentTitle && hasVariantLabel) return inferredParentTitle;

  if (hasUsableParentTitle) {
    return item.parentTitle;
  }

  return inferredParentTitle || item.title || '';
},

getSummaryProductVariantDisplay(item: any) {
  if (!item) return '';

  const explicitVariantTitle = typeof item.variantTitle === 'string' ? item.variantTitle : '';
  if (explicitVariantTitle && explicitVariantTitle !== 'Default Title') {
    return explicitVariantTitle;
  }

  const parentTitle = typeof item.parentTitle === 'string' ? item.parentTitle : '';
  const normalizedTitle = typeof item.title === 'string' ? item.title : '';
  if (!normalizedTitle) return '';

  if (parentTitle) {
    const withParentPrefix = `${parentTitle} - `;
    if (normalizedTitle.startsWith(withParentPrefix)) {
      const inferredVariant = normalizedTitle.slice(withParentPrefix.length).trim();
      return inferredVariant || '';
    }
  }

  return this.getSummaryVariantFromDisplayTitle(normalizedTitle);
},

getParentTitleFromDisplayTitle(displayTitle: string) {
  if (typeof displayTitle !== 'string') return '';
  const separatorIndex = displayTitle.indexOf(' - ');
  if (separatorIndex <= 0) return '';
  const parentCandidate = displayTitle.slice(0, separatorIndex).trim();
  return parentCandidate || '';
},

getSummaryVariantFromDisplayTitle(displayTitle: string) {
  if (typeof displayTitle !== 'string') return '';
  const separatorIndex = displayTitle.indexOf(' - ');
  if (separatorIndex <= 0) return '';
  const variantCandidate = displayTitle.slice(separatorIndex + 3).trim();
  return variantCandidate || '';
},

// Attach event listeners to product card
attachProductCardListeners(cardElement: any, product: any, stepIndex: any, options: any = {}) {
  // Default steps are read-only — no add/remove/quantity interaction allowed
  const step = (this.selectedBundle?.steps || [])[stepIndex];
  if (step?.isDefault) return;

  // Prefer the clicked control's data key; variant selector updates the DOM before
  // subsequent quantity clicks, while the captured product object can lag behind.
  const getProductId = () => getSelectionId(product);
  const getClickedProductId = (element: any) => element?.dataset?.productId || getProductId();
  const openCardDetails = () => {
    if (!this.productModal) {
      this.productModal = new BundleProductModal(this);
    }
    if (!this.productModal) return;

    const initialImageIndex = Number(cardElement.dataset.bwCardImageIndex || 0);
    const isClassicQuickView = isClassicFpbPreset(this.getFullPageDesignPreset?.());
    this.productModal.open(product, step, {
      initialImageIndex,
      readOnly: isClassicQuickView,
    });
  };
  const isActivationKey = (event: any) => event.key === 'Enter' || event.key === ' ';
  const isProductCardControl = (element: any) => element.closest(
    '.inline-qty-btn, .product-add-btn, .bw-product-card__image-nav, .product-card-action, .vs-wrapper',
  );

  cardElement.addEventListener('click', (e: any) => {
    const imageNav = e.target.closest('.bw-product-card__image-nav');
    if (imageNav) {
      e.preventDefault();
      e.stopPropagation();
      const imageUrls = getProductImageUrls(product);
      if (imageUrls.length <= 1) return;

      const currentIndex = Number(cardElement.dataset.bwCardImageIndex || 0);
      const direction = imageNav.dataset.bwImageNav === 'prev' ? -1 : 1;
      const nextIndex = (currentIndex + direction + imageUrls.length) % imageUrls.length;
      const imageEl = cardElement.querySelector('.bw-product-card__image');
      if (imageEl) {
        imageEl.src = imageUrls[nextIndex];
      }
      cardElement.dataset.bwCardImageIndex = String(nextIndex);
      return;
    }

    if (!e.target.closest('.product-image, .product-title')) return;
    e.stopPropagation();
    openCardDetails();
  });

  cardElement.addEventListener('keydown', (event: any) => {
    if (!isActivationKey(event)) return;
    const { target } = event;
    const normalizedTarget = target || cardElement;
    if (!normalizedTarget || isProductCardControl(normalizedTarget)) return;
    if (!cardElement.contains(normalizedTarget)) return;
    event.preventDefault();
    event.stopPropagation();
    openCardDetails();
  });

  // Inline quantity increase/decrease buttons (delegated via card element)
  cardElement.addEventListener('click', (e: any) => {
    const btn = e.target.closest('.inline-qty-btn');
    if (!btn) return;
    e.stopPropagation();
    const productId = getClickedProductId(btn);
    const currentQty = this.selectedProducts[stepIndex]?.[productId] || 0;
    if (btn.classList.contains('qty-increase')) {
      const { available } = this.getVariantAvailable(stepIndex, productId);
      if (available !== null && currentQty >= available) {
        ToastManager.show('Maximum stock reached for this variant.');
        return;
      }
      this.updateProductSelection(stepIndex, productId, currentQty + 1);
    } else if (btn.classList.contains('qty-decrease') && currentQty > 0) {
      this.updateProductSelection(stepIndex, productId, currentQty - 1);
    }
  });

  // Circle add button: qty 0 → 1
  cardElement.addEventListener('click', (e: any) => {
    const addBtn = e.target.closest('.product-add-btn');
    if (!addBtn) return;
    e.stopPropagation();
    if (options.openVariantModalOnAdd === true) {
      if (!this.productModal) {
        this.productModal = new BundleProductModal(this);
      }
      if (!this.productModal) return;
      const initialImageIndex = Number(cardElement.dataset.bwCardImageIndex || 0);
      this.productModal.open(product, step, {
        initialImageIndex,
        readOnly: false,
      });
      return;
    }
    const productId = getClickedProductId(addBtn);
    const currentQty = this.selectedProducts[stepIndex]?.[productId] || 0;
    if (currentQty === 0) {
      const directDefaultQuantities = this._getDirectDefaultSelectionQuantities?.(stepIndex) || {};
      const hasDirectDefaultQuantity = Object.prototype.hasOwnProperty.call(
        directDefaultQuantities,
        String(productId),
      );
      const directDefaultQuantity = hasDirectDefaultQuantity
        ? Number(directDefaultQuantities[String(productId)] || 0)
        : null;
      const nextQuantity = directDefaultQuantity ?? 1;
      if (nextQuantity > 0) {
        this.updateProductSelection(stepIndex, productId, nextQuantity);
      }
    }
  });

  // Inline variant selector (VariantSelectorComponent button group + panels)
  const displayVariantsAsIndividualProducts =
    typeof options.displayVariantsAsIndividualProducts === 'boolean'
      ? options.displayVariantsAsIndividualProducts
      : step?.displayVariantsAsIndividualProducts === true || step?.displayVariantsAsIndividual === true;
  if (shouldRenderInlineVariantSelector({
    bundleVariantSelectorEnabled: this.selectedBundle?.variantSelectorEnabled !== false,
    product,
    displayVariantsAsIndividualProducts,
  })) {
    VariantSelectorComponent.attachListeners(cardElement, product, (newVariantId: string|number, oldVariantId: string|number) => {
      const oldQty = this.selectedProducts[stepIndex]?.[oldVariantId] || 0;

      if (oldQty > 0 && oldVariantId !== newVariantId) {
        // Remove old variant qty
        if (this.selectedProducts[stepIndex]) {
          delete this.selectedProducts[stepIndex][oldVariantId];
        }
        // Clamp against new variant's stock
        const newQtyAvail = product.quantityAvailable; // already updated by component
        const newOOS = this.isVariantOutOfStock(product);
        const trackInventoryOnAddToCart = typeof this.isInventoryTrackingOnAddToCartEnabled === 'function'
          ? this.isInventoryTrackingOnAddToCartEnabled()
          : false;
        let migratedQty = oldQty;
        if (newOOS) {
          ToastManager.show('Selected variant is out of stock — selection cleared.');
          migratedQty = 0;
        } else if (trackInventoryOnAddToCart && newQtyAvail !== null && oldQty > newQtyAvail) {
          migratedQty = newQtyAvail;
          ToastManager.show('Only ' + newQtyAvail + ' in stock — quantity adjusted.');
        }
        if (migratedQty > 0) {
          this.selectedProducts[stepIndex][newVariantId] = migratedQty;
        }
        // Update inline qty display
        const qtyDisplay = cardElement.querySelector('.inline-qty-display');
        if (qtyDisplay) qtyDisplay.textContent = migratedQty;
      }

      // Update data-product-id on card + action buttons so subsequent clicks use correct ID
      cardElement.dataset.productId = newVariantId;
      cardElement.dataset.currentSelectedVariantId = newVariantId;
      cardElement.querySelectorAll('[data-product-id]').forEach((el: any)  => {
        if (el !== cardElement) el.dataset.productId = newVariantId;
      });
      this.updateProductCardVariantDisplay(cardElement, product, step);

      const sidePanel = this.elements.stepsContainer.querySelector('.full-page-side-panel');
      this.renderSidePanel(sidePanel);
      if (this._syncSummaryPresentationMode?.() === 'tray') {
        this._renderMobileSummaryTray({ preserveOpen: true });
      }
      this.updateStepTimeline?.();
    });
  }
},

updateProductCardVariantDisplay(cardElement: any, product: any, step: any) {
  if (!cardElement || !product) return;

  const displayProduct = this.buildPaidAddonProductDisplayData(product, step);
  const currencyInfo = CurrencyManager.getCurrencyInfo();
  const formattedCurrentPrice = getSubscriptionProductCardPrice(
    this,
    displayProduct.price || 0,
  );
  const currentPriceText = CurrencyManager.convertAndFormat(
    formattedCurrentPrice,
    currencyInfo,
  );
  const compareAtText = displayProduct.compareAtPrice
    ? CurrencyManager.convertAndFormat(displayProduct.compareAtPrice, currencyInfo)
    : '';

  let priceRow = cardElement.querySelector('.product-price-row');
  let priceEl = cardElement.querySelector('.product-price');
  let compareEl = cardElement.querySelector('.product-price-strike');
  const actionRow = cardElement
    .querySelector('.product-card-action')
    ?.closest('.product-card-price-action');

  if (!priceRow && (currentPriceText || compareAtText)) {
    priceRow = document.createElement('div');
    priceRow.className = 'bw-product-card__price product-price-row';
    if (actionRow) {
      actionRow.insertBefore(
        priceRow,
        actionRow.querySelector('.product-card-action') || null,
      );
    } else {
      cardElement.appendChild(priceRow);
    }
  }

  if (priceRow) {
    if (priceEl) {
      if (currentPriceText) {
        priceEl.textContent = currentPriceText;
      } else {
        priceEl.remove();
        priceEl = null;
      }
    } else if (currentPriceText) {
      const currentPriceEl = document.createElement('span');
      currentPriceEl.className = 'bw-product-card__current-price product-price';
      currentPriceEl.textContent = currentPriceText;
      priceRow.appendChild(currentPriceEl);
    }

    if (compareAtText) {
      if (!compareEl) {
        compareEl = document.createElement('span');
        compareEl.className = 'bw-product-card__compare-price product-price-strike';
        if (priceEl) {
          priceRow.insertBefore(compareEl, priceEl);
        } else {
          priceRow.appendChild(compareEl);
        }
      }
      compareEl.textContent = compareAtText;
    } else if (compareEl) {
      compareEl.remove();
    }
  }
  if (!currentPriceText && !compareAtText && priceRow) {
    priceRow.remove();
  }

  const imageEl = cardElement.querySelector('.bw-product-card__image, .product-image img, img');
  if (imageEl && product.imageUrl) {
    imageEl.src = product.imageUrl;
    cardElement.dataset.bwCardImageIndex = '0';
    cardElement.dataset.bwCardImageCount = String(getProductImageUrls(product).length);
  }

},

// Refresh the step timeline tabs in-place when product selections change.
// Called after every updateProductSelection() so tabs reflect current completion
// state (completed/active/locked classes, click listeners, product images, counts).
updateStepTimeline() {
  if (!this.config.showStepTimeline) return;
  const existing = this.elements.stepsContainer.querySelector('.step-timeline');
  if (!existing) return;
  const fresh = this.createStepTimeline();
  existing.parentNode.replaceChild(fresh, existing);
},

};
