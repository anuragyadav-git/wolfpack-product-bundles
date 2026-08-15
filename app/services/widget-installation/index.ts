/**
 * Widget Installation Module - Re-exports for easy importing
 *
 * Provides widget installation detection and deep linking for Theme App Extensions.
 * Compliant with Shopify App Store policies - NO programmatic theme modifications.
 *
 * @see https://shopify.dev/docs/apps/build/online-store/theme-app-extensions
 */

// Main service class
export { WidgetInstallationService } from './widget-installation-core.server';

// Types
export type {
  WidgetInstallationStatus,
  ThemeEditorDeepLink,
  ProductBundleWidgetStatus,
} from './types';

// Theme editor deep link functions (for direct access)
export {
  generateThemeEditorDeepLink,
  generateProductBundleInstallationLink,
  generateProductBundleConfigurationLink
} from './widget-theme-editor-links.server';

// Product bundle operations (for direct access)
export { validateProductBundleWidgetSetup } from './widget-product-bundle.server';
