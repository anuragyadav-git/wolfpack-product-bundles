import { FullPagePreset } from '../../shared/full-page-preset.js';
import { createCartIcon } from '../../shared/svg-icons.js';

function createFullPagePickerModal(runtimeDocument: Document) {
  const modal = runtimeDocument.createElement('div');
  modal.id = 'bundle-builder-modal';
  modal.className = 'bundle-builder-modal';
  modal.hidden = true;
  const overlay = runtimeDocument.createElement('div');
  overlay.className = 'modal-overlay';
  const content = runtimeDocument.createElement('div');
  content.className = 'modal-content';
  const header = runtimeDocument.createElement('div');
  header.className = 'modal-header';
  const stepTitle = runtimeDocument.createElement('div');
  stepTitle.className = 'modal-step-title';
  const tabsWrapper = runtimeDocument.createElement('div');
  tabsWrapper.className = 'modal-tabs-wrapper';
  const left = runtimeDocument.createElement('button');
  left.className = 'tab-arrow tab-arrow-left';
  left.setAttribute('aria-label', 'Scroll tabs left');
  left.textContent = '‹';
  const tabs = runtimeDocument.createElement('div');
  tabs.className = 'modal-tabs';
  const right = runtimeDocument.createElement('button');
  right.className = 'tab-arrow tab-arrow-right';
  right.setAttribute('aria-label', 'Scroll tabs right');
  right.textContent = '›';
  tabsWrapper.append(left, tabs, right);
  const close = runtimeDocument.createElement('span');
  close.className = 'close-button';
  close.textContent = '×';
  header.append(stepTitle, tabsWrapper, close);
  const body = runtimeDocument.createElement('div');
  body.className = 'modal-body';
  const grid = runtimeDocument.createElement('div');
  grid.className = 'product-grid';
  body.appendChild(grid);
  const footer = runtimeDocument.createElement('div');
  footer.className = 'modal-footer';
  const grouped = runtimeDocument.createElement('div');
  grouped.className = 'modal-footer-grouped-content';
  const totalPill = runtimeDocument.createElement('div');
  totalPill.className = 'modal-footer-total-pill';
  totalPill.setAttribute('data-wpb-discount-feedback-pill', '');
  const strike = runtimeDocument.createElement('span');
  strike.className = 'total-price-strike';
  const final = runtimeDocument.createElement('span');
  final.className = 'total-price-final';
  const separator = runtimeDocument.createElement('span');
  separator.className = 'price-cart-separator';
  separator.textContent = '|';
  const cartWrapper = runtimeDocument.createElement('span');
  cartWrapper.className = 'cart-badge-wrapper';
  const count = runtimeDocument.createElement('span');
  count.className = 'cart-badge-count';
  count.textContent = '0';
  const cartIcon = createCartIcon(runtimeDocument);
  cartIcon.classList.add('cart-icon');
  cartWrapper.append(count, cartIcon);
  totalPill.append(strike, final, separator, cartWrapper);
  const buttons = runtimeDocument.createElement('div');
  buttons.className = 'modal-footer-buttons-row';
  const previous = runtimeDocument.createElement('button');
  previous.className = 'modal-nav-button prev-button';
  previous.textContent = 'BACK';
  const next = runtimeDocument.createElement('button');
  next.className = 'modal-nav-button next-button';
  next.textContent = 'NEXT';
  buttons.append(previous, next);
  const messaging = runtimeDocument.createElement('div');
  messaging.className = 'modal-footer-discount-messaging';
  const message = runtimeDocument.createElement('div');
  message.className = 'footer-discount-text';
  messaging.appendChild(message);
  grouped.append(totalPill, buttons, messaging);
  footer.appendChild(grouped);
  content.append(header, body, footer);
  modal.append(overlay, content);
  return modal;
}

export function getEnabledFullPageSteps(steps: any[]) {
  if (!Array.isArray(steps)) return [];
  return steps.filter(step => step?.enabled !== false);
}

function resolveCompareAtPrice(product: any) {
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
  const selectedAddonProducts = tiers.flatMap((tier: any)  =>
    Array.isArray(tier?.selectedAddonProducts)
      ? tier.selectedAddonProducts.map((product: any)  => this.normalizePersonalizationAddonProduct(product))
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

normalizePersonalizationAddonProduct(product: any) {
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
    variants: variants.map((variant: any)  => {
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
    modal = createFullPagePickerModal(document);

    document.body.appendChild(modal);

    // Setup tab scroll arrows
    this.setupTabScrollArrows(modal);
  }

  return modal;
},

setupTabScrollArrows(modal: any) {
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
  this.elements.stepsContainer.replaceChildren();

  if (!this.selectedBundle || !this.selectedBundle.steps) {
    return;
  }

  FullPagePreset.markContainer(this.container, this.selectedBundle);
  await this.renderFullPageLayout();
},
};
