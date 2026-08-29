
import { createCartIcon, createChevronIcon, createCloseIcon } from '../../shared/svg-icons.js';

function createProductPageBottomSheet(runtimeDocument: Document) {
  const panel = runtimeDocument.createElement('div');
  panel.id = 'bundle-builder-modal';
  panel.className = 'bw-bs-panel bundle-builder-modal';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'bundle-picker-title');
  panel.dataset.ppbDrawerSurface = 'bundle-picker';
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('inert', '');
  panel.hidden = true;

  const header = runtimeDocument.createElement('div');
  header.className = 'modal-header bw-bs-header';
  const desktopClose = runtimeDocument.createElement('button');
  desktopClose.className = 'close-button bw-bs-close-desktop';
  desktopClose.setAttribute('aria-label', 'Close');
  desktopClose.appendChild(createCloseIcon(runtimeDocument));
  const mobileClose = runtimeDocument.createElement('button');
  mobileClose.className = 'close-button bw-bs-close-mobile';
  mobileClose.setAttribute('aria-label', 'Close');
  mobileClose.appendChild(createChevronIcon(runtimeDocument, 'down'));
  const tabsWrapper = runtimeDocument.createElement('div');
  tabsWrapper.className = 'modal-tabs-wrapper bw-bs-tabs-wrapper';
  const tabs = runtimeDocument.createElement('div');
  tabs.className = 'modal-tabs bw-bs-tabs';
  tabsWrapper.appendChild(tabs);
  const title = runtimeDocument.createElement('div');
  title.id = 'bundle-picker-title';
  title.className = 'modal-step-title bw-bs-choose-title';
  const categories = runtimeDocument.createElement('div');
  categories.className = 'bw-bs-category-tabs';
  categories.hidden = true;
  const discount = runtimeDocument.createElement('div');
  discount.className = 'bw-bs-discount-bar footer-discount-text';
  header.append(desktopClose, mobileClose, tabsWrapper, title, categories, discount);

  const body = runtimeDocument.createElement('div');
  body.className = 'modal-body bw-bs-body';
  const contentTitle = runtimeDocument.createElement('h2');
  contentTitle.className = 'bw-ppb-step-content-title bw-ppb-step-content-title--picker';
  contentTitle.hidden = true;
  const grid = runtimeDocument.createElement('div');
  grid.className = 'product-grid bw-bs-product-grid';
  body.append(contentTitle, grid);

  const footer = runtimeDocument.createElement('div');
  footer.className = 'modal-footer bw-bs-footer';
  const cartPill = runtimeDocument.createElement('div');
  cartPill.className = 'bw-bs-cart-pill';
  cartPill.setAttribute('data-wpb-discount-feedback-pill', '');
  cartPill.setAttribute('role', 'status');
  cartPill.setAttribute('aria-live', 'polite');
  const cartItems = runtimeDocument.createElement('span');
  cartItems.className = 'bw-bs-cart-items';
  const cartIcon = createCartIcon(runtimeDocument);
  cartIcon.classList.add('bw-bs-cart-icon');
  const count = runtimeDocument.createElement('span');
  count.className = 'cart-badge-count';
  count.textContent = '0';
  cartItems.append(cartIcon, count);
  const divider = runtimeDocument.createElement('span');
  divider.className = 'bw-bs-cart-divider';
  divider.setAttribute('aria-hidden', 'true');
  const cartPrice = runtimeDocument.createElement('span');
  cartPrice.className = 'bw-bs-cart-price';
  const final = runtimeDocument.createElement('span');
  final.className = 'total-price-final';
  final.textContent = '$0.00';
  const strike = runtimeDocument.createElement('span');
  strike.className = 'total-price-strike';
  cartPrice.append(final, strike);
  cartPill.append(cartItems, divider, cartPrice);
  const navigation = runtimeDocument.createElement('div');
  navigation.className = 'bw-bs-nav-pill';
  const previous = runtimeDocument.createElement('button');
  previous.className = 'modal-nav-button prev-button bw-bs-nav-btn';
  previous.setAttribute('aria-label', 'Previous step');
  previous.textContent = 'Prev';
  const next = runtimeDocument.createElement('button');
  next.className = 'modal-nav-button next-button bw-bs-nav-btn';
  next.setAttribute('aria-label', 'Next step');
  next.append(runtimeDocument.createTextNode('Next '), createChevronIcon(runtimeDocument, 'right'));
  navigation.append(previous, next);
  footer.append(cartPill, navigation);
  panel.append(header, body, footer);
  return panel;
}

export const ProductPageDomMethods: Record<string, any> & ThisType<any> = {
showThemeEditorPreview(bundleId: any) {
  const preview = document.createElement('div');
  preview.className = 'bw-theme-editor-preview';
  const icon = document.createElement('div');
  icon.className = 'bw-theme-editor-preview__icon';
  icon.textContent = '📦';
  const title = document.createElement('h3');
  title.className = 'bw-theme-editor-preview__title';
  title.textContent = 'Bundle Widget Preview';
  const bundle = document.createElement('p');
  bundle.className = 'bw-theme-editor-preview__bundle';
  bundle.append(document.createTextNode('Bundle ID: '));
  const code = document.createElement('code');
  code.textContent = String(bundleId ?? '');
  bundle.append(code);
  const status = document.createElement('div');
  status.className = 'bw-theme-editor-preview__status';
  const statusTitle = document.createElement('div');
  statusTitle.className = 'bw-theme-editor-preview__status-title';
  statusTitle.textContent = '✅ Widget Configured Successfully';
  const statusCopy = document.createElement('div');
  statusCopy.textContent = 'This widget will automatically display on bundle container products.';
  const instructions = document.createElement('strong');
  instructions.textContent = 'To see it in action:';
  const list = document.createElement('ol');
  ['Save your theme', 'Navigate to a bundle product page', 'The widget will appear with product selection steps']
    .forEach((text) => {
      const item = document.createElement('li');
      item.textContent = text;
      list.append(item);
    });
  status.append(statusTitle, statusCopy, instructions, list);
  const tip = document.createElement('div');
  tip.className = 'bw-theme-editor-preview__tip';
  tip.textContent = "💡 Tip: You're currently previewing on a regular product. The widget only activates on products configured as bundle containers.";
  preview.append(icon, title, bundle, status, tip);
  this.container.replaceChildren(preview);
},

// ========================================================================
// DOM SETUP
// ========================================================================

_relocateContainerToProductForm() {
  try {
    if (!this.container || typeof document === 'undefined') return;
    if (this.container.dataset.mountedAfterProductForm === 'true') return;

    const productForm = this._findNativeProductForm();

    if (!productForm) return;

    if (productForm.nextElementSibling !== this.container) {
      productForm.insertAdjacentElement('afterend', this.container);
    }

    this.container.classList.add('bundle-widget-container--product-form-mounted');
    this.container.dataset.mountedAfterProductForm = 'true';
  } catch (_error: any) {
    // Placement is best-effort; the widget still renders at its original block location.
  }
},

_findNativeProductForm() {
  if (typeof document === 'undefined') return null;

  const selectors: any[] = [
    'form[action*="/cart/add"]',
    'product-form form',
    '.product-form form',
    '[data-type="add-to-cart-form"]',
    'form[action^="/cart/add"]'
  ];

  return selectors
    .map(selector => document.querySelector(selector))
    .find(form => form && !form.contains(this.container) && !this.container.contains(form)) || null;
},

_getNativeProductInfoRoot(productForm: any) {
  return productForm?.closest?.(
    '[id^="ProductInformation-"], .product-details, .group-block-content, .product-information, .product__info-container, .product__info-wrapper, .product__info, product-info, .product'
  ) || productForm?.parentElement || null;
},

_hideNativeProductPrice() {
  try {
    if (!this.container || typeof document === 'undefined') return;

    const customSelector = String(
      this._getProductPageControls?.()?.selectors?.productPagePrice || '',
    ).trim();
    if (customSelector) {
      const configuredPrice = document.querySelector(customSelector);
      if (configuredPrice && !this.container.contains(configuredPrice)) {
        this._nativeProductPriceElement = configuredPrice;
      }
      return;
    }

    const productForm = this._findNativeProductForm();
    if (!productForm) return;

    const root = this._getNativeProductInfoRoot(productForm);
    if (!root) return;

    const selectors: any[] = [
      '[id^="price-"]',
      '.price.price--large',
      '.product__price',
      '[data-product-price]',
      '.product-price',
      '.price'
    ];

    const priceElements = selectors.flatMap(selector => Array.from(root.querySelectorAll(selector)));
    const uniquePriceElements = Array.from(new Set(priceElements)) as HTMLElement[];

    uniquePriceElements
      .filter(element => !this.container.contains(element))
      .filter(element => !element.closest('#bundle-builder-modal'))
      .forEach(element => {
        element.classList.add('wpb-native-product-price--hidden');
        element.setAttribute('data-wpb-native-product-price-hidden', 'true');
        element.style.setProperty('display', 'none', 'important');
      });
  } catch (_error: any) {
    // Native theme price hiding is best-effort; PPB controls still render if selectors differ.
  }
},

_updateNativeProductPrice(finalPriceText: any, compareAtPriceText: any, hasSelection: any) {
  const price = this._nativeProductPriceElement;
  if (!price) return;
  price.hidden = !hasSelection;
  if (!hasSelection) {
    price.replaceChildren();
    return;
  }
  const finalText = String(finalPriceText || '');
  const compareText = compareAtPriceText && compareAtPriceText !== finalPriceText
    ? String(compareAtPriceText)
    : '';
  const finalPrice = document.createElement('span');
  finalPrice.textContent = finalText;
  price.replaceChildren(finalPrice);
  if (compareText) {
    const comparePrice = document.createElement('s');
    comparePrice.textContent = compareText;
    price.append(document.createTextNode(' '), comparePrice);
  }
},

_hideNativeDynamicCheckoutControls() {
  try {
    if (!this.container || typeof document === 'undefined') return;

    const productForm = this._findNativeProductForm();
    if (!productForm) return;

    const root = this._getNativeProductInfoRoot(productForm);
    if (!root) return;

    const selectors: any[] = [
      '.shopify-payment-button',
      '.shopify-payment-button__button',
      'shopify-accelerated-checkout',
      'shopify-buy-it-now-button',
    ];

    const controls = selectors.flatMap(selector => Array.from(root.querySelectorAll(selector)));
    const uniqueControls = Array.from(new Set(controls)) as HTMLElement[];

    uniqueControls
      .filter(element => !this.container.contains(element))
      .filter(element => !element.closest('#bundle-builder-modal'))
      .forEach(element => {
        element.classList.add('wpb-native-dynamic-checkout--hidden');
        element.setAttribute('data-wpb-native-dynamic-checkout-hidden', 'true');
        element.style.setProperty('display', 'none', 'important');
      });
  } catch (_error: any) {
    // Native dynamic-checkout hiding is best-effort; PPB renders its own non-mutating visual surface.
  }
},

setupDOMElements() {
  const modalEl = this.ensureBottomSheet();
  const purchaseOptionsMount = this.container.querySelector('[data-wpb-purchase-options-mount="ppb"]')
    || document.createElement('div');
  purchaseOptionsMount.setAttribute('data-wpb-purchase-options-mount', 'ppb');

  // Get or create main UI elements
  this.elements = {
    defaultProducts: this.container.querySelector('.bw-default-products') || this._createDirectDefaultProductsEl(),
    stepsContainer: this.container.querySelector('.bundle-steps') || this.createStepsContainer(),
    qtyPillsEl: this.container.querySelector('.bw-qty-pills') || this._createQtyPillsEl(),
    purchaseOptionsMount,
    footer: this.container.querySelector('.bundle-footer-messaging') || this.createFooter(),
    addToCartButton: this.container.querySelector('.add-bundle-to-cart') || this.createAddToCartButton(),
    dynamicCheckoutVisual: this.container.querySelector('.bw-ppb-dynamic-checkout-visual') || this._createDynamicCheckoutVisual(),
    modal: modalEl,
    bsOverlay: document.getElementById('bw-bs-overlay') || this._createBottomSheetOverlay()
  };

  // Append elements in display order (default products → steps → qty pills → footer → ATC)
  if (!this.container.querySelector('.bw-default-products')) {
    this.container.appendChild(this.elements.defaultProducts);
  }
  if (!this.container.querySelector('.bundle-steps')) {
    this.container.appendChild(this.elements.stepsContainer);
  }
  if (!this.container.querySelector('.bw-qty-pills')) {
    this.container.appendChild(this.elements.qtyPillsEl);
  }
  this.container.appendChild(this.elements.purchaseOptionsMount);
  this.elements.purchaseOptionsMounts = { ppb: this.elements.purchaseOptionsMount };
  if (!this.container.querySelector('.bundle-footer-messaging')) {
    this.container.appendChild(this.elements.footer);
  }
  if (!this.container.querySelector('.add-bundle-to-cart')) {
    this.container.appendChild(this.elements.addToCartButton);
  }
  if (!this.container.querySelector('.bw-ppb-dynamic-checkout-visual')) {
    this.container.appendChild(this.elements.dynamicCheckoutVisual);
  }

  [
    this.elements.defaultProducts,
    this.elements.stepsContainer,
    this.elements.qtyPillsEl,
    this.elements.footer,
    this.elements.addToCartButton,
    this.elements.dynamicCheckoutVisual,
  ].forEach(element => {
    element?.removeAttribute?.('hidden');
    element?.removeAttribute?.('aria-hidden');
  });
},

_createQtyPillsEl() {
  const el = document.createElement('div');
  el.className = 'bw-qty-pills';
  el.style.display = 'none';
  return el;
},

_createDirectDefaultProductsEl() {
  const el = document.createElement('div');
  el.className = 'bw-default-products';
  el.style.display = 'none';
  return el;
},

_createBottomSheetOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'bw-bs-overlay';
  overlay.className = 'bw-bs-overlay';
  document.body.appendChild(overlay);
  return overlay;
},

/**
 * Creates the bottom-sheet panel using the SAME inner DOM structure as ensureModal()
 * so all existing renderModalProducts / renderModalTabs / tab-arrow code works unchanged.
 */
ensureBottomSheet() {
  let panel = document.getElementById('bundle-builder-modal');

  if (!panel) {
    panel = createProductPageBottomSheet(document);

    document.body.appendChild(panel);
    // No tab scroll arrows needed — tabs use CSS grid layout
  }

  return panel;
},

setBottomSheetVisibility(isOpen: any) {
  const modal = this.elements?.modal;
  if (!modal) return;

  if (isOpen) {
    modal.hidden = false;
    modal.removeAttribute('aria-hidden');
    modal.removeAttribute('inert');
    return;
  }

  const hideModal = () => {
    if (modal.classList.contains('bw-bs-panel--open')) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
  };

  if (typeof modal.addEventListener === 'function') {
    modal.addEventListener('transitionend', hideModal, { once: true });
  }
  window.setTimeout(hideModal, 350);
},

createStepsContainer() {
  const container = document.createElement('div');
  container.className = 'bundle-steps';
  return container;
},

createFooter() {
  const footer = document.createElement('div');
  footer.className = 'bundle-footer-messaging';
  footer.style.display = 'none';
  return footer;
},

createAddToCartButton() {
  const button = document.createElement('button');
  button.className = 'add-bundle-to-cart';
  button.textContent = this._resolveText('addToCartButton', 'Add Bundle to Cart');
  button.type = 'button';
  return button;
},

_createDynamicCheckoutVisual() {
  const button = document.createElement('div');
  button.className = 'bw-ppb-dynamic-checkout-visual';
  button.setAttribute('role', 'button');
  button.setAttribute('aria-disabled', 'true');
  button.textContent = 'Buy it now';
  return button;
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

    leftArrow.style.display = scrollLeft > 0 ? 'flex' : 'none';
    rightArrow.style.display = scrollLeft + clientWidth < scrollWidth - 1 ? 'flex' : 'none';
  };

  // Listen to scroll events
  tabsContainer.addEventListener('scroll', updateArrowVisibility);

  // Initial check
  setTimeout(updateArrowVisibility, 100);

  // Store for later updates
  this.updateTabArrows = updateArrowVisibility;
}
//========================================================================
// UI RENDERING
// ========================================================================
};
