export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageAnalyticsConfigMethods } = require('../../../app/assets/widgets/full-page/methods/analytics-config-methods.js');
function makeWidgetContext(bundleConfig: unknown, bundleConfigSource?: string) {
  const context: any = {
    container: {
      dataset: {
        bundleType: 'full_page',
        bundleId: 'bundle-1',
        bundleConfig: JSON.stringify(bundleConfig),
        bundleConfigSource,
      },
    },
    bundleData: null,
    _bundleConfigCacheMode: 'none',
  };

  Object.assign(context, fullPageAnalyticsConfigMethods);
  return context;
}

describe('FPB full-page metafield cache', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses a complete app-proxy document payload without fetching bundle JSON', async () => {
    const proxyBundle = {
      id: 'bundle-1',
      bundleType: 'full_page',
      bundleDesignPresetId: 'CLASSIC',
      name: 'Daily Essentials',
      steps: [{ id: 'step-1', name: 'Choose Products', products: [] }],
      pricing: { discountType: 'percentage', discountValue: 10 },
    };
    const fetchSpy = jest.spyOn(global, 'fetch' as any);
    const widget = makeWidgetContext(proxyBundle, 'app_proxy');

    await widget.loadBundleData();

    expect(widget.bundleData).toEqual({ 'bundle-1': proxyBundle });
    expect(widget._bundleConfigCacheMode).toBe('app-proxy-inline');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('uses the app proxy when an untrusted full payload is present', async () => {
    const cachedBundle = {
      id: 'bundle-1',
      bundleType: 'full_page',
      bundleDesignPresetId: 'STANDARD',
      name: 'Daily Essentials',
      steps: [{ id: 'step-1', name: 'Choose Products', products: [] }],
    };
    const currentBundle = {
      id: 'bundle-1',
      bundleType: 'full_page',
      bundleDesignPresetId: 'CLASSIC',
      name: 'Daily Essentials',
      steps: [{ id: 'step-1', name: 'Full Size Earrings With A Very Long Classic Pill Label', products: [] }],
    };
    const fetchSpy = jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, bundle: currentBundle }),
    });
    const widget = makeWidgetContext(cachedBundle);

    await widget.loadBundleData();

    expect(widget.bundleData).toEqual({ 'bundle-1': currentBundle });
    expect(widget._bundleConfigCacheMode).toBe('proxy');
    expect(fetchSpy).toHaveBeenCalledWith('/apps/onlybundles/api/bundle/bundle-1.json');
  });

  it('hydrates through the app proxy when the cached payload is only a bootstrap pointer', async () => {
    const hydratedBundle = {
      id: 'bundle-1',
      bundleType: 'full_page',
      name: 'Daily Essentials',
      steps: [],
    };
    const fetchSpy = jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, bundle: hydratedBundle }),
    });
    const widget = makeWidgetContext({
      v: 2,
      type: 'full_page',
      bundleType: 'full_page',
      id: 'bundle-1',
    });

    await widget.loadBundleData();

    expect(widget.bundleData).toEqual({ 'bundle-1': hydratedBundle });
    expect(widget._bundleConfigCacheMode).toBe('proxy');
    expect(fetchSpy).toHaveBeenCalledWith('/apps/onlybundles/api/bundle/bundle-1.json');
  });

});
