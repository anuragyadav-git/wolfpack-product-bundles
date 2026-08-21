// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  resolveSelectedSlotContent,
  resolveSelectedSlotTitle,
} = require('../../../app/assets/widgets/product-page/methods/inpage-render-methods.js');

describe('PPB selected-slot content', () => {
  beforeEach(() => {
    (globalThis as any).window = {
      Shopify: {
        currency: { active: 'USD', format: '${{amount}}', rate: 1 },
        shop: { currency: 'USD' },
      },
      shopMoneyFormat: '${{amount}}',
    };
  });

  it('separates an expanded product title from its meaningful variant', () => {
    expect(resolveSelectedSlotContent({
      title: 'Obsidian Earrings - Gold',
      parentTitle: 'Obsidian Earrings',
      variantTitle: 'Gold',
      price: 82900,
      compareAtPrice: 99900,
    })).toEqual({
      title: 'Obsidian Earrings',
      variantTitle: 'Gold',
      priceText: '$829.00',
      compareAtPriceText: '$999.00',
    });
  });

  it('omits default variants and redundant compare-at prices', () => {
    expect(resolveSelectedSlotContent({
      title: 'Obsidian Earrings',
      variantTitle: 'Default Title',
      price: 82900,
      compareAtPrice: 82900,
    })).toEqual({
      title: 'Obsidian Earrings',
      variantTitle: '',
      priceText: '$829.00',
      compareAtPriceText: '',
    });
  });

  it.each([
    { compareAtPrice: null },
    { compareAtPrice: 0 },
    { compareAtPrice: 80000 },
  ])('hides compare-at when it is not an available higher retail price', ({ compareAtPrice }: any) => {
    expect(resolveSelectedSlotContent({
      title: 'Obsidian Earrings',
      price: 82900,
      compareAtPrice,
    }).compareAtPriceText).toBe('');
  });

  it('keeps a long Horizontal title intact for CSS-owned clamping', () => {
    const title = '14k Dangling Obsidian Earrings';
    expect(resolveSelectedSlotTitle(title, false)).toBe(title);
  });
});
export {};
