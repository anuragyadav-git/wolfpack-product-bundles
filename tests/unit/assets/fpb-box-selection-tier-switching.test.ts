export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  canSwitchBoxSelectionRule,
} = require('../../../app/assets/widgets/full-page/methods/box-selection-sidebar-methods.js');

describe('FPB box selection tier switching', () => {
  it('allows switching upward while retaining existing selections', () => {
    expect(canSwitchBoxSelectionRule(2, 3)).toBe(true);
  });

  it('allows selecting a tier that exactly fits existing selections', () => {
    expect(canSwitchBoxSelectionRule(2, 2)).toBe(true);
  });

  it('refuses switching downward below the existing selection count', () => {
    expect(canSwitchBoxSelectionRule(4, 2)).toBe(false);
  });
});
