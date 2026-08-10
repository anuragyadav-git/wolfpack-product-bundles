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
