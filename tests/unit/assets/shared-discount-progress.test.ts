// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getDiscountProgressData } = require('../../../app/assets/widgets/shared/engine/bundle-selectors.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  applyDiscountProgressTransition,
  readRenderedDiscountProgressPercent,
  renderDiscountProgress,
} = require('../../../app/assets/widgets/shared/components/discount-progress.js');

describe('shared discount progress data selector', () => {
  it('normalizes in-progress data', () => {
    expect(getDiscountProgressData({
      currentValue: 2,
      targetValue: 5,
      message: 'Add 3 more',
    })).toEqual({
      currentValue: 2,
      targetValue: 5,
      progressPercent: 40,
      message: 'Add 3 more',
      success: false,
    });
  });

  it('clamps over-complete data to 100 percent', () => {
    expect(getDiscountProgressData({
      currentValue: 7,
      targetValue: 5,
      message: 'Unlocked',
    })).toMatchObject({
      progressPercent: 100,
      success: true,
    });
  });

  it('handles zero target safely', () => {
    expect(getDiscountProgressData({
      currentValue: 2,
      targetValue: 0,
      message: 'No target',
    })).toMatchObject({
      progressPercent: 0,
      success: false,
    });
  });
});

describe('shared discount progress renderer', () => {
  it('escapes progress message text', () => {
    const view = renderDiscountProgress({
      currentValue: 1,
      targetValue: 2,
      progressPercent: 50,
      message: '<strong>Save</strong>',
      success: false,
    });

    expect(view).toContain('&lt;strong&gt;Save&lt;/strong&gt;');
    expect(view).not.toContain('<strong>Save</strong>');
  });

  it('renders semantic milestone states and target positions', () => {
    const view = renderDiscountProgress({
      progressPercent: 25,
      milestones: [
        { title: '2 Pack', subTitle: 'Save 5%', position: 50, state: 'active' },
        { title: '4 Pack', subTitle: 'Save 15%', position: 100, state: 'pending' },
      ],
    }, { mode: 'stepped' });

    expect(view).toContain('data-state="active"');
    expect(view).toContain('data-state="pending"');
    expect(view).toContain('--bw-discount-milestone-position:50%');
    expect(view).toContain('aria-valuenow="25"');
  });

  it('reads the currently visible fill percentage from rendered geometry', () => {
    const root = {
      querySelector: (selector: string) => selector.includes('fill')
        ? { getBoundingClientRect: () => ({ width: 75 }) }
        : { getBoundingClientRect: () => ({ width: 300 }), getAttribute: () => '10' },
    };

    expect(readRenderedDiscountProgressPercent(root)).toBe(25);
  });

  it('animates from the visible percentage to the new target after two frames', () => {
    const values: string[] = [];
    const frames: Array<() => void> = [];
    const progress = {
      style: { setProperty: (_name: string, value: string) => values.push(value) },
    };

    applyDiscountProgressTransition(progress, 25, 75, {
      requestAnimationFrame: (callback: () => void) => frames.push(callback),
      prefersReducedMotion: false,
    });
    expect(values.at(-1)).toBe('25%');
    frames.shift()?.();
    frames.shift()?.();
    expect(values.at(-1)).toBe('75%');
  });

  it('applies the target immediately when reduced motion is preferred', () => {
    const values: string[] = [];
    const progress = {
      style: { setProperty: (_name: string, value: string) => values.push(value) },
    };

    applyDiscountProgressTransition(progress, 25, 75, {
      requestAnimationFrame: jest.fn(),
      prefersReducedMotion: true,
    });

    expect(values.at(-1)).toBe('75%');
  });
});
