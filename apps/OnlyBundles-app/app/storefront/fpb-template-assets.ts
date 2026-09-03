export type FpbDesignPreset = 'STANDARD' | 'CLASSIC' | 'COMPACT' | 'HORIZONTAL';

export function getFpbPresetStylesheetUrl(
  dataset: DOMStringMap,
  preset: FpbDesignPreset,
): string | undefined {
  switch (preset) {
    case 'STANDARD':
      return dataset.presetStandard;
    case 'CLASSIC':
      return dataset.presetClassic;
    case 'COMPACT':
      return dataset.presetCompact;
    case 'HORIZONTAL':
      return dataset.presetHorizontal;
  }
}

export function getFpbStylesheetUrls(
  dataset: DOMStringMap,
  preset: FpbDesignPreset,
): string[] {
  return [
    dataset.fullPageStyleUrl,
    dataset.mobileSummaryStyleUrl,
    dataset.responsiveStyleUrl,
    getFpbPresetStylesheetUrl(dataset, preset),
  ].filter((href): href is string => Boolean(href));
}
