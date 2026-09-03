import {
  getFpbPresetStylesheetUrl,
  getFpbStylesheetUrls,
} from '../../../app/storefront/fpb-template-assets';

describe('FPB app-embed template stylesheet resolution', () => {
  const dataset = {
    presetStandard: 'standard.css',
    presetClassic: 'classic.css',
    presetCompact: 'compact.css',
    presetHorizontal: 'horizontal.css',
  } as DOMStringMap;

  it.each([
    ['STANDARD', 'standard.css'],
    ['CLASSIC', 'classic.css'],
    ['COMPACT', 'compact.css'],
    ['HORIZONTAL', 'horizontal.css'],
  ] as const)('resolves the %s stylesheet URL', (preset, expectedUrl) => {
    expect(getFpbPresetStylesheetUrl(dataset, preset)).toBe(expectedUrl);
  });

  it('returns undefined when the preset asset is absent', () => {
    expect(
      getFpbPresetStylesheetUrl({} as DOMStringMap, 'STANDARD')
    ).toBeUndefined();
  });

  it.each(['STANDARD', 'CLASSIC', 'COMPACT', 'HORIZONTAL'] as const)(
    'composes shared assets before the %s override asset',
    (preset) => {
      const composedDataset = {
        ...dataset,
        fullPageStyleUrl: 'base.css',
        mobileSummaryStyleUrl: 'mobile-summary.css',
        responsiveStyleUrl: 'responsive.css',
      } as DOMStringMap;

      expect(getFpbStylesheetUrls(composedDataset, preset)).toEqual([
        'base.css',
        'mobile-summary.css',
        'responsive.css',
        getFpbPresetStylesheetUrl(dataset, preset),
      ]);
    }
  );

  it('omits missing stylesheet URLs while preserving cascade order', () => {
    expect(
      getFpbStylesheetUrls(
        {
          fullPageStyleUrl: 'base.css',
          responsiveStyleUrl: 'responsive.css',
          presetStandard: 'standard.css',
        } as DOMStringMap,
        'STANDARD'
      )
    ).toEqual(['base.css', 'responsive.css', 'standard.css']);
  });

  it('does not append a duplicate stylesheet link while an existing link is still loading', () => {
    const originalDocument = global.document;
    const originalWindow = global.window;
    const existingHref = 'https://cdn.example.test/fpb-standard.css';
    const links = [
      {
        href: existingHref,
        getAttribute: (name: string) => (name === 'href' ? existingHref : null),
      },
    ];
    const append = jest.fn();

    try {
      global.document = {
        querySelector: jest.fn(() => null),
        querySelectorAll: jest.fn(() => links),
        createElement: jest.fn(() => ({ dataset: {} })),
        head: { append },
        body: { append: jest.fn() },
        readyState: 'complete',
        addEventListener: jest.fn(),
      } as unknown as Document;
      global.window = {} as Window & typeof globalThis;
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ensureStylesheet } = require('../../../app/storefront/app-embed');

      ensureStylesheet(existingHref);

      expect(append).not.toHaveBeenCalled();
    } finally {
      global.document = originalDocument;
      global.window = originalWindow;
      jest.resetModules();
    }
  });
});
