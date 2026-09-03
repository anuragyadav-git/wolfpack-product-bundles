export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageStepFooterMethods } = require('../../../app/assets/widgets/full-page/methods/step-footer-methods.js');

function makeContext(pricing: any) {
  return {
    selectedBundle: { pricing },
    getBoxSelectionRules: () => [],
    getDiscountProgressState: fullPageStepFooterMethods.getDiscountProgressState,
  };
}

describe('fullPageStepFooterMethods.getDiscountProgressMilestones', () => {
  it('derives FPB quantity milestone labels and subtitles from actual discount rules', () => {
    const milestones = fullPageStepFooterMethods.getDiscountProgressMilestones.call(
      makeContext({
        method: 'percentage_off',
        rules: [
          {
            id: 'rule-3',
            conditionType: 'quantity',
            conditionValue: 3,
            discountValue: 10,
          },
        ],
      }),
      0,
      1,
    );

    expect(milestones).toEqual([
      {
        ruleId: 'rule-3',
        title: '3 Pack',
        subTitle: 'Save 10%',
        threshold: 3,
        conditionType: 'quantity',
        position: 100,
        state: 'active',
        isReached: false,
      },
    ]);
  });

  it('preserves configured merchant milestone text over generated fallback text', () => {
    const milestones = fullPageStepFooterMethods.getDiscountProgressMilestones.call(
      makeContext({
        method: 'percentage_off',
        messages: {
          tierTextByRuleId: {
            'rule-5': {
              tierText: '5 Pack',
              tierSubtext: 'Best value',
            },
          },
        },
        rules: [
          {
            id: 'rule-5',
            conditionType: 'quantity',
            conditionValue: 5,
            discountValue: 20,
          },
        ],
      }),
      0,
      5,
    );

    expect(milestones).toEqual([
      {
        ruleId: 'rule-5',
        title: '5 Pack',
        subTitle: 'Best value',
        threshold: 5,
        conditionType: 'quantity',
        position: 100,
        state: 'reached',
        isReached: true,
      },
    ]);
  });

  it.each([
    [0, 0],
    [1, 25],
    [2, 50],
    [3, 75],
    [4, 100],
  ])('interpolates quantity %s across evenly spaced tier segments', (quantity, expectedProgress) => {
    const context = makeContext({
      method: 'percentage_off',
      rules: [
        { id: 'rule-2', conditionType: 'quantity', conditionValue: 2, discountValue: 5 },
        { id: 'rule-4', conditionType: 'quantity', conditionValue: 4, discountValue: 15 },
      ],
    });

    const state = fullPageStepFooterMethods.getDiscountProgressState.call(context, 0, quantity);

    expect(state.progressPercent).toBe(expectedProgress);
    expect(state.milestones.map((milestone: any) => milestone.position)).toEqual([50, 100]);
  });

  it('uses amount rather than quantity for amount-based tier segments', () => {
    const context = makeContext({
      method: 'fixed_amount_off',
      rules: [
        { id: 'amount-10', conditionType: 'amount', conditionValue: 1000, discountValue: 100 },
        { id: 'amount-20', conditionType: 'amount', conditionValue: 2000, discountValue: 200 },
      ],
    });

    const state = fullPageStepFooterMethods.getDiscountProgressState.call(context, 1500, 99);

    expect(state.progressPercent).toBe(75);
    expect(state.milestones.map((milestone: any) => milestone.state)).toEqual(['reached', 'active']);
  });

  it('starts a mixed condition-type segment from zero', () => {
    const context = makeContext({
      method: 'percentage_off',
      rules: [
        { id: 'quantity-2', conditionType: 'quantity', conditionValue: 2, discountValue: 5 },
        { id: 'amount-100', conditionType: 'amount', conditionValue: 100, discountValue: 10 },
      ],
    });

    const state = fullPageStepFooterMethods.getDiscountProgressState.call(context, 50, 2);

    expect(state.progressPercent).toBe(50);
    expect(state.milestones.map((milestone: any) => milestone.state)).toEqual(['reached', 'active']);
  });

  it('marks the first unmet tier active and later tiers pending', () => {
    const context = makeContext({
      method: 'percentage_off',
      rules: [
        { id: 'rule-2', conditionType: 'quantity', conditionValue: 2, discountValue: 5 },
        { id: 'rule-4', conditionType: 'quantity', conditionValue: 4, discountValue: 15 },
      ],
    });

    const state = fullPageStepFooterMethods.getDiscountProgressState.call(context, 0, 0);

    expect(state.milestones.map((milestone: any) => milestone.state)).toEqual(['active', 'pending']);
  });
});
