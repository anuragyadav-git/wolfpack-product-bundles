/**
 * Full-page bundle controller entry point.
 *
 * The app embed creates the canonical full-page container and loads its assets.
 * This module composes the controller methods shared by all four FPB presets.
 */

'use strict';

import { bundleLevelCssMethods } from './widgets/shared/bundle-level-css-methods.js';
import { getSelectedQuantity } from './widgets/shared/engine/bundle-selectors.js';
import { removeBootstrapSkeleton } from './widgets/full-page/bootstrap-skeleton.js';
import { installControllerMethods } from './widgets/shared/controller-methods.js';
import { fullPageAnalyticsConfigMethods } from './widgets/full-page/methods/analytics-config-methods.js';
import { fullPageInitialRenderMethods } from './widgets/full-page/methods/initial-render-methods.js';
import { fullPageResponsiveLayoutMethods } from './widgets/full-page/methods/responsive-layout-methods.js';
import { fullPageMobileSummaryMethods } from './widgets/full-page/methods/mobile-summary-methods.js';
import { fullPageSidePanelMethods } from './widgets/full-page/methods/side-panel-methods.js';
import { fullPageBoxSelectionSidebarMethods } from './widgets/full-page/methods/box-selection-sidebar-methods.js';
import { fullPageTimelineBannerMethods } from './widgets/full-page/methods/timeline-banner-methods.js';
import { fullPageSearchCategoryMethods } from './widgets/full-page/methods/search-category-methods.js';
import { fullPageProductGridMethods } from './widgets/full-page/methods/product-grid-methods.js';
import { fullPageProductCardFooterMethods } from './widgets/full-page/methods/product-card-footer-methods.js';
import { fullPageFooterSelectionMethods } from './widgets/full-page/methods/footer-selection-methods.js';
import { fullPageValidationAddonsMethods } from './widgets/full-page/methods/validation-addons-methods.js';
import { fullPageStepFooterMethods } from './widgets/full-page/methods/step-footer-methods.js';
import { fullPageDiscountModalMethods } from './widgets/full-page/methods/discount-modal-methods.js';
import { fullPageClearCartConfirmationMethods } from './widgets/full-page/methods/clear-cart-confirmation-methods.js';
import { fullPageProductProcessingMethods } from './widgets/full-page/methods/product-processing-methods.js';
import { fullPageModalProductMethods } from './widgets/full-page/methods/modal-product-methods.js';
import { fullPageSelectionNavigationMethods } from './widgets/full-page/methods/selection-navigation-methods.js';
import { fullPageRuntimeCartSettingsMethods } from './widgets/full-page/methods/runtime-cart-settings-methods.js';
import { fullPageTierFloatingRuntimeMethods } from './widgets/full-page/methods/tier-floating-runtime-methods.js';
import { claimFullPageWidgetInitialization } from './widgets/full-page/initialization-guard.js';
import { BundleProductModal } from './bundle-modal-component.js';


export class BundleWidgetFullPage {

  constructor(containerElement) {
    installControllerMethods(
      this,
      fullPageAnalyticsConfigMethods,
      fullPageInitialRenderMethods,
      fullPageResponsiveLayoutMethods,
      fullPageMobileSummaryMethods,
      fullPageSidePanelMethods,
      fullPageBoxSelectionSidebarMethods,
      fullPageTimelineBannerMethods,
      fullPageSearchCategoryMethods,
      fullPageProductGridMethods,
      fullPageProductCardFooterMethods,
      fullPageFooterSelectionMethods,
      fullPageValidationAddonsMethods,
      fullPageStepFooterMethods,
      fullPageDiscountModalMethods,
      fullPageClearCartConfirmationMethods,
      fullPageProductProcessingMethods,
      fullPageModalProductMethods,
      fullPageSelectionNavigationMethods,
      fullPageRuntimeCartSettingsMethods,
      fullPageTierFloatingRuntimeMethods,
      bundleLevelCssMethods,
    );
    this.container = containerElement;
    this.selectedBundle = null;
    this.selectedProducts = [];
    this.stepProductData = [];
    this.stepCollectionProductIds = {}; // { `${stepIndex}:${collectionHandle}`: [productId, ...] }
    this.selectedBoxSelectionRuleId = null;
    this.currentStepIndex = 0;
    this.isInitialized = false;
    this._isWidgetActionBusy = false;
    this.config = {};
    this.elements = {};
    this.compactMobileSummaryTrayExpanded = false;
    this.standardTimelineWindowStart = 0;
    this.standardTimelineLastActiveEntryIndex = 0;

    // Search state for filtering products within steps
    this.searchQuery = '';
    this.searchDebounceTimer = null;

    // Tier pill state
    this.tierConfig = [];
    this.activeTierIndex = 0;

    // Initialize product modal (if BundleProductModal is available)
    this.productModal = null;
    this.productModal = new BundleProductModal(this);

    // Call async init but don't block constructor
    this.init().catch(error => {
      this.showErrorUI(error);
    });
  }

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  getSharedSelectedQuantity() {
    return getSelectedQuantity({
      selectedProducts: this.selectedProducts,
      stepProductData: this.stepProductData,
    });
  }

  async init() {
    try {
      // Check if already initialized
      if (this.container.dataset.initialized === 'true') {
        return;
      }

      // Parse configuration
      this.parseConfiguration();
      await this.loadLanguageSettings();
      await this.loadControlsSettings();

      // Load and validate bundle data
      await this.loadBundleData();

      // Select appropriate bundle
      this.selectBundle();

      if (!this.selectedBundle) {
        this.hideLoadingOverlay();
        this.showFallbackUI();
        return;
      }

      // Merge bundle_settings metafield into selectedBundle (Settings design display settings)
      this._mergeBundleSettings(this.bundleSettings);
      this.applyPersonalizationAddonProducts();

      // Resolve tier config — prefer admin-saved (API) over legacy Theme Editor (data attribute)
      this.tierConfig = this.resolveTierConfig(
        this.selectedBundle.tierConfig ?? null,
        this.tierConfig
      );
      this.initTierPills(this.tierConfig);

      // Resolve showStepTimeline — prefer admin-saved (API) over Theme Editor data attribute
      this.config.showStepTimeline = this.resolveShowStepTimeline(
        this.selectedBundle.showStepTimeline ?? null,
        this.config.showStepTimeline
      );

      // Initialize data structures
      this.initializeDataStructures();

      // Setup DOM elements
      this.setupDOMElements();

      // Mark template/preset before first render so full-page selectors can
      // resolve immediately for both render paths.
      this.applyFullPageDesignPresetMarker();
      this.applyBundleLevelCss(this.selectedBundle);

      // Render initial UI (async for full-page bundles to load products)
      await this.renderUI();

      removeBootstrapSkeleton(this.container);

      // Hide overlay now that UI is fully rendered
      this.hideLoadingOverlay();

      // Storefront analytics: signal that the bundle has rendered and is interactive.
      this._emitStorefrontEvent('bundle-ready', { stepCount: this.selectedBundle?.steps?.length || 0 });

      // Attach event listeners
      this.attachEventListeners();

      // Render floating promo badge (if enabled and not session-dismissed)
      this._initFloatingBadge();

      this.container.dataset.initialized = 'true';
      this.isInitialized = true;

      // Fire-and-forget: record a view event for analytics (skip in Theme Editor preview)
      if (!window.Shopify?.designMode) {
        this._recordView();
      }

    } catch (error) {
      removeBootstrapSkeleton(this.container);
      this.hideLoadingOverlay();
      // Log full error to browser console for developer debugging
      console.error('[BundleWidget] Initialization failed:', error);
      // Fire-and-forget: send error to server for AppLogger tracking
      this._reportError(error);
      this.showErrorUI(error);
    } finally {
      delete this.container.dataset.initializing;
    }
  }

  // ========================================================================
  // STOREFRONT ANALYTICS EVENT TAXONOMY
  // ========================================================================
  // wpb:* CustomEvents dispatched on window so themes / GTM / Klaviyo / Meta
  // Pixel can forward to their analytics back-ends without app-side wiring.
  // Mirrors the external wpb-* event surface (see issue wpb-storefront-analytics-events-1).
  // ========================================================================


}

export interface BundleWidgetFullPage {
  [key: string]: any;
}

// ============================================================================
// INITIALIZATION
// ============================================================================
export function initializeFullPageWidget(root = document) {
  const containers = root.querySelectorAll('#bundle-builder-app');
  containers.forEach(container => {
    const bundleType = container.dataset.bundleType || 'full_page';
    if (bundleType === 'full_page' && claimFullPageWidgetInitialization(container)) {
      new BundleWidgetFullPage(container);
    }
  });
}
