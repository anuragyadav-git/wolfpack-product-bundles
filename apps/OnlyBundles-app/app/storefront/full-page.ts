import { initializeFullPageWidget } from '../assets/bundle-widget-full-page.js';

const contextElement = document.querySelector<HTMLScriptElement>('[data-wpb-context="full-page"]');
if (contextElement?.textContent) Object.assign(window, JSON.parse(contextElement.textContent));

function mount(): void {
  initializeFullPageWidget(document);
}

(window as Window & {
  __WOLFPACK_INITIALIZE_FULL_PAGE_WIDGET__?: (root?: Document) => void;
}).__WOLFPACK_INITIALIZE_FULL_PAGE_WIDGET__ = initializeFullPageWidget;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
  mount();
}
