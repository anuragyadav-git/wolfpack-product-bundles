// eslint-disable-next-line @typescript-eslint/no-require-imports
const { resolveTierConfig } = require('../../../app/assets/widgets/full-page/methods/runtime-cart-settings-methods.js');

describe('FPB runtime tier resolution', () => {
  it('uses valid API tiers and maps linked bundle IDs', () => {
    expect(resolveTierConfig([
      { label: ' Two ', linkedBundleId: ' bundle-2 ' },
      { label: 'Four', linkedBundleId: 'bundle-4' },
    ], [{ label: 'Theme', bundleId: 'theme' }])).toEqual([
      { label: 'Two', bundleId: 'bundle-2' },
      { label: 'Four', bundleId: 'bundle-4' },
    ]);
  });

  it('uses Liquid tiers only when the API source is absent', () => {
    const liquidTiers = [{ label: 'Theme', bundleId: 'theme' }];
    expect(resolveTierConfig(null, liquidTiers)).toBe(liquidTiers);
    expect(resolveTierConfig([], liquidTiers)).toEqual([]);
  });
});
