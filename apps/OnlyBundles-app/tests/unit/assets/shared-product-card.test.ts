// eslint-disable-next-line @typescript-eslint/no-require-imports
const { JSDOM } = require('jsdom');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  getProductImageUrls,
  createSharedProductCardElement,
} = require('../../../app/assets/widgets/shared/components/product-card.js');

export {};

describe('shared product card data helpers', () => {
  it('normalizes product image URLs without duplicates', () => {
    expect(getProductImageUrls({
      imageUrl: 'https://cdn.example.test/primary.jpg',
      image: { src: 'https://cdn.example.test/primary.jpg' },
      featuredImage: { url: 'https://cdn.example.test/featured.jpg' },
      images: [
        { originalSrc: 'https://cdn.example.test/secondary.jpg' },
        { url: 'https://cdn.example.test/featured.jpg' },
        'https://cdn.example.test/third.jpg',
      ],
    })).toEqual([
      'https://cdn.example.test/primary.jpg',
      'https://cdn.example.test/featured.jpg',
      'https://cdn.example.test/secondary.jpg',
      'https://cdn.example.test/third.jpg',
    ]);
  });
});

describe('shared product card magnifier', () => {
  const createCard = (options: any = {}) => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    return createSharedProductCardElement(
      { selectionId: 'variant-1', title: 'Test product', price: 1000 },
      0,
      { display: { format: '${{amount}}' } },
      {
        ...options,
        document: dom.window.document,
      },
    );
  };

  it('renders an SVG magnifier icon inside .bw-product-card__magnifier when productDetailsEnabled is true', () => {
    const card = createCard({ productDetailsEnabled: true });
    const magnifier = card.querySelector('.bw-product-card__magnifier');
    expect(magnifier).not.toBeNull();
    const svg = magnifier?.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.querySelector('circle')).not.toBeNull();
    expect(svg?.querySelector('path')).not.toBeNull();
  });

  it('does not render magnifier overlay when productDetailsEnabled is false', () => {
    const card = createCard({ productDetailsEnabled: false });
    expect(card.querySelector('.bw-product-card__image-overlay')).toBeNull();
    expect(card.querySelector('.bw-product-card__magnifier')).toBeNull();
  });
});
