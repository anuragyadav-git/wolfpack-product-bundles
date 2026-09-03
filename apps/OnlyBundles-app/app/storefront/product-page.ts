import { initializeProductPageWidget } from '../assets/bundle-widget-product-page.js';
import { setStorefrontProxyRoot } from '../config/storefront-proxy-routes.js';

const contextElement = document.querySelector<HTMLScriptElement>('[data-wpb-context="product-page"]');
if (contextElement?.textContent) {
  const context = JSON.parse(contextElement.textContent);
  Object.assign(window, context);
  const proxyRoot = context.__WOLFPACK_PPB_STOREFRONT_RUNTIME__?.storefrontProxyRoot;
  if (proxyRoot) setStorefrontProxyRoot(proxyRoot);
}

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
