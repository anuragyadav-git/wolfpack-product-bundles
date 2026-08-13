/**
 * Widget Installation Service - Core
 *
 * Main service class that composes all widget installation functionality.
 * Provides widget installation detection and deep linking for Theme App Extensions.
 * Compliant with Shopify App Store policies - NO programmatic theme modifications.
 *
 * @see https://shopify.dev/docs/apps/build/online-store/theme-app-extensions
 */

// Import module functions
import {
  generateThemeEditorDeepLink,
  generateProductBundleInstallationLink,
  generateProductBundleConfigurationLink
} from "./widget-theme-editor-links.server";
import { validateProductBundleWidgetSetup } from "./widget-product-bundle.server";
/**
 * Widget Installation Service
 *
 * Static class that provides all widget installation functionality.
 * Methods are organized into categories:
 * - Deep Link Generation (Theme Editor Navigation)
 * - Product Bundle Operations
 */
export class WidgetInstallationService {

  // ==========================================================================
  // Deep Link Generation (Theme Editor Navigation)
  // ==========================================================================

  /**
   * Generate theme editor deep link with bundle ID pre-population
   */
  static generateThemeEditorDeepLink = generateThemeEditorDeepLink;

  /**
   * Generate installation link for a specific bundle on product pages
   */
  static generateProductBundleInstallationLink = generateProductBundleInstallationLink;

  /**
   * Generate configuration link for bundle on a specific product
   */
  static generateProductBundleConfigurationLink = generateProductBundleConfigurationLink;

  // ==========================================================================
  // Product Bundle Operations (Production-Ready)
  // ==========================================================================

  /**
   * Validate product bundle widget setup and provide guidance
   */
  static validateProductBundleWidgetSetup = validateProductBundleWidgetSetup;

}
