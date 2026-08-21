'use strict';

let standardMobileDrawerCleanup: (() => void) | null = null;

import { CurrencyManager } from './currency-manager.js';
import {
  drawerLayerManager,
  shouldDismissDrawerSwipe,
} from './drawer-layer-manager.js';

export function getStandardMobileDrawerContract({ isPpbOwned = false }: any = {}) {
  return {
    closeControl: isPpbOwned ? 'handle' : 'cross',
    dismissOnBackdrop: true,
    dismissOnEscape: true,
    dismissOnSelection: true,
    showApplyAction: false,
  };
}

/**
 * VariantSelectorComponent
 *
 * Renders an inline variant selector on FPB product cards.
 * Replaces the <select> dropdown with:
 *   - A button group for the merchant-configured primary option dimension (max 4 + overflow)
 *   - Pill button(s) for remaining dimensions (tap to open dropdown panel)
 *
 * Usage:
 *   const html = VariantSelectorComponent.renderHtml(product, primaryOptionName);
 *   VariantSelectorComponent.attachListeners(cardEl, product, onVariantChange);
 *
 *   onVariantChange(newVariantId, oldVariantId) is called after product is mutated.
 */

class VariantSelectorComponent {

  /**
   * Render the variant selector HTML for a product card.
   *
   * @param {Object} product - Product with .variants[], .options[], .variantId
   * @param {string|null} primaryOptionName - Merchant-configured primary dimension (e.g. "Size")
   * @returns {string} HTML string, or '' if no selector needed
   */
  static renderHtml(product: any, primaryOptionName: any) {
    const variants = product.variants || [];
    const options = product.options || [];

    if (variants.length <= 1 || options.length === 0) return '';

    const primaryIdx = VariantSelectorComponent._primaryIdx(options, primaryOptionName);
    const primaryValues = VariantSelectorComponent._uniqueSelectableValues(variants, primaryIdx);
    if (primaryValues.length === 0) return '';

    const selectedVariant = variants.find((v: any)  => v.id === product.variantId);
    const selectedPrimaryVal = selectedVariant
      ? (selectedVariant[`option${primaryIdx}`] || primaryValues[0])
      : primaryValues[0];

    const MAX_VISIBLE = 4;
    const visible = primaryValues.slice(0, MAX_VISIBLE);
    const overflowCount = primaryValues.length - MAX_VISIBLE;

    const btnGroupHtml = visible.map(val => {
      const sel = val === selectedPrimaryVal;
      const cls = ['vs-btn', sel ? 'vs-btn--selected' : ''].filter(Boolean).join(' ');
      return `<button type="button" class="${cls}" data-primary-opt-idx="${primaryIdx}" data-primary-value="${VariantSelectorComponent._esc(val)}">${VariantSelectorComponent._esc(val)}</button>`;
    }).join('');

    const overflowHtml = overflowCount > 0
      ? `<button type="button" class="vs-btn vs-btn--overflow" data-overflow="1" data-primary-opt-idx="${primaryIdx}" data-all-values="${VariantSelectorComponent._esc(JSON.stringify(primaryValues))}">+${overflowCount}</button>`
      : '';

    // Secondary dimension pills (options beyond primary)
    const secondaryHtml = (() => {
      if (options.length <= 1 || !selectedVariant) return '';
      const pills = options.map((optName: any, i: number) => {
        if (i === primaryIdx - 1) return '';
        const optIdx = i + 1;
        const val = selectedVariant[`option${optIdx}`];
        if (!val) return '';
        return `<button type="button" class="vs-secondary-pill" data-opt-idx="${optIdx}"><span class="vs-secondary-label">${VariantSelectorComponent._esc(optName)}:</span> <strong>${VariantSelectorComponent._esc(val)}</strong> <span class="vs-chevron">&#9662;</span></button>`;
      }).filter(Boolean).join('');
      return pills ? `<div class="vs-secondary">${pills}</div>` : '';
    })();

    const productId = product.id || product.variantId;
    return `<div class="vs-wrapper" data-vs-product-id="${productId}"><div class="vs-btn-group">${btnGroupHtml}${overflowHtml}</div>${secondaryHtml}</div>`;
  }

  static renderDropdownHtml(product: any, primaryOptionName: any, options: any = {}) {
    const variants = product.variants || [];
    const optionNames = product.options || [];

    if (variants.length <= 1 || optionNames.length === 0) return '';

    const primaryIdx = VariantSelectorComponent._primaryIdx(optionNames, primaryOptionName);
    const selectedVariant = variants.find((variant: any)  => String(variant.id) === String(product.variantId)) || variants[0];
    const selectedPrimaryValue = selectedVariant?.[`option${primaryIdx}`] || selectedVariant?.title || '';
    const selectedLabel = options.placeholder || selectedPrimaryValue;
    const productId = product.id || product.variantId;
    const mobileMode = options.mobileMode === 'inline' ? 'inline' : 'drawer';

    const dropdownVariants = options.hideUnavailable === true
      ? variants.filter(VariantSelectorComponent._isSelectableVariant)
      : variants;
    const optionHtml = dropdownVariants.map((variant: any) => {
      const primaryValue = variant[`option${primaryIdx}`] || variant.title || '';
      const value = optionNames.length > 1 && variant.title ? variant.title : primaryValue;
      const imageUrl = VariantSelectorComponent._variantImageUrl(variant);
      const isAvailable = variant.available !== false;
      return `
        <li class="vs-option" data-variant-id="${VariantSelectorComponent._esc(variant.id)}" data-primary-value="${VariantSelectorComponent._esc(value)}" ${!isAvailable ? 'aria-disabled="true"' : ''}>
          ${imageUrl ? `<img class="vs-option-image" src="${VariantSelectorComponent._esc(imageUrl)}" alt="">` : ''}
          <span class="vs-option-label">${VariantSelectorComponent._esc(value)}</span>
        </li>
      `;
    }).join('');

    return `
      <div class="vs-wrapper vs-wrapper--standard" data-vs-product-id="${VariantSelectorComponent._esc(productId)}" data-vs-primary-idx="${primaryIdx}" data-vs-placeholder="${VariantSelectorComponent._esc(selectedLabel)}" data-vs-mobile-mode="${mobileMode}">
        <button type="button" class="vs-selected" aria-expanded="false">
          <span class="vs-selected-label">${VariantSelectorComponent._esc(selectedLabel)}</span>
          <span class="vs-selected-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" focusable="false">
              <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </span>
        </button>
        <ul class="vs-options" hidden>
          ${optionHtml}
        </ul>
      </div>
    `;
  }

  static renderStandardMobileDrawerHtml(product: any, options: any = {}) {
    const variants = product.variants || [];
    const optionNames = product.options || [];
    const primaryIdx = options.primaryIdx || VariantSelectorComponent._primaryIdx(optionNames, options.primaryOptionName);
    const selectedVariant = variants.find((v: any)  => String(v.id) === String(product.variantId)) || variants[0] || product;
    const productImageUrl = VariantSelectorComponent._variantImageUrl(selectedVariant) || product.imageUrl || '';
    const productTitle = product.title || selectedVariant.productTitle || '';
    const placeholder = options.placeholder || '';
    const formatPrice = typeof options.formatPrice === 'function'
      ? options.formatPrice
      : (value: any) => VariantSelectorComponent.formatDrawerPrice(value);
    const productPrice = selectedVariant.price ?? product.price ?? 0;
    const isPpbDrawer = options.drawerOwner === 'ppb';
    const drawerContract = getStandardMobileDrawerContract({ isPpbOwned: isPpbDrawer });

    const optionHtml = variants.map((variant: any) => {
      const label = VariantSelectorComponent.getStandardVariantLabel(variant, optionNames, primaryIdx);
      const imageUrl = VariantSelectorComponent._variantImageUrl(variant) || productImageUrl;
      const isAvailable = variant.available !== false;
      const isSelected = String(variant.id) === String(selectedVariant.id);
      return `
        <button type="button" class="vs-mobile-option${isSelected ? ' vs-mobile-option--selected' : ''}" data-variant-id="${VariantSelectorComponent._esc(variant.id)}" aria-disabled="${isAvailable ? 'false' : 'true'}">
          ${imageUrl ? `<img class="vs-mobile-option-image" src="${VariantSelectorComponent._esc(imageUrl)}" alt="">` : '<span class="vs-mobile-option-image vs-mobile-option-image--empty" aria-hidden="true"></span>'}
          <span class="vs-mobile-option-label">${VariantSelectorComponent._esc(label)}</span>
          <span class="vs-mobile-option-price">${VariantSelectorComponent._esc(formatPrice(variant.price ?? 0))}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="vs-mobile-drawer vs-mobile-drawer--standard" data-vs-mobile-drawer${isPpbDrawer ? ' data-ppb-drawer-surface="variant-selector"' : ''}>
        <div class="vs-mobile-drawer-sheet" role="dialog" aria-modal="true">
          ${drawerContract.closeControl === 'handle' ? `
          <button type="button" class="vs-mobile-drawer-handle" data-vs-drawer-handle aria-label="Close variant selector">
            <span class="vs-mobile-drawer-grip" aria-hidden="true"></span>
          </button>` : `
          <button type="button" class="vs-mobile-drawer-close" aria-label="Close variant selector">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M6 6 18 18M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"></path>
            </svg>
          </button>`}
          <div class="vs-mobile-drawer-header">
            ${productImageUrl ? `<img class="vs-mobile-drawer-product-image" src="${VariantSelectorComponent._esc(productImageUrl)}" alt="">` : ''}
            <div class="vs-mobile-drawer-product-info">
              <p class="vs-mobile-drawer-product-title">${VariantSelectorComponent._esc(productTitle)}</p>
              <p class="vs-mobile-drawer-product-price">${VariantSelectorComponent._esc(formatPrice(productPrice))}</p>
            </div>
          </div>
          <div class="vs-mobile-drawer-body">
            <div class="vs-mobile-drawer-title">${VariantSelectorComponent._esc(placeholder)}</div>
            <div class="vs-mobile-options">
              ${optionHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners for the variant selector on a card element.
   * Must be called after the card HTML is in the DOM.
   *
   * @param {HTMLElement} cardEl - The .product-card element
   * @param {Object} product - Product object (mutated on variant change)
   * @param {Function} onVariantChange - Called with (newVariantId, oldVariantId) after mutation
   */
  static attachListeners(cardEl: any, product: any, onVariantChange: any) {
    cardEl.addEventListener('click', (e: any) => {
      const btn = e.target.closest('.vs-btn, .vs-secondary-pill');
      if (!btn || btn.disabled) return;
      e.stopPropagation();

      if (btn.classList.contains('vs-btn--overflow')) {
        VariantSelectorComponent._openOverflowPanel(btn, cardEl, product, onVariantChange);
        return;
      }

      if (btn.classList.contains('vs-secondary-pill')) {
        VariantSelectorComponent._openSecondaryPanel(btn, cardEl, product, onVariantChange);
        return;
      }

      if (btn.classList.contains('vs-btn')) {
        const primaryOptIdx = parseInt(btn.dataset.primaryOptIdx, 10);
        const val = btn.dataset.primaryValue;
        VariantSelectorComponent._selectPrimary(cardEl, product, primaryOptIdx, val, onVariantChange);
      }
    });

    cardEl.addEventListener('click', (e: any) => {
      const selected = e.target.closest('.vs-selected');
      if (selected) {
        e.stopPropagation();
        VariantSelectorComponent.handleStandardSelectorClick(selected, cardEl, product, onVariantChange);
        return;
      }

      const option = e.target.closest('.vs-option');
      if (!option || option.getAttribute('aria-disabled') === 'true') return;
      e.stopPropagation();
      VariantSelectorComponent._selectStandardOption(cardEl, product, option, onVariantChange);
    });
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  static _primaryIdx(options: any[], primaryOptionName: string) {
    if (!primaryOptionName) return 1;
    const idx = options.findIndex((o: string)  => o.toLowerCase() === primaryOptionName.toLowerCase());
    return idx >= 0 ? idx + 1 : 1;
  }

  static _uniqueValues(variants: any[], optIdx: number) {
    const seen = new Set();
    const out: any[] = [];
    variants.forEach((v: any)  => {
      const val = v[`option${optIdx}`];
      if (val && !seen.has(val)) { seen.add(val); out.push(val); }
    });
    return out;
  }

  static _uniqueSelectableValues(variants: any, optIdx: number) {
    return VariantSelectorComponent._uniqueValues(
      (variants || []).filter(VariantSelectorComponent._isSelectableVariant),
      optIdx
    );
  }

  static _isSelectableVariant(variant: any) {
    return variant?.available !== false;
  }

  static _esc(str: string|null|undefined) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  static _findBestVariant(variants: any[], primaryOptIdx: number, primaryValue: any, currentVariantId: any) {
    const current = variants.find((v: any)  => v.id === currentVariantId);
    const candidates = variants.filter((v: any)  =>
      v[`option${primaryOptIdx}`] === primaryValue && VariantSelectorComponent._isSelectableVariant(v)
    );
    if (candidates.length === 0) return null;
    if (candidates.length === 1 || !current) return candidates[0];
    // Prefer candidate that preserves other option values
    for (let i = 1; i <= 3; i++) {
      if (i === primaryOptIdx) continue;
      const curVal = current[`option${i}`];
      if (!curVal) continue;
      const match = candidates.find((v: any)  => v[`option${i}`] === curVal);
      if (match) return match;
    }
    return candidates[0];
  }

  static _resolveCompareAtPrice(variant: any) {
    if (!variant) return null;
    const rawCompareAt = variant.compareAtPrice ?? variant.compare_at_price;
    if (rawCompareAt == null) return null;
    const resolved = typeof rawCompareAt === 'object' && rawCompareAt !== null && typeof rawCompareAt.amount !== 'undefined'
      ? rawCompareAt.amount
      : rawCompareAt;
    const parsed = Number.parseFloat(resolved);
    return Number.isFinite(parsed) ? parsed : null;
  }

  static _selectPrimary(cardEl: any, product: any, primaryOptIdx: number, val: any, onVariantChange: (arg0: any,arg1: any) => void) {
    const oldVariantId = product.variantId;
    const newVariant = VariantSelectorComponent._findBestVariant(
      product.variants || [], primaryOptIdx, val, oldVariantId
    );
    if (!newVariant) return;

    // Update button group visual state
    const wrapper = cardEl.querySelector('.vs-wrapper');
    if (wrapper) {
      wrapper.querySelectorAll('.vs-btn:not(.vs-btn--overflow)').forEach((b: any)  => {
        b.classList.toggle('vs-btn--selected', b.dataset.primaryValue === val);
      });
      // Update secondary pills
      wrapper.querySelectorAll('.vs-secondary-pill').forEach((pill: any)  => {
        const optIdx = parseInt(pill.dataset.optIdx, 10);
        const label = pill.querySelector('.vs-secondary-label');
        const optName = label ? label.textContent.replace(':', '').trim() : `Option ${optIdx}`;
        const newVal = newVariant[`option${optIdx}`] || '';
        pill.innerHTML = `<span class="vs-secondary-label">${VariantSelectorComponent._esc(optName)}:</span> <strong>${VariantSelectorComponent._esc(newVal)}</strong> <span class="vs-chevron">&#9662;</span>`;
      });
    }

    // Mutate product
    product.variantId = newVariant.id;
    product.price = newVariant.price;
    product.compareAtPrice = VariantSelectorComponent._resolveCompareAtPrice(newVariant);
    product.imageUrl = VariantSelectorComponent._variantImageUrl(newVariant) || product.imageUrl;
    product.available = newVariant.available === true;
    product.quantityAvailable = typeof newVariant.quantityAvailable === 'number' ? newVariant.quantityAvailable : null;
    product.currentlyNotInStock = newVariant.currentlyNotInStock === true;

    onVariantChange(newVariant.id, oldVariantId);
  }

  static _openOverflowPanel(overflowBtn: any, cardEl: any, product: any, onVariantChange: any) {
    VariantSelectorComponent._closePanel(cardEl);

    const primaryOptIdx = parseInt(overflowBtn.dataset.primaryOptIdx, 10);
    let allValues;
    try { allValues = JSON.parse(overflowBtn.dataset.allValues); }
    catch (_: any) { allValues = VariantSelectorComponent._uniqueSelectableValues(product.variants || [], primaryOptIdx); }

    const currentVariant = (product.variants || []).find((v: any)  => v.id === product.variantId);
    const currentPrimary = currentVariant ? currentVariant[`option${primaryOptIdx}`] : null;

    const panel = VariantSelectorComponent._makePanel();

    allValues.forEach((val: string|null)  => {
      const sel = val === currentPrimary;
      const tile = VariantSelectorComponent._makeTile(val, sel, false);
      tile.addEventListener('click', (e: any) => {
        e.stopPropagation();
        VariantSelectorComponent._selectPrimary(cardEl, product, primaryOptIdx, val, onVariantChange);
        VariantSelectorComponent._closePanel(cardEl);
      });
      panel.appendChild(tile);
    });

    const wrapper = cardEl.querySelector('.vs-wrapper');
    if (wrapper) wrapper.appendChild(panel);
    VariantSelectorComponent._bindOutsideClose(panel, cardEl);
  }

  static _openSecondaryPanel(pill: any, cardEl: any, product: any, onVariantChange: (arg0: any,arg1: any) => void) {
    VariantSelectorComponent._closePanel(cardEl);

    const optIdx = parseInt(pill.dataset.optIdx, 10);
    const currentVariant = (product.variants || []).find((v: any)  => v.id === product.variantId);
    const currentVal = currentVariant ? currentVariant[`option${optIdx}`] : null;

    // Determine primary selection to preserve it when picking a secondary value
    const wrapper = cardEl.querySelector('.vs-wrapper');
    const primaryBtn = wrapper?.querySelector('.vs-btn--selected');
    const primaryOptIdx = primaryBtn ? parseInt(primaryBtn.dataset.primaryOptIdx, 10) : 1;
    const currentPrimary = currentVariant ? currentVariant[`option${primaryOptIdx}`] : null;
    const values = VariantSelectorComponent._uniqueValues((product.variants || []).filter((v: any)  => {
      const matchesPrimary = !currentPrimary || v[`option${primaryOptIdx}`] === currentPrimary;
      return matchesPrimary && VariantSelectorComponent._isSelectableVariant(v);
    }), optIdx);

    const panel = VariantSelectorComponent._makePanel('vs-panel--secondary');

    values.forEach(val => {
      const candidate = (product.variants || []).find((v: any)  => {
        const matchesPrimary = !currentPrimary || v[`option${primaryOptIdx}`] === currentPrimary;
        return matchesPrimary && v[`option${optIdx}`] === val && VariantSelectorComponent._isSelectableVariant(v);
      });
      const sel = val === currentVal;
      const tile = VariantSelectorComponent._makeTile(val, sel, !candidate);

      tile.addEventListener('click', (e: any) => {
        e.stopPropagation();
        if (!candidate) return;
        const oldVariantId = product.variantId;
        product.variantId = candidate.id;
        product.price = candidate.price;
        product.compareAtPrice = VariantSelectorComponent._resolveCompareAtPrice(candidate);
        product.imageUrl = VariantSelectorComponent._variantImageUrl(candidate) || product.imageUrl;
        product.available = candidate.available === true;
        product.quantityAvailable = typeof candidate.quantityAvailable === 'number' ? candidate.quantityAvailable : null;
        product.currentlyNotInStock = candidate.currentlyNotInStock === true;
        // Update the pill text
        const optName = pill.querySelector('.vs-secondary-label')?.textContent?.replace(':', '').trim() || `Option ${optIdx}`;
        pill.innerHTML = `<span class="vs-secondary-label">${VariantSelectorComponent._esc(optName)}:</span> <strong>${VariantSelectorComponent._esc(val)}</strong> <span class="vs-chevron">&#9662;</span>`;
        onVariantChange(candidate.id, oldVariantId);
        VariantSelectorComponent._closePanel(cardEl);
      });

      panel.appendChild(tile);
    });

    if (wrapper) wrapper.appendChild(panel);
    VariantSelectorComponent._bindOutsideClose(panel, cardEl);
  }

  static _makePanel(extraClass = '') {
    const panel = document.createElement('div');
    panel.className = ['vs-panel', extraClass].filter(Boolean).join(' ');
    panel.dataset.vsPanel = '1';
    return panel;
  }

  static handleStandardSelectorClick(selected: any, cardEl: any, product: any, onVariantChange: any) {
    const wrapper = selected.closest('.vs-wrapper--standard');
    const opensInlineOnMobile = wrapper?.dataset.vsMobileMode === 'inline';
    if (VariantSelectorComponent.isMobileViewport() && !opensInlineOnMobile) {
      VariantSelectorComponent.openStandardMobileDrawer(selected, cardEl, product, onVariantChange);
      return;
    }

    VariantSelectorComponent._toggleStandardDropdown(selected, cardEl);
  }

  static isMobileViewport() {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(max-width: 767px)').matches || window.innerWidth <= 767;
  }

  static openStandardMobileDrawer(selected: any, cardEl: any, product: any, onVariantChange: any) {
    const wrapper = selected.closest('.vs-wrapper--standard');
    if (!wrapper || typeof document === 'undefined') return;

    VariantSelectorComponent.closeStandardMobileDrawer();

    const panel = wrapper.querySelector('.vs-options');
    const primaryIdx = parseInt(wrapper.dataset.vsPrimaryIdx || '1', 10);
    const placeholder = wrapper.dataset.vsPlaceholder || selected.querySelector('.vs-selected-label')?.textContent?.trim() || '';

    const ppbOwner = cardEl.closest?.('#bundle-builder-app[data-ppb-template-type], [data-ppb-template-type="PDP_INPAGE"], [data-ppb-template-type="PDP_MODAL"]');
    const isPpbDrawer = Boolean(ppbOwner);
    document.body.insertAdjacentHTML('beforeend', VariantSelectorComponent.renderStandardMobileDrawerHtml(product, {
      placeholder,
      primaryIdx,
      drawerOwner: isPpbDrawer ? 'ppb' : 'shared',
    }));
    selected.setAttribute('aria-expanded', 'true');

    const drawer = document.body.querySelector('[data-vs-mobile-drawer]');
    if (!drawer) return;

    const documentRoot = document.documentElement;
    const documentBody = document.body;
    const previousRootOverflow = documentRoot.style.overflow;
    const previousBodyOverflow = documentBody.style.overflow;
    let isClosed = false;
    let drawerLayer: any = null;

    if (!isPpbDrawer) {
      documentRoot.style.overflow = 'hidden';
      documentBody.style.overflow = 'hidden';
    }

    const close = () => {
      if (isClosed) return;
      isClosed = true;
      if (!isPpbDrawer) document.removeEventListener('keydown', handleKeyDown);
      drawer.remove();
      if (drawerLayer) {
        drawerLayerManager.close(drawerLayer);
      } else {
        documentRoot.style.overflow = previousRootOverflow;
        documentBody.style.overflow = previousBodyOverflow;
      }
      selected.setAttribute('aria-expanded', 'false');
      const currentTrigger = selected.isConnected
        ? selected
        : cardEl.querySelector('.vs-selected');
      currentTrigger?.focus?.({ preventScroll: true });
      if (standardMobileDrawerCleanup === close) {
        standardMobileDrawerCleanup = null;
      }
    };

    const handleKeyDown = (event: any) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      close();
    };

    standardMobileDrawerCleanup = close;
    if (isPpbDrawer) {
      drawerLayer = drawerLayerManager.open({
        id: 'variant-selector',
        requestClose: close,
        trigger: selected,
      });
    } else {
      document.addEventListener('keydown', handleKeyDown);
    }
    drawer.querySelector('.vs-mobile-drawer-close')?.addEventListener('click', (event: any) => {
      event.stopPropagation();
      close();
    });
    const handle = drawer.querySelector('[data-vs-drawer-handle]');
    handle?.addEventListener('click', (event: any) => {
      event.stopPropagation();
      close();
    });
    if (handle) {
      const sheet = drawer.querySelector<HTMLElement>('.vs-mobile-drawer-sheet')!;
      let gesture: any = null;
      const reset = () => {
        sheet.style.transform = '';
        sheet.style.transition = '';
      };
      handle.addEventListener('pointerdown', (event: any) => {
        gesture = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          startedAt: performance.now(),
        };
        sheet.style.transition = 'none';
        handle.setPointerCapture?.(event.pointerId);
      });
      handle.addEventListener('pointermove', (event: any) => {
        if (!gesture || event.pointerId !== gesture.pointerId) return;
        const distanceY = Math.max(0, event.clientY - gesture.startY);
        const distanceX = event.clientX - gesture.startX;
        if (Math.abs(distanceX) > distanceY) return;
        sheet.style.transform = `translateY(${distanceY}px)`;
      });
      handle.addEventListener('pointerup', (event: any) => {
        if (!gesture || event.pointerId !== gesture.pointerId) return;
        const elapsed = Math.max(1, performance.now() - gesture.startedAt);
        const distanceY = event.clientY - gesture.startY;
        const distanceX = event.clientX - gesture.startX;
        gesture = null;
        if (shouldDismissDrawerSwipe({ distanceY, distanceX, velocityY: distanceY / elapsed })) {
          close();
          return;
        }
        reset();
      });
      handle.addEventListener('pointercancel', () => {
        gesture = null;
        reset();
      });
    }

    const initialFocus = drawer.querySelector<HTMLElement>(
      '.vs-mobile-option--selected:not([aria-disabled="true"]), .vs-mobile-option:not([aria-disabled="true"])'
    );
    initialFocus?.focus?.({ preventScroll: true });

    drawer.addEventListener('click', (event: any) => {
      if (event.target === drawer) {
        event.stopPropagation();
        close();
        return;
      }

      const optionButton = event.target.closest('.vs-mobile-option');
      if (!optionButton) return;

      event.stopPropagation();
      if (optionButton.getAttribute('aria-disabled') === 'true') return;

      const sourceOption = (Array.from(panel?.querySelectorAll('.vs-option') || []) as HTMLElement[])
        .find(option => String(option.dataset.variantId) === String(optionButton.dataset.variantId));
      if (sourceOption) {
        VariantSelectorComponent._selectStandardOption(cardEl, product, sourceOption, onVariantChange);
      }
      close();
    });
  }

  static closeStandardMobileDrawer() {
    if (typeof document === 'undefined') return;
    if (standardMobileDrawerCleanup) {
      standardMobileDrawerCleanup();
      return;
    }
    document.querySelector('[data-vs-mobile-drawer]')?.remove();
  }

  static getStandardVariantLabel(variant: any, optionNames: string|any[], primaryIdx: any) {
    const primaryValue = variant[`option${primaryIdx}`] || variant.title || '';
    return optionNames.length > 1 && variant.title ? variant.title : primaryValue;
  }

  static formatDrawerPrice(value: any) {
    if (typeof CurrencyManager !== 'undefined') {
      return CurrencyManager.convertAndFormat(value || 0, CurrencyManager.getCurrencyInfo());
    }

    return String(value || 0);
  }

  static _toggleStandardDropdown(selected: any, cardEl: any) {
    const wrapper = selected.closest('.vs-wrapper--standard');
    const panel = wrapper?.querySelector('.vs-options');
    if (!wrapper || !panel) return;

    const willOpen = panel.hidden === true;
    cardEl.querySelectorAll('.vs-wrapper--standard .vs-options').forEach((otherPanel: any) => {
      if (otherPanel !== panel) {
        otherPanel.hidden = true;
        otherPanel.closest('.vs-wrapper--standard')?.querySelector('.vs-selected')?.setAttribute('aria-expanded', 'false');
      }
    });

    panel.hidden = !willOpen;
    selected.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    if (willOpen) {
      VariantSelectorComponent._bindStandardOutsideClose(panel, selected);
    }
  }

  static _selectStandardOption(cardEl: any, product: any, option: any, onVariantChange: (arg0: any,arg1: any) => void) {
    const wrapper = option.closest('.vs-wrapper--standard');
    const selected = wrapper?.querySelector('.vs-selected');
    const panel = wrapper?.querySelector('.vs-options');
    const variantId = option.dataset.variantId;
    const candidate = (product.variants || []).find((v: any)  => String(v.id) === String(variantId));
    if (!candidate) return;

    const oldVariantId = product.variantId;
    product.variantId = candidate.id;
    product.price = candidate.price;
    product.compareAtPrice = VariantSelectorComponent._resolveCompareAtPrice(candidate);
    product.imageUrl = VariantSelectorComponent._variantImageUrl(candidate) || product.imageUrl;
    product.available = candidate.available === true;
    product.quantityAvailable = typeof candidate.quantityAvailable === 'number' ? candidate.quantityAvailable : null;
    product.currentlyNotInStock = candidate.currentlyNotInStock === true;

    if (selected) {
      const label = selected.querySelector('.vs-selected-label');
      if (label) label.textContent = option.dataset.primaryValue || option.textContent.trim();
      selected.setAttribute('aria-expanded', 'false');
    }
    if (panel) panel.hidden = true;

    onVariantChange(candidate.id, oldVariantId);
  }

  static _bindStandardOutsideClose(panel: any, selected: any) {
    setTimeout(() => {
      const close = (e: any) => {
        if (!panel.contains(e.target) && !selected.contains(e.target)) {
          panel.hidden = true;
          selected.setAttribute('aria-expanded', 'false');
          document.removeEventListener('click', close);
        }
      };
      document.addEventListener('click', close);
    }, 0);
  }

  static _variantImageUrl(variant: any) {
    return variant?.image?.src
      || variant?.image?.url
      || (typeof variant?.image === 'string' ? variant.image : null)
      || variant?.imageUrl
      || null;
  }

  static _makeTile(label: string|null, isSelected: boolean, isOos: boolean) {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = ['vs-panel-tile', isSelected ? 'vs-panel-tile--selected' : '', isOos ? 'vs-panel-tile--oos' : ''].filter(Boolean).join(' ');
    tile.textContent = label;
    if (isOos) tile.disabled = true;
    return tile;
  }

  static _closePanel(cardEl: any) {
    cardEl.querySelector('[data-vs-panel]')?.remove();
  }

  static _bindOutsideClose(panel: HTMLDivElement, cardEl: any) {
    setTimeout(() => {
      const close = (e: any) => {
        if (!panel.contains(e.target)) {
          VariantSelectorComponent._closePanel(cardEl);
          document.removeEventListener('click', close);
        }
      };
      document.addEventListener('click', close);
    }, 0);
  }
}

export { VariantSelectorComponent };
