export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { JSDOM } = require('jsdom');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  resolveCanonicalOptionValueSwatch,
  VariantSelectorComponent,
} = require('../../../app/assets/widgets/shared/variant-selector.js');

function createFpbProduct() {
  return {
    id: 'gid://shopify/Product/1',
    variantId: 'variant-red-small',
    price: 1000,
    imageUrl: 'https://cdn.example/red-small.jpg',
    options: ['Color', 'Size'],
    variants: [
      {
        id: 'variant-red-small',
        title: 'Red / Small',
        option1: 'Red',
        option2: 'Small',
        price: 1000,
        available: true,
        image: { url: 'https://cdn.example/red-small.jpg' },
      },
      {
        id: 'variant-red-large',
        title: 'Red / Extraordinarily long large size',
        option1: 'Red',
        option2: 'Extraordinarily long large size',
        price: 1200,
        available: true,
        image: { url: 'https://cdn.example/red-large.jpg' },
      },
      {
        id: 'variant-blue-small',
        title: 'Blue / Small',
        option1: 'Blue',
        option2: 'Small',
        price: 1100,
        available: false,
        image: { url: 'https://cdn.example/blue-small.jpg' },
      },
    ],
  };
}

describe('Direction A FPB variant selector behavior', () => {
  it('keeps one pill dimension visible and compacts the second dimension into a native select', () => {
    const runtimeDocument = new JSDOM('<!doctype html><html><body></body></html>').window.document;
    const selector = VariantSelectorComponent.createConfiguredElement(
      createFpbProduct(),
      'Color',
      { variantSelectorMode: 'pill' },
      runtimeDocument,
    );

    expect(selector.querySelectorAll('[role="radiogroup"]')).toHaveLength(1);
    expect(selector.querySelector('[role="radiogroup"]').getAttribute('aria-label')).toBe('Color');
    expect(selector.querySelectorAll('select')).toHaveLength(1);
    expect(selector.querySelector('select').getAttribute('aria-label')).toBe('Size');
  });

  it('uses Shopify color swatches for the visual dimension and a select for the other dimension', () => {
    const runtimeDocument = new JSDOM('<!doctype html><html><body></body></html>').window.document;
    const product: any = createFpbProduct();
    product.options = [
      {
        name: 'Color',
        optionValues: [
          { name: 'Red', swatch: { color: '#ff0000', image: null } },
          { name: 'Blue', swatch: { color: '#0000ff', image: null } },
        ],
      },
      { name: 'Size', optionValues: [] },
    ];

    const selector = VariantSelectorComponent.createConfiguredElement(
      product,
      'Color',
      { variantSelectorMode: 'color_swatch', swatchTooltipEnabled: true },
      runtimeDocument,
    );

    expect(selector.querySelectorAll('[data-swatch-kind="color"]')).toHaveLength(2);
    expect(selector.querySelectorAll('select')).toHaveLength(1);
    expect(selector.querySelector('select').getAttribute('aria-label')).toBe('Size');
  });

  it('uses Shopify image swatches for the visual dimension and a select for the other dimension', () => {
    const runtimeDocument = new JSDOM('<!doctype html><html><body></body></html>').window.document;
    const product: any = createFpbProduct();
    product.options = [
      {
        name: 'Color',
        optionValues: [
          {
            name: 'Red',
            swatch: {
              color: null,
              image: { previewImage: { url: 'https://cdn.example/red-swatch.jpg' } },
            },
          },
          {
            name: 'Blue',
            swatch: {
              color: null,
              image: { previewImage: { url: 'https://cdn.example/blue-swatch.jpg' } },
            },
          },
        ],
      },
      { name: 'Size', optionValues: [] },
    ];

    const selector = VariantSelectorComponent.createConfiguredElement(
      product,
      'Color',
      { variantSelectorMode: 'image_swatch', swatchTooltipEnabled: true },
      runtimeDocument,
    );

    expect(selector.querySelectorAll('[data-swatch-kind="image"]')).toHaveLength(2);
    expect(selector.querySelector('img')?.getAttribute('src')).toBe(
      'https://cdn.example/red-swatch.jpg',
    );
    expect(selector.querySelectorAll('select')).toHaveLength(1);
    expect(selector.querySelector('select').getAttribute('aria-label')).toBe('Size');
  });

  it('coordinates native select changes with the selected pill dimension', () => {
    const dom = new JSDOM('<!doctype html><html><body><article></article></body></html>');
    const runtimeDocument = dom.window.document;
    const card = runtimeDocument.querySelector('article');
    const product = createFpbProduct();
    const callback = jest.fn();
    card.append(VariantSelectorComponent.createConfiguredElement(
      product,
      'Color',
      { variantSelectorMode: 'pill' },
      runtimeDocument,
    ));
    VariantSelectorComponent.attachListeners(card, product, callback);

    const size = card.querySelector('select[aria-label="Size"]');
    size.value = 'Extraordinarily long large size';
    size.dispatchEvent(new dom.window.Event('change', { bubbles: true }));

    expect(callback).toHaveBeenCalledWith('variant-red-large', 'variant-red-small');
    expect(product.variantId).toBe('variant-red-large');
    expect(card.querySelector('input[value="Red"]').checked).toBe(true);
  });

  it('uses only Shopify option-value swatches and never infers colors from labels', () => {
    const product = {
      options: [{
        name: 'Color',
        optionValues: [
          { name: 'Navy', swatch: { color: '#001F3F', image: null } },
          { name: 'Pattern', swatch: { color: null, image: { previewImage: { url: 'https://cdn.example/pattern.jpg' } } } },
          { name: 'Black', swatch: null },
        ],
      }],
    };

    expect(resolveCanonicalOptionValueSwatch(product, 'Color', 'Navy')).toEqual({
      color: '#001F3F',
      image: null,
      label: 'Navy',
    });
    expect(resolveCanonicalOptionValueSwatch(product, 'Color', 'Pattern')).toEqual({
      color: null,
      image: { previewImage: { url: 'https://cdn.example/pattern.jpg' } },
      label: 'Pattern',
    });
    expect(resolveCanonicalOptionValueSwatch(product, 'Color', 'Black')).toBeNull();
    expect(resolveCanonicalOptionValueSwatch({ options: ['Color'] }, 'Color', 'Navy')).toBeNull();
  });

  it('renders every option dimension as a labeled radio group and retains unavailable values', () => {
    const runtimeDocument = new JSDOM('<!doctype html><html><body></body></html>').window.document;
    const selector = VariantSelectorComponent.createElement(
      createFpbProduct(),
      'Color',
      runtimeDocument,
    );

    const groups = selector.querySelectorAll('[role="radiogroup"]');
    expect(groups).toHaveLength(2);
    expect(selector.querySelector(`#${groups[0].getAttribute('aria-labelledby')}`).textContent).toBe('Color');
    expect(selector.querySelector(`#${groups[1].getAttribute('aria-labelledby')}`).textContent).toBe('Size');

    const values = Array.from(selector.querySelectorAll('input[type="radio"]'))
      .map((input: any) => input.value);
    expect(values).toEqual([
      'Red',
      'Blue',
      'Small',
      'Extraordinarily long large size',
    ]);
    expect(selector.querySelector('input[value="Blue"]').disabled).toBe(true);
  });

  it('does not hide a twelve-value dimension behind a disclosure control', () => {
    const runtimeDocument = new JSDOM('<!doctype html><html><body></body></html>').window.document;
    const product = {
      id: 'many-values',
      variantId: 'variant-1',
      options: ['Size'],
      variants: Array.from({ length: 12 }, (_, index) => ({
        id: `variant-${index + 1}`,
        option1: `Size ${index + 1}`,
        title: `Size ${index + 1}`,
        available: true,
      })),
    };

    const selector = VariantSelectorComponent.createElement(product, 'Size', runtimeDocument);

    expect(selector.querySelectorAll('input[type="radio"]')).toHaveLength(12);
    expect(selector.querySelectorAll('button')).toHaveLength(0);
  });

  it('updates the active variant once and keeps selector activation inside the card', () => {
    const dom = new JSDOM('<!doctype html><html><body><article></article></body></html>');
    const runtimeDocument = dom.window.document;
    const card = runtimeDocument.querySelector('article');
    const product = createFpbProduct();
    const callback = jest.fn();
    const cardClick = jest.fn();
    card.addEventListener('click', cardClick);
    card.append(VariantSelectorComponent.createElement(product, 'Color', runtimeDocument));
    VariantSelectorComponent.attachListeners(card, product, callback);

    const input = card.querySelector('input[value="Extraordinarily long large size"]');
    input.checked = true;
    input.dispatchEvent(new dom.window.Event('change', { bubbles: true }));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('variant-red-large', 'variant-red-small');
    expect(product.variantId).toBe('variant-red-large');
    expect(product.price).toBe(1200);
    expect(product.imageUrl).toBe('https://cdn.example/red-large.jpg');
    expect(cardClick).not.toHaveBeenCalled();
  });

  it('uses unique radio identities when the same product is rendered more than once', () => {
    const runtimeDocument = new JSDOM('<!doctype html><html><body></body></html>').window.document;
    const first = VariantSelectorComponent.createElement(createFpbProduct(), 'Color', runtimeDocument);
    const second = VariantSelectorComponent.createElement(createFpbProduct(), 'Color', runtimeDocument);
    const firstInputs = Array.from(first.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    const secondInputs = Array.from(second.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];

    expect(new Set([...firstInputs, ...secondInputs].map((input) => input.id)).size)
      .toBe(firstInputs.length + secondInputs.length);
    expect(new Set(firstInputs.map((input) => input.name)))
      .not.toEqual(new Set(secondInputs.map((input) => input.name)));
  });

  it('keeps unavailable variants in the native dropdown with disabled semantics', () => {
    const runtimeDocument = new JSDOM('<!doctype html><html><body></body></html>').window.document;
    const selector = VariantSelectorComponent.createDropdownElement(
      createFpbProduct(),
      'Color',
      { document: runtimeDocument, hideUnavailable: true },
    );

    const unavailable = selector.querySelector('[data-variant-id="variant-blue-small"]');
    expect(unavailable).not.toBeNull();
    expect(unavailable.getAttribute('aria-disabled')).toBe('true');
  });
});
