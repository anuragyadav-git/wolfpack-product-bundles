// eslint-disable-next-line @typescript-eslint/no-require-imports
const { JSDOM } = require('jsdom');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  getProductImageUrls,
  createSharedProductCardElement,
  formatProductCardPrice,
} = require('../../../app/assets/widgets/shared/components/product-card.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  fullPageProductCardFooterMethods,
} = require('../../../app/assets/widgets/full-page/methods/product-card-footer-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  CurrencyManager,
} = require('../../../app/assets/widgets/shared/currency-manager.js');

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

  it('formats product and compare-at money with the presentment currency code', () => {
    const document = new JSDOM('<!doctype html>').window.document;
    const card = createSharedProductCardElement(
      {
        selectionId: 'variant-1',
        title: 'Euro product',
        price: 1299,
        currencyCode: 'EUR',
        compareAtPrice: 1599,
        compareAtCurrencyCode: 'EUR',
      },
      0,
      { display: { code: 'USD' } },
      { document },
    );
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'EUR',
    });

    expect(card.textContent).toContain(formatter.format(12.99));
    expect(card.textContent).toContain(formatter.format(15.99));
    expect(card.textContent).not.toContain('$');
  });

  it('converts base currency amount to presentment currency when isMultiCurrency is active and currencyCode is absent', () => {
    const currencyInfo = {
      calculation: { code: 'AUD' },
      display: { code: 'INR', symbol: '₹', rate: 69.695988 },
      isMultiCurrency: true,
      locale: 'en-IN',
    };

    // 2000 cents AUD ($20 AUD) * 69.695988 = 139392 cents INR = ₹1,393.92
    const formatted = formatProductCardPrice(2000, null, currencyInfo);
    expect(formatted).toMatch(/₹\s*1,393\.92/);
  });

  it('does not double-convert when currencyCode matches presentment currency', () => {
    const currencyInfo = {
      calculation: { code: 'AUD' },
      display: { code: 'INR', symbol: '₹', rate: 69.695988 },
      isMultiCurrency: true,
      locale: 'en-IN',
    };

    // 140000 cents INR (already in INR)
    const formatted = formatProductCardPrice(140000, 'INR', currencyInfo);
    expect(formatted).toMatch(/₹\s*1,400\.00/);
  });

  it('formats base currency amount directly when isMultiCurrency is false', () => {
    const currencyInfo = {
      calculation: { code: 'AUD' },
      display: { code: 'AUD', symbol: '$', rate: 1 },
      isMultiCurrency: false,
      locale: 'en-AU',
    };

    const formatted = formatProductCardPrice(2000, null, currencyInfo);
    expect(formatted).toBe('$20.00');
  });

  it('returns empty string for null or empty price values', () => {
    expect(formatProductCardPrice(null, 'USD', { display: { code: 'USD' } })).toBe('');
    expect(formatProductCardPrice('', 'USD', { display: { code: 'USD' } })).toBe('');
  });

  it.each(['USD', 'CAD', 'AUD', 'NZD', 'SGD'])(
    'uses the compact native symbol for %s product-card prices',
    (currencyCode) => {
      const document = new JSDOM('<!doctype html>').window.document;
      const card = createSharedProductCardElement(
        {
          selectionId: `variant-${currencyCode}`,
          title: `${currencyCode} product`,
          price: 1299,
          currencyCode,
          compareAtPrice: 1599,
          compareAtCurrencyCode: currencyCode,
        },
        0,
        { display: { code: currencyCode }, locale: 'en-GB' },
        { document },
      );

      expect(card.textContent).toContain('$12.99');
      expect(card.textContent).toContain('$15.99');
      expect(card.textContent).not.toMatch(/(?:US|CA|A|NZ|SG)\$/);
    },
  );

  it('keeps the compact native currency symbol after an FPB variant change', () => {
    const document = new JSDOM('<!doctype html>').window.document;
    const card = createSharedProductCardElement(
      {
        selectionId: 'variant-black',
        title: 'T-Shirt',
        price: 3000,
        currencyCode: 'USD',
      },
      0,
      { display: { code: 'USD' }, locale: 'en-CA' },
      { document },
    );
    const currencySpy = jest.spyOn(CurrencyManager, 'getCurrencyInfo').mockReturnValue({
      calculation: { code: 'USD', rate: 1 },
      display: { code: 'USD', symbol: '$', rate: 1 },
      isMultiCurrency: false,
      locale: 'en-CA',
    });

    fullPageProductCardFooterMethods.updateProductCardVariantDisplay.call({
      buildPaidAddonProductDisplayData: (product: any) => product,
      selectedBundle: null,
      selectedSellingPlanId: null,
    }, card, {
      selectionId: 'variant-navy',
      title: 'T-Shirt',
      price: 3000,
      currencyCode: 'USD',
    }, {});

    expect(card.querySelector('.product-price')?.textContent).toBe('$30.00');
    expect(card.querySelector('.product-price')?.textContent).not.toBe('US$30.00');
    currencySpy.mockRestore();
  });
});

describe('shared product card magnifier', () => {
  const createCard = (options: any = {}) => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    return createSharedProductCardElement(
      { selectionId: 'variant-1', title: 'Test product', price: 1000 },
      0,
      { display: { code: 'USD' } },
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

describe('shared product card reading order', () => {
  it('places variant controls before price and Add controls', () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const selector = dom.window.document.createElement('select');
    selector.setAttribute('aria-label', 'Color');
    selector.append(new dom.window.Option('Black', 'black'));

    const card = createSharedProductCardElement(
      {
        selectionId: 'variant-black',
        title: 'T-Shirt',
        price: 3000,
        currencyCode: 'USD',
      },
      0,
      { display: { code: 'USD' } },
      {
        document: dom.window.document,
        variantSelectorElement: selector,
        addButtonText: 'Add',
      },
    );

    const selectorRegion = card.querySelector('[data-bw-product-selector="true"]');
    const priceRegion = card.querySelector('[data-bw-card-price="true"]');
    const actionRegion = card.querySelector('[data-bw-card-action="true"]');
    const follows = dom.window.Node.DOCUMENT_POSITION_FOLLOWING;

    expect(selectorRegion).not.toBeNull();
    expect(priceRegion).not.toBeNull();
    expect(actionRegion).not.toBeNull();
    expect(selectorRegion!.compareDocumentPosition(priceRegion!) & follows).toBe(follows);
    expect(priceRegion!.compareDocumentPosition(actionRegion!) & follows).toBe(follows);
  });
});
