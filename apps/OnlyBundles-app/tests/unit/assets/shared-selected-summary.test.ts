import { JSDOM } from 'jsdom';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createSelectedProductRowElement } = require('../../../app/assets/widgets/shared/components/selected-product-row.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createSelectedProductSlotsElement } = require('../../../app/assets/widgets/shared/components/selected-product-slots.js');

function createDocument() {
  return new JSDOM('<!doctype html><html><body></body></html>').window.document;
}

describe('shared selected product row contract', () => {
  it('renders a removable selected row from prepared data', () => {
    const row = createSelectedProductRowElement({
      selectionId: 'variant-1',
      title: 'The Complete Snowboard',
      variantTitle: 'Ice',
      imageUrl: 'https://cdn.example.com/snowboard.jpg',
      quantity: 2,
      priceText: '$699.95',
    }, { document: createDocument() });

    const remove = row.querySelector('[data-action="remove-selected-product"]');
    const quantity = row.querySelector('[aria-label="Quantity 2"]');
    expect(remove?.getAttribute('data-variant-id')).toBe('variant-1');
    expect(row.textContent).toMatch(/The Complete Snowboard/);
    expect(row.textContent).toMatch(/Ice/);
    expect(quantity?.textContent).toBe('x2');
    expect(row.textContent).not.toMatch(/Remove/);
    expect(row.textContent).toMatch(/\$699\.95/);
  });

  it('marks default rows as included and non-removable', () => {
    const row = createSelectedProductRowElement({
      selectionId: 'variant-1',
      title: 'Included product',
      quantity: 1,
      isDefault: true,
    }, { document: createDocument() });

    expect(row.textContent).toMatch(/Included/);
    expect(row.querySelector('[data-action="remove-selected-product"]')).toBeNull();
  });

  it('renders an empty skeleton row', () => {
    const row = createSelectedProductRowElement(null, {
      emptyLabel: 'Choose an item',
      document: createDocument(),
    });

    expect(row.textContent).toMatch(/Choose an item/);
    expect(row.querySelector('[data-action="remove-selected-product"]')).toBeNull();
  });

  it('escapes row text', () => {
    const row = createSelectedProductRowElement({
      selectionId: 'variant-1',
      title: '<strong>Snowboard</strong>',
      quantity: 1,
    }, { document: createDocument() });

    expect(row.textContent).toMatch(/<strong>Snowboard<\/strong>/);
    expect(row.querySelector('strong')).toBeNull();
  });
});

describe('shared selected product slots contract', () => {
  it('renders empty, filled, default, and locked free-gift slots', () => {
    const slots = createSelectedProductSlotsElement([
      { id: 'slot-1', label: 'Choose first item' },
      { id: 'slot-2', label: 'Selected item', product: { selectionId: 'variant-2', title: 'Selected Snowboard', quantity: 1 } },
      { id: 'slot-3', label: 'Included item', product: { selectionId: 'variant-3', title: 'Default Wax', isDefault: true } },
      { id: 'slot-4', label: 'Gift item', product: { selectionId: 'variant-4', title: 'Free Gift', isFreeGift: true, isLocked: true } },
    ], { document: createDocument() });

    expect(slots.querySelector('[data-action="select-slot"]')).not.toBeNull();
    expect(slots.querySelector('[data-action="remove-selected-product"]')).not.toBeNull();
    expect(slots.textContent).toMatch(/Default Wax/);
    expect(slots.textContent).toMatch(/Free Gift/);
  });

  it('supports vertical mode without changing slot labels', () => {
    const slots = createSelectedProductSlotsElement([
      { id: 'slot-1', label: 'Choose first item' },
    ], { mode: 'vertical', document: createDocument() });

    expect(slots.textContent).toMatch(/Choose first item/);
  });

  it('renders a merchant slot icon for empty selected slots', () => {
    const slots = createSelectedProductSlotsElement([
      { id: 'slot-1', label: 'Choose first item', iconUrl: 'https://cdn.shopify.com/slot-icon.png' },
    ], { document: createDocument() });

    expect(slots.querySelector('img')?.src).toBe('https://cdn.shopify.com/slot-icon.png');
  });
});
