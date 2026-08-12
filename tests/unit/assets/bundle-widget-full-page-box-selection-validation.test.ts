import { fullPageBoxSelectionSidebarMethods } from '../../../app/assets/widgets/full-page/methods/box-selection-sidebar-methods';

function createContext(selectedQuantity: number) {
  return {
    selectedBoxSelectionRuleId: 'rule-1',
    selectedBundle: {
      boxSelection: {
        isEnabled: true,
        validateBoxSelectionQuantity: true,
        rules: [{ ruleId: 'rule-1', boxQuantity: 3, boxLabel: 'Three pack' }],
      },
    },
    getAllSelectedProductsData: () => [{ quantity: selectedQuantity }],
    ...fullPageBoxSelectionSidebarMethods,
  };
}

describe('FPB box selection quantity validation runtime contract', () => {
  it('requires the active box quantity exactly', () => {
    expect(createContext(2).getBoxSelectionValidationState()).toMatchObject({ isEnabled: true, isValid: false });
    expect(createContext(3).getBoxSelectionValidationState()).toMatchObject({ isEnabled: true, isValid: true });
    expect(createContext(4).getBoxSelectionValidationState()).toMatchObject({ isEnabled: true, isValid: false });
  });

  it('uses validation state to gate checkout', () => {
    expect(createContext(2).canCheckoutWithBoxSelection()).toBe(false);
    expect(createContext(3).canCheckoutWithBoxSelection()).toBe(true);
  });
});
