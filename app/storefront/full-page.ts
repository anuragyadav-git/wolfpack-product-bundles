import { initializeFullPageWidget } from '../assets/bundle-widget-full-page.js';

const contextElement = document.querySelector<HTMLScriptElement>('[data-wpb-context="full-page"]');
if (contextElement?.textContent) Object.assign(window, JSON.parse(contextElement.textContent));

function mount(): void {
  initializeFullPageWidget(document);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
  mount();
}
