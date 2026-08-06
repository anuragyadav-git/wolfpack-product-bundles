import { initializeProductPageWidget } from '../assets/bundle-widget-product-page.js';

const contextElement = document.querySelector<HTMLScriptElement>('[data-wpb-context="product-page"]');
if (contextElement?.textContent) Object.assign(window, JSON.parse(contextElement.textContent));

function mount(): void {
  initializeProductPageWidget(document);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
  mount();
}
