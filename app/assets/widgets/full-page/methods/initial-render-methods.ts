import { FullPagePreset } from '../../shared/full-page-preset.js';

export function getEnabledFullPageSteps(steps) {
  if (!Array.isArray(steps)) return [];
  return steps.filter(step => step?.enabled !== false);
}

function resolveCompareAtPrice(product) {
  const rawCompareAtPrice = product?.compareAtPrice;
  const rawCompareAtPriceAlt = product?.compare_at_price;

  const compareAtPrice = rawCompareAtPrice ?? rawCompareAtPriceAlt;
  if (compareAtPrice == null) return null;
  if (typeof compareAtPrice === 'object' && compareAtPrice !== null && typeof compareAtPrice?.amount !== 'undefined') {
    return compareAtPrice.amount;
  }

  return compareAtPrice;
}

export const fullPageInitialRenderMethods: Record<string, any> & ThisType<any> = {
shouldRenderFullPageStepChrome() {
  return Array.isArray(this.selectedBundle?.steps)
    && this.selectedBundle.steps.length > 1;
},

updateMessagesFromBundle() {
  // Product-page bundles (metafield path) expose a top-level `messaging` object with
  // camelCase keys (progressTemplate / successTemplate).
  // Full-page bundles (API path) expose messages inside `pricing.messages` with
  // snake-style keys (progress / qualified). Try both shapes.
  const messaging = this.selectedBundle?.messaging;
  const pricingMessages = this.selectedBundle?.pricing?.messages;
  const pricingDisplay = this.selectedBundle?.pricing?.display;
  const displayOptions = messaging?.displayOptions || this.selectedBundle?.pricing?.displayOptions || {};
  const progressBarOptions = displayOptions?.progressBar || {};

  if (messaging) {
    if (messaging.progressTemplate) {
      this.config.discountTextTemplate = messaging.progressTemplate;
    }
    if (messaging.successTemplate) {
      this.config.successMessageTemplate = messaging.successTemplate;
    }

    this.config.showDiscountMessaging = messaging.showDiscountMessaging !== false;
    this.config.showDiscountProgressBar = progressBarOptions.enabled === true || messaging.showDiscountProgressBar === true;

  } else if (pricingMessages) {
    // Full-page bundle API path: templates live in ruleMessages (first rule = global template).
    // When ruleMessagesByLocale is present, prefer the locale-specific messages.
    const shopLocale = window.Shopify?.locale;
    const byLocale = pricingMessages.ruleMessagesByLocale;
    const localeRuleMessages = shopLocale && byLocale?.[shopLocale];
    const ruleMessages = localeRuleMessages || pricingMessages.ruleMessages;
    const firstRuleMsg = ruleMessages && Object.values(ruleMessages)[0];
    if (firstRuleMsg?.discountText) {
      this.config.discountTextTemplate = firstRuleMsg.discountText;
    }
    if (firstRuleMsg?.successMessage) {
      this.config.successMessageTemplate = firstRuleMsg.successMessage;
    }

    this.config.showDiscountMessaging = pricingMessages.showDiscountMessaging === false
      ? false
      : this.selectedBundle?.pricing?.enabled || false;
    this.config.showDiscountProgressBar =
      progressBarOptions.enabled === true ||
      pricingMessages.showDiscountProgressBar === true ||
      pricingDisplay?.showDiscountProgressBar === true;

  } else {
    this.config.showDiscountMessaging = this.selectedBundle?.pricing?.enabled || false;
    this.config.showDiscountProgressBar = pricingDisplay?.showDiscountProgressBar === true;
  }

  this.config.discountProgressBarType = progressBarOptions.type === 'simple' ? 'simple' : 'step_based';
  this.config.discountProgressTextTemplate = progressBarOptions.progressText || this.config.discountTextTemplate;
  this.config.discountProgressSuccessTemplate = progressBarOptions.successText || this.config.successMessageTemplate;
},

applyPersonalizationAddonProducts() {
  const addonStep = this.buildAddonStepFromPersonalization();
  this.selectedBundle.steps = getEnabledFullPageSteps(this.selectedBundle.steps)
    .filter(step => !step.isFreeGift);
  if (addonStep) {
    this.selectedBundle.steps = [...this.selectedBundle.steps, addonStep];
  }
},

buildAddonStepFromPersonalization() {
  const personalizationData = this.selectedBundle?.personalizationData;
  const addonProducts = personalizationData?.addonProducts;
  if (personalizationData?.isPersonalizationEnabled !== true) {
    return null;
  }

  const addonProductsEnabled = addonProducts?.isEnabled === true;
  const tiers = addonProductsEnabled && Array.isArray(addonProducts.tiers) ? addonProducts.tiers : [];
  const selectedAddonProducts = tiers.flatMap(tier =>
    Array.isArray(tier?.selectedAddonProducts)
      ? tier.selectedAddonProducts.map(product => this.normalizePersonalizationAddonProduct(product))
      : []
  );

  return {
    id: 'personalization-addons',
    name: personalizationData.personalizeStepText || addonProducts?.title || '',
    position: (this.selectedBundle?.steps?.length || 0) + 1,
    minQuantity: 0,
    maxQuantity: selectedAddonProducts.length,
    enabled: true,
    isFreeGift: true,
    addonLabel: personalizationData.personalizeStepText || addonProducts?.title || '',
    freeGiftName: addonProducts?.title || personalizationData.personalizeStepText || '',
    addonTitle: personalizationData.personalizePageSubtext || addonProducts?.title || '',
    addonIconUrl: personalizationData.stepImage || null,
    addonDisplayFree: false,
    addonProductsEnabled,
    addonUnlockAfterCompletion: true,
    addonTiers: addonProductsEnabled ? tiers : undefined,
    addonEligibilityCondition: null,
    addonDiscount: null,
    addonMessaging: addonProductsEnabled ? (addonProducts.addonsMessaging || null) : null,
    displayVariantsAsIndividual: false,
    StepProduct: selectedAddonProducts,
    products: selectedAddonProducts,
    collections: [],
  };
},

normalizePersonalizationAddonProduct(product) {
  const productGid = product?.graphqlId || product?.id || (product?.productId ? `gid://shopify/Product/${product.productId}` : '');
  const imageUrl = product?.images?.[0]?.originalSrc
    || product?.images?.[0]?.url
    || product?.image?.src
    || product?.imageUrl
    || '';
  const variants = Array.isArray(product?.variants) ? product.variants : [];

  return {
    productId: productGid,
    id: productGid,
    selectionId: productGid,
    title: product?.title || '',
    handle: product?.handle || '',
    imageUrl,
    price: variants[0]?.price || product?.price || '0',
    compareAtPrice: resolveCompareAtPrice(variants[0]) || null,
    variants: variants.map(variant => {
      const variantGid = variant.variantGraphqlId || variant.id || (variant.variantId ? `gid://shopify/ProductVariant/${variant.variantId}` : productGid);
      return {
        variantId: variantGid,
        id: variantGid,
        selectionId: variantGid,
        title: variant.variantTitle || variant.title || 'Default Title',
        price: variant.price || '0',
        compareAtPrice: resolveCompareAtPrice(variant) || null,
        available: variant.available !== false,
        quantityAvailable: typeof variant.inventoryQuantity === 'number' ? variant.inventoryQuantity : null,
        currentlyNotInStock: false,
        image: imageUrl ? { src: imageUrl } : null,
      };
    }),
  };
},

initializeDataStructures() {
  const stepsCount = this.selectedBundle.steps.length;

  // Initialize selected products array (one object per step)
  this.selectedProducts = Array(stepsCount).fill(null).map(() => ({}));

  // Pre-populate default products (mandatory items like Gift Box)
  this._initDefaultProducts();
  this._initDirectDefaultProducts();
  this._initializeFpbUpsellHandoff?.();

  // Initialize step product data cache
  this.stepProductData = Array(stepsCount).fill(null).map(() => ([]));
},

// ========================================================================
// DOM SETUP
// ========================================================================

setupDOMElements() {
  this.elements = {
    stepsContainer: this.container.querySelector('.bundle-steps') || this.createStepsContainer(),
    modal: this.ensureModal()
  };

  if (!this.container.querySelector('.bundle-steps')) {
    this.container.appendChild(this.elements.stepsContainer);
  }
},

createStepsContainer() {
  const container = document.createElement('div');
  container.className = 'bundle-steps';
  return container;
},

ensureModal() {
  let modal = document.getElementById('bundle-builder-modal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'bundle-builder-modal';
    modal.className = 'bundle-builder-modal';
    modal.hidden = true;
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-step-title"></div>
          <div class="modal-tabs-wrapper">
            <button class="tab-arrow tab-arrow-left" aria-label="Scroll tabs left">&lsaquo;</button>
            <div class="modal-tabs"></div>
            <button class="tab-arrow tab-arrow-right" aria-label="Scroll tabs right">&rsaquo;</button>
          </div>
          <span class="close-button">&times;</span>
        </div>
        <div class="modal-body">
          <div class="product-grid"></div>
        </div>
        <div class="modal-footer">
          <!-- Centered Grouped Content Container -->
          <div class="modal-footer-grouped-content">
            <!-- Total Pill - Sits Above Buttons -->
            <div class="modal-footer-total-pill" data-wpb-discount-feedback-pill>
              <span class="total-price-strike"></span>
              <span class="total-price-final"></span>
              <span class="price-cart-separator">|</span>
              <span class="cart-badge-wrapper">
                <span class="cart-badge-count">0</span>
                <svg class="cart-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1" fill="currentColor" stroke="none"/>
                  <circle cx="20" cy="21" r="1" fill="currentColor" stroke="none"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </span>
            </div>

            <!-- Buttons Row - Below Pill -->
            <div class="modal-footer-buttons-row">
              <button class="modal-nav-button prev-button">BACK</button>
              <button class="modal-nav-button next-button">NEXT</button>
            </div>

            <!-- Discount Messaging Section -->
            <div class="modal-footer-discount-messaging">
              <div class="footer-discount-text"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Setup tab scroll arrows
    this.setupTabScrollArrows(modal);
  }

  return modal;
},

setupTabScrollArrows(modal) {
  const tabsContainer = modal.querySelector('.modal-tabs');
  const leftArrow = modal.querySelector('.tab-arrow-left');
  const rightArrow = modal.querySelector('.tab-arrow-right');

  if (!tabsContainer || !leftArrow || !rightArrow) return;

  const scrollAmount = 200;

  // Left arrow click
  leftArrow.addEventListener('click', () => {
    tabsContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  // Right arrow click
  rightArrow.addEventListener('click', () => {
    tabsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  // Update arrow visibility based on scroll position
  const updateArrowVisibility = () => {
    const { scrollLeft, scrollWidth, clientWidth } = tabsContainer;

    leftArrow.hidden = scrollLeft <= 0;
    rightArrow.hidden = scrollLeft + clientWidth >= scrollWidth - 1;
  };

  // Listen to scroll events
  tabsContainer.addEventListener('scroll', updateArrowVisibility);

  // Initial check
  setTimeout(updateArrowVisibility, 100);

  // Store for later updates
  this.updateTabArrows = updateArrowVisibility;
},
//========================================================================
// UI RENDERING
// ========================================================================

async renderUI() {
  await this.renderSteps();
},

async renderSteps() {
  // Clear existing steps
  this.elements.stepsContainer.innerHTML = '';

  if (!this.selectedBundle || !this.selectedBundle.steps) {
    return;
  }

  FullPagePreset.markContainer(this.container, this.selectedBundle);
  await this.renderFullPageLayout();
},
};
