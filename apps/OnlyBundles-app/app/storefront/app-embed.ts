import {
  getFpbStylesheetUrls,
  type FpbDesignPreset,
} from './fpb-template-assets.js';
import { transferBootstrapLoadingScreen } from '../assets/widgets/full-page/bootstrap-skeleton.js';
import {
  initializeFpbProductPageUpsells,
  reconcileFpbUpsellPlacement,
} from './fpb-product-page-upsell.js';
import {
  initializePpbBundleEmbed,
  reconcilePpbBundleEmbedPlacement,
} from './ppb-bundle-embed.js';
import {
  findPageBuilderEmbedMarker,
  initializePageBuilderEmbed,
  suppressesAutomaticPpbEmbed,
} from './page-builder-embed.js';
import { loadAndApplyGlobalSettingsControls } from './settings-controls.js';
import { setStorefrontProxyRoot } from '../config/storefront-proxy-routes.js';

const embed = document.querySelector<HTMLElement>('[data-wpb-app-embed]');
if (embed?.dataset.storefrontProxyRoot) {
  setStorefrontProxyRoot(embed.dataset.storefrontProxyRoot);
}
if (embed) {
  (window as Window & { currentCountryCode?: string }).currentCountryCode =
    embed.dataset.countryCode ?? '';
}

export function ensureStylesheet(href: string | undefined): void {
  if (!href) return;
  const existing = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
    .some((link) => link.href === href || link.getAttribute('href') === href);
  if (existing) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.wpbFpbStyle = 'true';
  document.head.append(link);
}

function normalizePreset(value: string | undefined): FpbDesignPreset {
  const preset = String(value || 'STANDARD').trim().toUpperCase();
  if (preset === 'CLASSIC' || preset === 'COMPACT' || preset === 'HORIZONTAL') return preset;
  return 'STANDARD';
}

function loadFullPageRuntime(src: string | undefined): void {
  if (!src || document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement('script');
  script.src = src;
  script.defer = true;
  document.body.append(script);
}

function hydrateMarker(): void {
  if (!embed) return;
  if (embed.dataset.redirectPath) {
    window.location.replace(embed.dataset.redirectPath);
    return;
  }
  const marker = document.querySelector<HTMLElement>('[data-wpb-full-page-bundle][data-bundle-id]');
  if (!marker || marker.dataset.wpbHydrated === 'true') return;
  if (document.querySelector('#bundle-builder-app, .bundle-widget-full-page[data-bundle-id]')) return;
  const bundleId = marker.dataset.bundleId;
  if (!bundleId) return;

  const preset = normalizePreset(marker.dataset.fpbDesignPreset);
  const container = document.createElement('div');
  container.id = 'bundle-builder-app';
  container.className = `bundle-widget-container bundle-widget-full-page fpb-preset-${preset.toLowerCase()}`;
  Object.assign(container.dataset, {
    bundleId,
    bundleType: marker.dataset.bundleType || 'full_page',
    fpbTemplateType: marker.dataset.fpbTemplateType || 'FBP_SIDE_FOOTER',
    fpbDesignPreset: preset,
    fpbTabStyle: preset === 'CLASSIC' || preset === 'COMPACT' ? 'pill' : 'underline',
    bundleConfig: marker.dataset.bundleConfig || 'null',
    bundleConfigSource: marker.dataset.bundleConfigSource || '',
    bundleSettings: marker.dataset.bundleSettings || 'null',
    shop: marker.dataset.shop || '',
    fpbLoadingGif: marker.dataset.fpbLoadingGif || '',
    fpbLoadingBackground: marker.dataset.fpbLoadingBackground || '#ffffff',
    countryCode: marker.dataset.countryCode || embed.dataset.countryCode || '',
  });
  transferBootstrapLoadingScreen(marker, container);
  marker.before(container);
  marker.dataset.wpbHydrated = 'true';

  getFpbStylesheetUrls(embed.dataset, preset).forEach((href) => {
    ensureStylesheet(href);
  });
  loadFullPageRuntime(embed.dataset.fullPageScriptUrl);
}

function hydrateProductPageUpsells(): void {
  if (!embed) return;
  reconcileFpbUpsellPlacement();
  void initializeFpbProductPageUpsells(embed);
}

function hydratePpbBundleEmbed(): void {
  if (!embed) return;
  if (suppressesAutomaticPpbEmbed(findPageBuilderEmbedMarker())) return;
  reconcilePpbBundleEmbedPlacement();
  void initializePpbBundleEmbed(embed);
}

function hydratePageBuilderEmbed(): void {
  if (!embed) return;
  void initializePageBuilderEmbed(embed);
}

function hydrateGlobalSettingsControls(): void {
  if (!embed || embed.dataset.wpbControlsHydrated === 'true') return;
  embed.dataset.wpbControlsHydrated = 'true';
  void loadAndApplyGlobalSettingsControls(embed.dataset.controlsSettingsEndpoint || '');
}

(window as Window & { __WOLFPACK_BUNDLE_EMBED_ACTIVE__?: boolean }).__WOLFPACK_BUNDLE_EMBED_ACTIVE__ = true;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    hydrateMarker();
    hydratePageBuilderEmbed();
    hydrateProductPageUpsells();
    hydratePpbBundleEmbed();
    hydrateGlobalSettingsControls();
  }, { once: true });
} else {
  hydrateMarker();
  hydratePageBuilderEmbed();
  hydrateProductPageUpsells();
  hydratePpbBundleEmbed();
  hydrateGlobalSettingsControls();
}
document.addEventListener('shopify:section:load', hydrateMarker);
document.addEventListener('shopify:section:load', hydratePageBuilderEmbed);
document.addEventListener('shopify:section:load', hydrateProductPageUpsells);
document.addEventListener('shopify:section:load', hydratePpbBundleEmbed);
