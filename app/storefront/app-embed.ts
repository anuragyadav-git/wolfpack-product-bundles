import {
  getFpbPresetStylesheetUrl,
  type FpbDesignPreset,
} from './fpb-template-assets.js';
import { transferBootstrapSkeleton } from '../assets/widgets/full-page/bootstrap-skeleton.js';

const embed = document.querySelector<HTMLElement>('[data-wpb-app-embed]');

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
  });
  transferBootstrapSkeleton(marker, container);
  marker.before(container);
  marker.dataset.wpbHydrated = 'true';

  ensureStylesheet(embed.dataset.fullPageStyleUrl);
  ensureStylesheet(embed.dataset.mobileSummaryStyleUrl);
  ensureStylesheet(getFpbPresetStylesheetUrl(embed.dataset, preset));
  ensureStylesheet(embed.dataset.responsiveStyleUrl);
  loadFullPageRuntime(embed.dataset.fullPageScriptUrl);
}

(window as Window & { __WOLFPACK_BUNDLE_EMBED_ACTIVE__?: boolean }).__WOLFPACK_BUNDLE_EMBED_ACTIVE__ = true;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hydrateMarker, { once: true });
} else {
  hydrateMarker();
}
document.addEventListener('shopify:section:load', hydrateMarker);
