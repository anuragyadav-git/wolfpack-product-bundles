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
  } as any;
}

function createProgressionContext(
  selectedQuantity: number,
  autoProceedToNextRule: boolean | undefined = true,
) {
  return {
    selectedBoxSelectionRuleId: 'rule-2',
    selectedBundle: {
      boxSelection: {
        isEnabled: true,
        validateBoxSelectionQuantity: true,
        autoProceedToNextRule,
        rules: [
          { ruleId: 'rule-2', boxQuantity: 2, boxLabel: 'Two pack' },
          { ruleId: 'rule-4', boxQuantity: 4, boxLabel: 'Four pack' },
          { ruleId: 'rule-6', boxQuantity: 6, boxLabel: 'Six pack' },
        ],
      },
    },
    getAllSelectedProductsData: () => [{ quantity: selectedQuantity }],
    ...fullPageBoxSelectionSidebarMethods,
  } as any;
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

  it('keeps the current rule active until its quantity is exceeded', () => {
    const context = createProgressionContext(2);
    expect(context.getBoxSelectionValidationState().activeRule.ruleId).toBe('rule-2');
  });

  it('automatically advances to the next rule after the current quantity is exceeded', () => {
    const context = createProgressionContext(3);
    expect(context.getBoxSelectionValidationState()).toMatchObject({
      isEnabled: true,
      isValid: false,
      activeRule: { ruleId: 'rule-4', boxQuantity: 4 },
      totalQuantity: 3,
    });
  });

  it('advances across multiple rules when the selected quantity jumps', () => {
    const context = createProgressionContext(5);
    expect(context.getBoxSelectionValidationState().activeRule.ruleId).toBe('rule-6');
  });

  it('keeps the highest configured rule active when its quantity is exceeded', () => {
    const context = createProgressionContext(7);
    context.selectedBoxSelectionRuleId = 'rule-6';
    expect(context.getBoxSelectionValidationState().activeRule.ruleId).toBe('rule-6');
  });

  it('honors an explicit auto-progression opt-out', () => {
    const context = createProgressionContext(5, false);
    expect(context.getBoxSelectionValidationState().activeRule.ruleId).toBe('rule-2');
  });
});
