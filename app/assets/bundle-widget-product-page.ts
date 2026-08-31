/**
 * Bundle Widget - Product Page Version
 *
 * This widget is specifically for product page bundles with vertical step boxes layout.
 * It imports shared components and utilities from their owning modules.
 *
 * ============================================================================
 * ARCHITECTURE ROLE
 * ============================================================================
 * This is the THIRD file loaded for PRODUCT PAGE bundles:
 * 1. bundle-widget.js (loader) - Detects bundle type as 'product_page'
 * 2. widgets/shared modules - Provide shared utilities
 * 3. THIS FILE (product-page widget) - Implements product page UI/UX
 *
 * ============================================================================
 * WHEN THIS FILE IS LOADED
 * ============================================================================
 * This file loads when:
 * - Container has data-bundle-type="product_page", OR
 * - Container has no data-bundle-type attribute (DEFAULT for backward compatibility)
 *
 * Example container:
 * <div id="bundle-builder-app" data-bundle-type="product_page"></div>
 * OR
 * <div id="bundle-builder-app"></div>  <!-- Defaults to product_page -->
 *
 * ============================================================================
 * UI LAYOUT: VERTICAL STEP BOXES
 * ============================================================================
 * - Steps displayed as vertical accordion/collapsible sections
 * - One step visible at a time (step-by-step flow)
 * - Progress tracked with step completion indicators
 * - Best for: Product detail pages with limited vertical space
 *
 * ============================================================================
 * SHARED CODE IMPORTS
 * ============================================================================
 * Shared business logic is imported from its owning modules:
 * - Currency formatting
 * - Price calculations
 * - Discount logic
 * - Product card rendering
 * - Toast notifications
 *
 * This file ONLY contains:
 * - Product page specific UI rendering
 * - Vertical layout management
 * - Step navigation logic
 * - Event handlers for product page flow
 *
 * ============================================================================
 * BACKWARD COMPATIBILITY
 * ============================================================================
 * This is the DEFAULT widget loaded when:
 * - Existing merchants have no data-bundle-type attribute
 * - Ensures existing bundles continue working without changes
 * - No data migration or merchant action required
 *
 * @version 1.0.0
 * @author Only Bundles Team
 */

'use strict';

import { BUNDLE_WIDGET } from './widgets/shared/constants.js';
import { CurrencyManager } from './widgets/shared/currency-manager.js';
import { BundleDataManager } from './widgets/shared/bundle-data-manager.js';
import { PricingCalculator } from './widgets/shared/pricing-calculator.js';
import { ToastManager } from './widgets/shared/toast-manager.js';
import { TemplateManager } from './widgets/shared/template-manager.js';
import { ConditionValidator } from './widgets/shared/condition-validator.js';
import { createDefaultLoadingAnimation } from './widgets/shared/default-loading-animation.js';
import { hideLoadingOverlayElement, markLoadingOverlayVisible } from './widgets/shared/loading-overlay.js';
import { bundleLevelCssMethods } from './widgets/shared/bundle-level-css-methods.js';
import { modalSlotTemplateMethods } from './widgets/product-page/templates/modal-slot-template.js';
import { cascadeTemplateMethods } from './widgets/product-page/templates/cascade-template.js';
import { gridTemplateMethods } from './widgets/product-page/templates/grid-template.js';
import { ppbExpandSingleStepCategoriesAsSteps } from './widgets/product-page/single-step-categories.js';
import { getDiscountProgressData, getSelectedQuantity } from './widgets/shared/engine/bundle-selectors.js';
import { installControllerMethods } from './widgets/shared/controller-methods.js';
import { buildStorefrontApiPath } from '../config/storefront-proxy-routes.js';
import { ProductPageCartMethods } from './widgets/product-page/methods/cart-methods.js';
import { ProductPageModalMethods } from './widgets/product-page/methods/modal-methods.js';
import { ProductPageSelectionMethods } from './widgets/product-page/methods/selection-methods.js';
import { ProductPageProductDataMethods } from './widgets/product-page/methods/product-data-methods.js';
import { ProductPageSelectionDataMethods } from './widgets/product-page/methods/selection-data-methods.js';
import { ProductPageSelectionPersistenceMethods } from './widgets/product-page/methods/selection-persistence-methods.js';
import { ProductPageLayoutShellMethods } from './widgets/product-page/methods/layout-shell-methods.js';
import { ProductPageInpageRenderMethods } from './widgets/product-page/methods/inpage-render-methods.js';
import { ProductPageConfigLifecycleMethods } from './widgets/product-page/methods/config-lifecycle-methods.js';
import { ProductPageDefaultProductMethods } from './widgets/product-page/methods/default-product-methods.js';
import { ProductPageDomMethods } from './widgets/product-page/methods/dom-methods.js';
import { ProductPageFooterModalStateMethods } from './widgets/product-page/methods/footer-modal-state-methods.js';
import { ProductPageModalStateMethods } from './widgets/product-page/methods/modal-state-methods.js';
import { ProductPageWidgetMiscMethods } from './widgets/product-page/methods/widget-misc-methods.js';
import { renderBundlePurchaseOptions } from './widgets/shared/components/purchase-options.js';
import { bundleSubscriptionStorefrontMethods } from './widgets/shared/subscription-storefront-methods.js';
import { applyBrowsedProductPreselection } from './widgets/product-page/embed-preselection.js';
import { installDiscountTierPillFeedback } from './widgets/shared/discount-tier-feedback.js';
import { resolveSpecificLinkOfferStorefrontEligibility } from './widgets/shared/specific-link-offer-eligibility.js';

// ============================================================
// BOTTOM-SHEET HELPER FUNCTIONS (pure — exposed for unit tests)
// ============================================================

/**
 * Find the next incomplete non-default step after `fromIndex`.
 * Returns -1 when all remaining non-default steps are complete.
 */
function bsFindNextIncompleteStep(steps: string|any[], selectedProducts: any, validateFn: (arg0: any) => any, fromIndex: number) {
  for (let i = fromIndex + 1; i < steps.length; i++) {
    // Free gift and default steps are non-required — never auto-advance into them.
    // The free gift step has its own unlock flow; default steps are pre-filled.
    if (steps[i].isDefault || steps[i].isFreeGift) continue;
    if (!validateFn(i)) return i;
  }
  return -1;
}

function bsIsDefaultStep(step: any) { return !!step?.isDefault; }

function bsGetDiscountBadgeLabel(step: any) { return step?.discountBadgeLabel || null; }

// Export for unit tests
if (typeof window !== 'undefined') {
  window.__bsHelpers = {
    bsFindNextIncompleteStep,
    bsIsDefaultStep,
    bsGetDiscountBadgeLabel,
    ppbExpandSingleStepCategoriesAsSteps,
  };
}

export class BundleWidgetProductPage {

  constructor(containerElement: Element) {
    installControllerMethods(
      this,
      ProductPageConfigLifecycleMethods,
      ProductPageDefaultProductMethods,
      ProductPageDomMethods,
      ProductPageFooterModalStateMethods,
      ProductPageModalStateMethods,
      ProductPageWidgetMiscMethods,
      ProductPageLayoutShellMethods,
      ProductPageInpageRenderMethods,
      ProductPageProductDataMethods,
      ProductPageSelectionDataMethods,
      ProductPageSelectionPersistenceMethods,
      ProductPageModalMethods,
      ProductPageSelectionMethods,
      ProductPageCartMethods,
      bundleSubscriptionStorefrontMethods,
      bundleLevelCssMethods,
      modalSlotTemplateMethods,
      cascadeTemplateMethods,
      gridTemplateMethods,
    );
    this.container = containerElement;
    this._discountTierFeedbackCleanup = installDiscountTierPillFeedback(containerElement);
    this.selectedBundle = null;
    this.selectedProducts = [];
    this.selectedProductCategoryIndexes = [];
    this.stepProductData = [];
    this.directDefaultProducts = [];
    this.activeInpageCategoryIndexes = {};
    this.currentStepIndex = 0;
    this._selectionPersistenceReady = false;
    this.isInitialized = false;
    this.config = {};
    this.elements = {};
    this.selectedSellingPlanId = undefined;

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

  renderPurchaseOptions() {
    renderBundlePurchaseOptions(this);
  }

  refreshSubscriptionProductCardPrices() {
    this.renderUI?.();
  }

  async init() {
    try {
      // Check if already initialized
      if (this.container.dataset.initialized === 'true') {
        return;
      }

      // Parse configuration
      this.parseConfiguration();

      // Move the container into its final product-form placement before the
      // bootstrap overlay paints, so loading and rendered states share a slot.
      if (!this.config.isEmbedSource) this._relocateContainerToProductForm();

      // Show loading overlay immediately with fallback spinner while bundle config loads.
      this.showLoadingOverlay(null, { bootstrap: true });
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Load design settings CSS
      await this.loadDesignSettingsCSS();
      await this.loadLanguageSettings();
      await this.loadControlsSettings();

      // Load and validate bundle data
      await this.loadBundleData();

      // loadBundleData() hides the container and returns early on non-bundle products
      if (!this.bundleData) return;

      const storefrontBundle = this.bundleData[this.config.bundleId]
        || Object.values(this.bundleData)[0];
      const eligible = await resolveSpecificLinkOfferStorefrontEligibility({
        bundle: storefrontBundle,
        locationSearch: window.location.search,
      });
      if (!eligible) {
        this.hideLoadingOverlay();
        this.container.style.display = 'none';
        return;
      }

      // Select appropriate bundle
      this.selectBundle();

      if (this.selectedBundle?.loadingGif) {
        this.showLoadingOverlay(this.selectedBundle.loadingGif, { bootstrap: true });
      }

      if (!this.selectedBundle) {
        this.hideLoadingOverlay();
        this.showFallbackUI();
        return;
      }

      this._runProductPageLoadScriptOnce();

      // Initialize data structures
      this.initializeDataStructures();
      this._initDirectDefaultProducts();
      const restoredSelections = this._restoreSessionSelections();
      await this._preloadDirectDefaultProducts();

      if (
        this.config.isEmbedSource &&
        this.config.preselectBrowsedProduct &&
        !restoredSelections
      ) {
        await Promise.all(
          this.selectedBundle.steps.map((_: any, stepIndex: any) =>
            this.loadStepProducts(stepIndex).catch(() => {}),
          ),
        );
        applyBrowsedProductPreselection(this, true, false);
      }

      // Pre-load product data for default steps so filled cards show real image/title
      await this._preloadDefaultStepProducts();
      await this._preloadRestoredSelectionProducts();

      if (!this.config.isEmbedSource) {
        this._relocateContainerToProductForm();
        this._hideNativeProductPrice();
        this._hideNativeDynamicCheckoutControls();
      }

      // Setup DOM elements
      this.setupDOMElements();
      this._markProductPageTemplate();
      await this.ensureProductPageTemplateStylesheet(this._getProductPageTemplateType(), this._getProductPageDesignPreset());
      this.applyBundleLevelCss(this.selectedBundle);

      // Render initial UI
      this.renderUI();

      // Hide overlay now that UI is rendered
      this.hideLoadingOverlay();

      // Attach event listeners
      this.attachEventListeners();

      // Mark as initialized
      this.container.dataset.initialized = 'true';
      this.isInitialized = true;

      // Fire-and-forget: record a view event for analytics (skip in Theme Editor preview)
      if (!window.Shopify?.designMode) {
        this._recordView();
      }

    } catch (error: any) {
      this.hideLoadingOverlay();
      this.showErrorUI(error);
    }
  }

  /**
   * Load Settings design CSS
   * Injects custom CSS from Settings -> Design into the page
   */
  async loadDesignSettingsCSS() {
    try {
      // Get shop domain from bundle data or window
      const shopDomain = window.Shopify?.shop || this.container.dataset.shop;

      if (!shopDomain) {
        return;
      }

      // CSS is loaded by the small loader (bundle-widget.js) for better performance
      // No need to load it here - just verify it's present
      const existingLink = document.querySelector('link[href*="design-settings"]');
      if (existingLink) {
      } else {
      }

    } catch (error: any) {
      // Don't throw - widget should work even if design CSS fails to load
    }
  }

  async loadLanguageSettings() {
    return this.config.languageSettings || null;
  }

  async loadControlsSettings() {
    return this.config.controlsSettings || null;
  }


}

export interface BundleWidgetProductPage {
  [key: string]: any;
}

// ============================================================================
// INITIALIZATION
// ============================================================================
export function initializeProductPageWidget(root = document) {
  const containers = root.querySelectorAll<HTMLElement>('#bundle-builder-app');
  containers.forEach(container => {
    if (!container.dataset.initialized) {
      const bundleType = container.dataset.bundleType || 'product_page';
      if (bundleType === 'product_page') {
        new BundleWidgetProductPage(container);
      }
    }
  });
}
