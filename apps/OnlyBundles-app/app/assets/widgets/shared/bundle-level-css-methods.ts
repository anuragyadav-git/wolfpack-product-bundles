import { replaceManagedStyle } from './managed-style.js';

export const bundleLevelCssMethods: Record<string, any> & ThisType<any> = {
  getBundleLevelCssStyleId(bundleId: any) {
    const safeId = String(bundleId || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '-');
    return `wpb-bundle-level-css-${safeId}`;
  },

  removeExistingBundleLevelCss() {
    document
      .querySelectorAll('style[data-wpb-managed-style^="bundle-level-"]')
      .forEach((style) => style.remove());
  },

  applyBundleLevelCss(bundle: any) {
    this.removeExistingBundleLevelCss();

    const css = typeof bundle?.bundleLevelCss === 'string'
      ? bundle.bundleLevelCss.trim()
      : '';

    if (!css) return;
    const style = replaceManagedStyle(document, `bundle-level-${bundle.id || 'unknown'}`, css);
    if (style) style.id = this.getBundleLevelCssStyleId(bundle.id);
  },
};
