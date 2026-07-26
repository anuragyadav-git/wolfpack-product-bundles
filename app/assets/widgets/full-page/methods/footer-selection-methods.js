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
import { renderSharedProductCard } from '../../shared/components/product-card.js';
import { renderSelectedProductRow } from '../../shared/components/selected-product-row.js';
import { renderSelectedProductSlots } from '../../shared/components/selected-product-slots.js';
import { renderStepTimelineEntry } from '../../shared/components/step-timeline.js';
import {
  buildCartLineDisplayProperties,
  buildCartLineSourceProperties,
} from '../../shared/engine/cart-lines.js';

const getSelectionId = (value = {}) => String(value?.selectionId || '');
const findProductBySelectionId = (products = [], selectionId = '') => {
  const normalized = String(selectionId || '');
  return products.find(product => getSelectionId(product) === normalized);
};

const findVariantBySelectionId = (product, selectionId = '') => {
  const normalized = String(selectionId || '');
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return variants.find(variant => String(variant?.selectionId || '') === normalized);
};


export const fullPageFooterSelectionMethods = {
  _createFooterPanel(allSelectedProducts, currencyInfo) {
  const panel = document.createElement('div');
  panel.className = 'footer-panel';

  // Product list
  const list = document.createElement('ul');
  list.className = 'footer-panel-list';

  allSelectedProducts.forEach(item => {
    const li = document.createElement('li');
    li.className = 'footer-panel-item';

    const formattedPrice = CurrencyManager.convertAndFormat(item.price || 0, currencyInfo);
    const summaryTitle = this.getSummaryProductDisplayTitle(item);
    const truncatedTitle = this.truncateTitle(summaryTitle, 35);
    const ariaLabelTitle = ComponentGenerator.escapeHtml(summaryTitle);

    li.innerHTML = `
      <img src="${this._getSelectedProductImageSrc(item) || BUNDLE_WIDGET.PLACEHOLDER_IMAGE}"
           alt="${ariaLabelTitle}"
           class="footer-panel-thumb">
      <div class="footer-panel-info">
        <p class="footer-panel-name">${ComponentGenerator.escapeHtml(truncatedTitle)}</p>
        <p class="footer-panel-price">${formattedPrice} <span class="footer-panel-qty">×${item.quantity}</span></p>
      </div>
      ${!item.isDefault ? `
      <button class="footer-panel-remove" type="button" aria-label="Remove ${ariaLabelTitle}">
        <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor">
          <path d="M6 2h8a1 1 0 0 1 1 1v1H5V3a1 1 0 0 1 1-1Zm-2 3h12l-1 13H5L4 5Zm4 2v9m4-9v9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        </svg>
      </button>` : ''}
    `;

    if (!item.isDefault) {
      const removeBtn = li.querySelector('.footer-panel-remove');
      if (!removeBtn) return;
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectionId = getSelectionId(item);
        if (!selectionId) return;
        const removedItem = { stepIndex: item.stepIndex, selectionId, quantity: item.quantity, title: item.title };
        this.updateProductSelection(item.stepIndex, selectionId, 0);
        const truncated = summaryTitle.length > 25 ? summaryTitle.substring(0, 25) + '...' : summaryTitle;
        ToastManager.showWithUndo(
          `Removed "${truncated}"`,
          () => { this.updateProductSelection(removedItem.stepIndex, removedItem.selectionId, removedItem.quantity); },
          5000
        );
      });
    }

    list.appendChild(li);
  });

  panel.appendChild(list);
  return panel;
},

// Creates the always-visible footer bar
_createFooterBar(allSelectedProducts, totalQuantity, totalRequired, totalPrice, finalPrice, discountInfo, currencyInfo, isLastStep) {
  const bar = document.createElement('div');
  bar.className = 'footer-bar';

  // ── Left: Thumbnail strip (standalone, circular) ──
  const thumbStrip = document.createElement('div');
  thumbStrip.className = 'footer-thumbstrip';
  const maxThumbs = 3;
  allSelectedProducts.slice(0, maxThumbs).forEach(item => {
    const img = document.createElement('img');
    img.src = this._getSelectedProductImageSrc(item) || BUNDLE_WIDGET.PLACEHOLDER_IMAGE;
    img.alt = item.title || '';
    img.className = 'footer-thumbstrip-img';
    thumbStrip.appendChild(img);
  });
  if (allSelectedProducts.length > maxThumbs) {
    const overflow = document.createElement('span');
    overflow.className = 'footer-thumbstrip-overflow';
    overflow.textContent = `+${allSelectedProducts.length - maxThumbs}`;
    thumbStrip.appendChild(overflow);
  }

  // ── Centre: Toggle (row 1) + Total + discount badge (row 2) ──
  const centreCol = document.createElement('div');
  centreCol.className = 'footer-centre';

  // Row 1 — toggle
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'footer-toggle';
  toggleBtn.setAttribute('type', 'button');
  const hasConditions = !this.bundleHasNoConditions();
  const totalSelected = allSelectedProducts.length;
  const toggleText = hasConditions
    ? `${totalQuantity}/${totalRequired} Steps`
    : `${totalSelected} Product${totalSelected !== 1 ? 's' : ''}`;
  toggleBtn.innerHTML = `
    <span class="footer-toggle-text">${toggleText}</span>
    <svg class="footer-chevron" viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M5 8l5 5 5-5"/>
    </svg>
  `;
  toggleBtn.addEventListener('click', () => {
    this.elements.footer.classList.toggle('is-open');
  });

  // Row 2 — Total + discount badge
  const totalArea = document.createElement('div');
  totalArea.className = 'footer-total-area';

  let discountBadgeHTML = '';
  if (discountInfo.hasDiscount && totalPrice > 0 && finalPrice < totalPrice) {
    const discountPct = Math.round((1 - finalPrice / totalPrice) * 100);
    if (discountPct > 0) {
      discountBadgeHTML = `<span class="footer-discount-badge">${discountPct}% OFF</span>`;
    }
  }
  totalArea.innerHTML = `
    <span class="footer-total-label">Total:</span>
    <div class="footer-total-prices">
      ${discountInfo.hasDiscount && finalPrice < totalPrice ? `<span class="footer-total-original">${CurrencyManager.convertAndFormat(totalPrice, currencyInfo)}</span>` : ''}
      <span class="footer-total-final">${CurrencyManager.convertAndFormat(finalPrice, currencyInfo)}</span>
      ${discountBadgeHTML}
    </div>
  `;

  centreCol.appendChild(toggleBtn);
  centreCol.appendChild(totalArea);

  // ── Right: CTA button ──
  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'footer-cta-btn';
  ctaBtn.setAttribute('type', 'button');
  const conditionless = this.bundleHasNoConditions();
  ctaBtn.textContent = (conditionless || isLastStep) ? this._resolveText('addToCartButton', this.config.addToCartText || 'Add to Cart') : this._resolveText('nextButton', 'Next');
  if (conditionless ? !this.canCheckoutWithBoxSelection() : (isLastStep ? (!this.areBundleConditionsMet() || !this.canCheckoutWithBoxSelection()) : !this.canProceedToNextStep())) {
    ctaBtn.disabled = true;
  }
  ctaBtn.addEventListener('click', () => {
    if (conditionless || isLastStep) {
      if (!this.canCheckoutWithBoxSelection()) {
        this.showBoxSelectionValidationMessage();
        return;
      }
      this.addBundleToCart();
    } else if (this.canProceedToNextStep()) {
      this.activeCollectionId = null;
      this.searchQuery = '';
      this.currentStepIndex++;
      this.renderFullPageLayout();
    } else {
      ToastManager.show(this.getStepConditionValidationMessage?.() || 'Please meet the quantity conditions for the current step before proceeding.');
    }
  });

  bar.appendChild(thumbStrip);
  bar.appendChild(centreCol);
  bar.appendChild(ctaBtn);
  return bar;
},

// Helper: Truncate title for compact display
truncateTitle(title, maxLength) {
  if (!title) return '';
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength) + '...';
},

// Helper: Get all selected products data for footer display
getAllSelectedProductsData() {
  const allProducts = [];

  this.selectedBundle.steps.forEach((step, stepIndex) => {
    const stepSelections = this.selectedProducts[stepIndex] || {};
    const productsInStep = this.stepProductData[stepIndex] || [];

    Object.entries(stepSelections).forEach(([variantId, quantity]) => {
      if (quantity > 0) {
        // Find product in processed stepProductData using the canonical selection id.
        let product = findProductBySelectionId(productsInStep, variantId);
        let matchedVariant = null;
        if (!product) {
          for (const p of productsInStep) {
            const variant = findVariantBySelectionId(p, variantId);
            if (!variant) continue;
            product = p;
            matchedVariant = variant;
            break;
          }
        } else {
          matchedVariant = findVariantBySelectionId(product, variantId);
        }

        if (product) {
          // Build variant title
          let variantTitle = '';
          if (matchedVariant && matchedVariant.title && matchedVariant.title !== 'Default Title') {
            variantTitle = matchedVariant.title;
          } else if (product.variantTitle && product.variantTitle !== 'Default Title') {
            variantTitle = product.variantTitle;
          }

          const imageUrl = matchedVariant
            ? (matchedVariant.image?.src || matchedVariant.image || product.imageUrl || product.image?.src || '')
            : (product.imageUrl || product.image?.src || '');

          const price = matchedVariant
            ? (typeof matchedVariant.price === 'number' ? matchedVariant.price : (parseFloat(matchedVariant.price || '0') * 100))
            : (product.price || 0);
          const selectionId = String(variantId || '');

          allProducts.push({
            stepIndex,
            selectionId,
            variantId: selectionId,
            quantity,
            title: matchedVariant
              ? (variantTitle ? `${product.title} - ${variantTitle}` : product.title)
              : (product.title || 'Untitled Product'),
            parentTitle: product.parentTitle || product.title || 'Untitled Product',
            variantTitle: variantTitle,
            imageUrl: imageUrl,
            image: imageUrl,
            price: price,
            isDefault: step.isDefault ?? false,
            isFreeGift: step.isFreeGift ?? false,
            addonDisplayFree: step.addonDisplayFree === true,
          });
        } else {
        }
      }
    });
  });

  return allProducts;
},


groupVariantsByProduct(selectedProducts) {
  const productMap = new Map();

  selectedProducts.forEach(item => {
    const canonicalVariantId = getSelectionId(item);
    if (!canonicalVariantId) return;

    const product = this.stepProductData[item.stepIndex]?.find(p =>
      getSelectionId(p) === canonicalVariantId
    );

    if (!product) return;

    const productId = getSelectionId(product);
    if (!productId) return;
    const key = `${item.stepIndex}-${productId}`;

    if (!productMap.has(key)) {
      productMap.set(key, {
        productId,
        stepIndex: item.stepIndex,
        title: product.title || item.title,
        image: product.imageUrl || product.image?.src || item.image,
        variants: [],
        totalQuantity: 0,
        totalPrice: 0
      });
    }

    const group = productMap.get(key);
    group.variants.push(item);
    group.totalQuantity += item.quantity;
    group.totalPrice += (item.price * item.quantity);
  });

  return Array.from(productMap.values());
},

/**
 * Show variant breakdown popup for a product with multiple variants
 * @param {Object} productGroup - Product group with multiple variants
 */
showVariantBreakdown(productGroup) {
  const overlay = document.createElement('div');
  overlay.className = "variant-breakdown-overlay";

  const popup = document.createElement('div');
  popup.className = "variant-breakdown-popup";

  // Get variant details
  const currencyInfo = CurrencyManager.getCurrencyInfo();
  const variantsHtml = productGroup.variants.map(variant => {
    const variantSelectionId = getSelectionId(variant);
    const product = this.stepProductData[variant.stepIndex]?.find(p =>
      getSelectionId(p) === variantSelectionId
    );
    const variantObj = product ? findVariantBySelectionId(product, variantSelectionId) : null;
    const variantTitle = variantObj?.title || variant.title || "Variant";
    const removeVariantId = String(variantSelectionId || '');

    return `
      <div class="variant-breakdown-item">
        <img src="${variant.image}" alt="${variantTitle}" />
        <div class="variant-info">
          <span class="variant-title">${variantTitle}</span>
          <span class="variant-quantity">Qty: ${variant.quantity} × ${CurrencyManager.convertAndFormat(variant.price, currencyInfo)}</span>
        </div>
        <button class="remove-variant-btn" data-step="${variant.stepIndex}" data-variant-id="${removeVariantId}">Remove</button>
      </div>
    `;
  }).join('');

  popup.innerHTML = `
    <div class="variant-breakdown-header">
      <h3>${productGroup.title}</h3>
      <button class="close-breakdown-btn">&times;</button>
    </div>
    <div class="variant-breakdown-list">
      ${variantsHtml}
    </div>
    <button class="add-another-variant-btn">+ Add Another Variant</button>
  `;

  // Event handlers
  popup.querySelector('.close-breakdown-btn').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  popup.querySelectorAll('.remove-variant-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const stepIndex = parseInt(e.target.dataset.step, 10);
      const variantId = String(e.target.dataset.variantId || '');
      if (!Number.isFinite(stepIndex) || !variantId) return;
      this.updateProductSelection(stepIndex, variantId, 0);
      document.body.removeChild(overlay);
      this.reRenderFullPage();
    });
  });

  popup.querySelector('.add-another-variant-btn').addEventListener('click', () => {
    document.body.removeChild(overlay);
    // Find the product and open modal for it
    const product = this.stepProductData[productGroup.stepIndex]?.find(p =>
      getSelectionId(p) === getSelectionId(productGroup)
    );
    const step = this.selectedBundle.steps[productGroup.stepIndex];
    if (product && step && this.productModal) {
      this.productModal.open(product, step);
    }
  });

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) document.body.removeChild(overlay);
  });
},
// Helper: Find product by variant ID in a step
findProductByVariantId(step, variantId) {
  const normalizedVariantId = String(variantId || '');
  return step.products?.find(p =>
    getSelectionId(p) === normalizedVariantId
  );
},

// Helper: Check if step is completed (delegates to ConditionValidator)
isStepCompleted(stepIndex) {
  const step = this.selectedBundle.steps[stepIndex];
  const stepSelections = this.selectedProducts[stepIndex] || {};
  if (typeof this.validateStep === 'function') {
    return this.validateStep(stepIndex);
  }

  return ConditionValidator.isStepConditionSatisfied(step, stepSelections);
},

// Helper: Check if can proceed to next step
// Layout-aware re-render dispatch for full-page bundles
reRenderFullPage() {
  const layout = this.resolveFullPageLayout();
  if (layout === 'footer_side') {
    return this.renderFullPageLayoutWithSidebar();
  } else {
    return this.renderFullPageLayout();
  }
},

// Sidebar-only surgical step advance: updates the product grid and tabs in-place
// without tearing down the entire two-column DOM structure. Prevents the layout
// shift that occurs when reRenderFullPage() destroys and rebuilds everything.
};
