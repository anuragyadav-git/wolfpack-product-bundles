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
    'uses the measured 1024px boundary for %s',
    (designPreset) => {
      expect(getSummaryPresentationMode({
        designPreset,
        layout: 'footer_side',
        availableWidth: 1023,
      })).toBe('tray');
      expect(getSummaryPresentationMode({
        designPreset,
        layout: 'footer_side',
        availableWidth: 1024,
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

  it('mounts the compact summary tray inside the widget root', () => {
    const container = createAttributeTarget();
    const tray = createAttributeTarget();

    fullPageResponsiveLayoutMethods._mountCompactMobileSummaryTray.call(
      { container },
      tray,
    );

    expect(container.appendChild).toHaveBeenCalledWith(tray);
  });
});
