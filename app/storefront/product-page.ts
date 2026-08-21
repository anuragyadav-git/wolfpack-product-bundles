import { initializeProductPageWidget } from '../assets/bundle-widget-product-page.js';

const contextElement = document.querySelector<HTMLScriptElement>('[data-wpb-context="product-page"]');
if (contextElement?.textContent) Object.assign(window, JSON.parse(contextElement.textContent));

function mount(): void {
  initializeProductPageWidget(document);
}

(window as Window & {
  __WOLFPACK_INITIALIZE_PRODUCT_PAGE_WIDGET__?: (root?: Document) => void;
}).__WOLFPACK_INITIALIZE_PRODUCT_PAGE_WIDGET__ = initializeProductPageWidget;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
  mount();
}
