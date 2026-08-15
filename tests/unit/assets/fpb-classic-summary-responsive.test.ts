// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  fullPageResponsiveLayoutMethods,
  getSummaryPresentationMode,
} = require('../../../app/assets/widgets/full-page/methods/responsive-layout-methods.js');

type AttributeTarget = {
  attributes: Record<string, string>;
  setAttribute: (name: string, value: string) => void;
};

function createAttributeTarget(width?: number): AttributeTarget & {
  appendChild: jest.Mock;
  getBoundingClientRect?: () => { width: number };
} {
  const target = {
    attributes: {},
    appendChild: jest.fn(),
    setAttribute(name: string, value: string) {
      this.attributes[name] = value;
    },
  } as AttributeTarget & {
    appendChild: jest.Mock;
    getBoundingClientRect?: () => { width: number };
  };

  if (width !== undefined) {
    target.getBoundingClientRect = () => ({ width });
  }

  return target;
}

describe('FPB all-template summary responsive ownership', () => {
  it.each(['STANDARD', 'CLASSIC', 'COMPACT', 'HORIZONTAL'])(
    'uses the measured 800px boundary for %s',
    (designPreset) => {
      expect(getSummaryPresentationMode({
        designPreset,
        layout: 'footer_side',
        availableWidth: 799,
      })).toBe('tray');
      expect(getSummaryPresentationMode({
        designPreset,
        layout: 'footer_side',
        availableWidth: 800,
      })).toBe('sidebar');
    },
  );

  it.each([
    ['STANDARD', 'footer_bottom'],
    ['CLASSIC', 'footer_bottom'],
    ['COMPACT', 'footer_bottom'],
    ['HORIZONTAL', 'footer_bottom'],
    ['UNKNOWN', 'footer_side'],
  ])('does not override %s with %s layout', (designPreset, layout) => {
    expect(getSummaryPresentationMode({
      designPreset,
      layout,
      availableWidth: 600,
    })).toBeNull();
  });

  it('applies one measured mode to the widget, layout, and tray owners', () => {
    const container = createAttributeTarget(600);
    const stepsContainer = createAttributeTarget();
    const tray = createAttributeTarget();

    const mode = fullPageResponsiveLayoutMethods._syncSummaryPresentationMode.call({
      container,
      elements: { stepsContainer },
      mobileSummaryTrayElement: tray,
      getFullPageDesignPreset: () => 'COMPACT',
      resolveFullPageLayout: () => 'footer_side',
    });

    expect(mode).toBe('tray');
    expect(container.attributes['data-fpb-summary-mode']).toBe('tray');
    expect(stepsContainer.attributes['data-fpb-summary-mode']).toBe('tray');
    expect(tray.attributes['data-fpb-summary-mode']).toBe('tray');
  });

  it('propagates measured mode changes through the existing ResizeObserver', () => {
    const originalResizeObserver = global.ResizeObserver;
    let availableWidth = 799;
    let resizeCallback: ResizeObserverCallback | undefined;
    const observe = jest.fn();

    global.ResizeObserver = class ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback;
      }

      observe = observe;
      disconnect = jest.fn();
      unobserve = jest.fn();
    };

    const container = createAttributeTarget();
    container.getBoundingClientRect = () => ({ width: availableWidth });
    const stepsContainer = createAttributeTarget();
    const tray = createAttributeTarget();
    const context = {
      container,
      elements: { stepsContainer },
      mobileSummaryTrayElement: tray,
      getFullPageDesignPreset: () => 'HORIZONTAL',
      resolveFullPageLayout: () => 'footer_side',
      _syncSummaryPresentationMode: fullPageResponsiveLayoutMethods._syncSummaryPresentationMode,
      _summaryResizeObserver: undefined,
    };

    try {
      fullPageResponsiveLayoutMethods._observeSummaryPresentationMode.call(context);

      expect(observe).toHaveBeenCalledWith(container);
      expect(container.attributes['data-fpb-summary-mode']).toBe('tray');

      availableWidth = 800;
      resizeCallback?.([], context._summaryResizeObserver as ResizeObserver);

      expect(container.attributes['data-fpb-summary-mode']).toBe('sidebar');
      expect(stepsContainer.attributes['data-fpb-summary-mode']).toBe('sidebar');
      expect(tray.attributes['data-fpb-summary-mode']).toBe('sidebar');
    } finally {
      global.ResizeObserver = originalResizeObserver;
    }
  });
});
