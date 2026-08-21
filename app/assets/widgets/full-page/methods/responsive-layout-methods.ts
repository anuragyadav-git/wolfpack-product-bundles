import { TemplateDesignSystem } from '../../shared/template-design-system.js';

const responsiveLayoutTemplateSystem = TemplateDesignSystem;

function getFpbPresetSummary() {
  return typeof responsiveLayoutTemplateSystem?.getSummary === 'function'
    ? responsiveLayoutTemplateSystem.getSummary()
    : null;
}

function getFpbPresetContract(rawValue: string) {
  const normalizedPreset = typeof rawValue === 'string' ? rawValue.trim().toUpperCase() : '';
  if (!normalizedPreset) return null;

  const contracts = (getFpbPresetSummary() as any)?.fpb?.contracts;
  if (rawValue && contracts && typeof contracts === 'object') {
    return Object.values<any>(contracts).find((contract: any) => {
      if (!contract || typeof contract !== 'object') return false;
      return contract.id === normalizedPreset
        || contract.presetId === normalizedPreset
        || (Array.isArray(contract.aliases) && contract.aliases.includes(normalizedPreset));
    }) || null;
  }

  if (typeof responsiveLayoutTemplateSystem?.fpb?.resolveContract === 'function') {
    return responsiveLayoutTemplateSystem.fpb.resolveContract(normalizedPreset);
  }

  return null;
}

function isSupportedFpbPreset(rawValue: string) {
  return getFpbPresetContract(rawValue) !== null;
}

export function getSummaryPresentationMode({
  designPreset,
  layout,
  availableWidth,
}: any = {}) {
  const preset = typeof designPreset === 'string'
    ? designPreset.trim().toUpperCase()
    : '';
  const width = Number(availableWidth);

  if (!isSupportedFpbPreset(preset) || layout !== 'footer_side' || !Number.isFinite(width)) {
    return null;
  }

  return width < 800 ? 'tray' : 'sidebar';
}

export const fullPageResponsiveLayoutMethods: Record<string, any> & ThisType<any> = {
async renderFullPageLayout() {
  this.elements.stepsContainer.innerHTML = '';
  this.elements.stepsContainer.classList.add('full-page-layout', 'layout-sidebar');
  this.applyFullPageDesignPresetMarker();

  const bundleBanners = this.createBundleBanners();
  if (bundleBanners) {
    this.elements.stepsContainer.appendChild(bundleBanners);
  }

  // ABOVE: Step timeline sits above the two-column area (same horizontal position as
  // the floating footer layout) so tabs always appear at the top, not as a left column.
  if (this.config.showStepTimeline && this.shouldRenderFullPageStepChrome()) {
    this.elements.stepsContainer.appendChild(this.createStepTimeline());
  }

  const contentHeader = this.createStepContentHeader(this.currentStepIndex);
  if (contentHeader) this.elements.stepsContainer.appendChild(contentHeader);

  if (this.config.showCategoryTabs) {
    const categoryTabs = this.createCategoryTabs(this.currentStepIndex);
    if (categoryTabs) this.elements.stepsContainer.appendChild(categoryTabs);
  }

  // Two-column wrapper: content (center) | sidebar (right)
  const twoColWrapper = document.createElement('div');
  twoColWrapper.className = 'sidebar-layout-wrapper';

  // CENTER: Main content (same as footer_bottom minus the footer)
  const contentSection = document.createElement('div');
  contentSection.className = 'full-page-content-section sidebar-content';

  const stepBanner = this.createStepBannerImage(this.currentStepIndex);
  if (stepBanner) contentSection.appendChild(stepBanner);

  if (this.shouldRenderFullPageSearch()) {
    contentSection.appendChild(this.createSearchInput());
  }

  const categoryRowsBefore = this.createCategorySectionRows(this.currentStepIndex, 'before');
  if (categoryRowsBefore) contentSection.appendChild(categoryRowsBefore);

  const activeCategoryTitle = this.createActiveCategoryTitle(this.currentStepIndex);
  if (activeCategoryTitle) contentSection.appendChild(activeCategoryTitle);

  // Add-on step custom heading — only shown when merchant explicitly sets addonTitle
  const currentStep = (this.selectedBundle?.steps || [])[this.currentStepIndex];
  if (currentStep?.isFreeGift && currentStep?.addonTitle) {
    const freeHeading = document.createElement('div');
    freeHeading.className = 'fpb-step-free-heading';
    freeHeading.textContent = currentStep.addonTitle;
    contentSection.appendChild(freeHeading);
  }

  const productGridContainer = document.createElement('div');
  productGridContainer.className = 'full-page-product-grid-container';
  this.renderProductGridLoadingState(productGridContainer);
  contentSection.appendChild(productGridContainer);
  const categoryRowsAfter = this.createCategorySectionRows(this.currentStepIndex, 'after');
  if (categoryRowsAfter) contentSection.appendChild(categoryRowsAfter);

  twoColWrapper.appendChild(contentSection);

  // RIGHT: Side panel
  const sidePanel = document.createElement('div');
  sidePanel.className = 'full-page-side-panel';
  this.renderSidePanel(sidePanel);
  twoColWrapper.appendChild(sidePanel);

  this.elements.stepsContainer.appendChild(twoColWrapper);
  this._observeSummaryPresentationMode();

  // Load products.
  try {
    await this.loadStepProducts(this.currentStepIndex);
    const productGrid = this.createFullPageProductGrid(this.currentStepIndex);
    productGridContainer.innerHTML = '';
    productGridContainer.appendChild(productGrid);
    this.renderSidePanel(sidePanel);
    this.hideLoadingOverlay();
    this.preloadNextStep();
    this._renderMobileSummaryTray();
  } catch (error: any) {
    this.hideLoadingOverlay();
    productGridContainer.innerHTML = '<p class="error-message">Failed to load products. Please try again.</p>';
    this._renderMobileSummaryTray();
  }
},

_renderMobileSummaryTray({ preserveOpen = false }: any = {}) {
  const previousSheet = document.querySelector('.fpb-mobile-bottom-sheet');
  const wasCompactSummaryExpanded = preserveOpen
    && previousSheet?.classList.contains('fpb-mobile-summary-tray-expanded');
  const sheet = previousSheet || document.createElement('div');
  sheet.className = 'fpb-mobile-bottom-sheet fpb-mobile-summary-tray';
  const preset = this.getFullPageDesignPreset();
  if (preset) {
    sheet.classList.add(`fpb-preset-${preset.toLowerCase()}`);
  }
  this.compactMobileSummaryTrayExpanded = wasCompactSummaryExpanded
    || this.compactMobileSummaryTrayExpanded === true;
  this._populateCompactMobileSummaryTray(sheet);
  sheet.classList.add('is-open');
  this.mobileSummaryTrayElement = sheet;
  if (!previousSheet) this.container.appendChild(sheet);
  this._syncSummaryPresentationMode();
},

_syncSummaryPresentationMode() {
  const measuredWidth = Number(
    this.container?.getBoundingClientRect?.().width
      ?? this.elements?.stepsContainer?.getBoundingClientRect?.().width
      ?? (typeof window !== 'undefined' ? window.innerWidth : Number.NaN)
  );
  const mode = getSummaryPresentationMode({
    designPreset: this.getFullPageDesignPreset?.(),
    layout: this.resolveFullPageLayout?.(),
    availableWidth: measuredWidth,
  });

  if (!mode) return null;

  [
    this.container,
    this.elements?.stepsContainer,
    this.mobileSummaryTrayElement,
  ].filter(Boolean).forEach((element) => {
    element.setAttribute?.('data-fpb-summary-mode', mode);
  });

  if (mode === 'sidebar' && this.compactMobileSummaryTrayExpanded === true) {
    this._setCompactMobileSummaryOpen?.(
      this.mobileSummaryTrayElement,
      false,
      { restoreFocus: false }
    );
  }

  return mode;
},

_observeSummaryPresentationMode() {
  const mode = this._syncSummaryPresentationMode();
  if (!mode || typeof ResizeObserver !== 'function' || !this.container) return;

  if (!this._summaryResizeObserver) {
    this._summaryResizeObserver = new ResizeObserver(() => {
      this._syncSummaryPresentationMode();
    });
    this._summaryResizeObserver.observe(this.container);
  }
},

};
