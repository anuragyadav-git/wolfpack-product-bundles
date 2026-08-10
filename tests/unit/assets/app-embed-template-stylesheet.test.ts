import { getFpbPresetStylesheetUrl } from '../../../app/storefront/fpb-template-assets';

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
    expect(getFpbPresetStylesheetUrl({} as DOMStringMap, 'STANDARD')).toBeUndefined();
  });
});
