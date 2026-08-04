// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  fullPageResponsiveLayoutMethods,
  getClassicSummaryPresentationMode,
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

describe('FPB Classic summary responsive ownership', () => {
  it.each([
    [1023, 'tray'],
    [600, 'tray'],
    [1024, 'sidebar'],
    [1440, 'sidebar'],
  ])('uses available widget width %ipx to choose %s', (availableWidth, expected) => {
    expect(getClassicSummaryPresentationMode({
      designPreset: 'CLASSIC',
      layout: 'footer_side',
      availableWidth,
    })).toBe(expected);
  });

  it.each([
    ['STANDARD', 'footer_side'],
    ['COMPACT', 'footer_side'],
    ['HORIZONTAL', 'footer_side'],
    ['CLASSIC', 'footer_bottom'],
  ])('does not override %s with %s layout', (designPreset, layout) => {
    expect(getClassicSummaryPresentationMode({
      designPreset,
      layout,
      availableWidth: 600,
    })).toBeNull();
  });

  it('applies one measured mode to the widget, layout, and tray owners', () => {
    const container = createAttributeTarget(600);
    const stepsContainer = createAttributeTarget();
    const tray = createAttributeTarget();

    const mode = fullPageResponsiveLayoutMethods._syncClassicSummaryPresentationMode.call({
      container,
      elements: { stepsContainer },
      mobileSummaryTrayElement: tray,
      getFullPageDesignPreset: () => 'CLASSIC',
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
