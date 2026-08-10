/**
 * Widget Installation Types
 *
 * Type definitions for widget installation service.
 */

export interface WidgetInstallationStatus {
  installed: boolean;
  themeId?: string;
  themeName?: string;
  lastChecked: Date;
}

export interface ThemeEditorDeepLink {
  url: string;
  template: string;
  bundleId?: string;
}

export interface ProductBundleWidgetStatus {
  widgetInstalled: boolean;
  installationLink?: string;
  productUrl?: string;
  configurationLink?: string;
  message: string;
  requiresOneTimeSetup: boolean;
}
