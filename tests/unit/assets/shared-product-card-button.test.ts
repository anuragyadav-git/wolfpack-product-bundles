// eslint-disable-next-line @typescript-eslint/no-require-imports
const { JSDOM } = require('jsdom');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createSharedProductCardElement } = require('../../../app/assets/widgets/shared/components/product-card.js');

export {};

describe('shared product card add button', () => {
  const createCard = (product: any, quantity: number, options: any = {}) => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    return createSharedProductCardElement(product, quantity, { display: { format: '${{amount}}' } }, {
      ...options,
      document: dom.window.document,
    });
  };

  it('adds an explicit label for plus-only icon buttons', () => {
    const card = createCard({ selectionId: 'variant-1', title: 'Test product', price: 1000 }, 0, { addButtonText: '+' });
    const addButton = card.querySelector('button[data-product-id]');
    expect(addButton?.getAttribute('aria-label')).toBe('+ Test product');
    expect(addButton?.textContent).toBe('+');
  });

  it('does not override text button labels', () => {
    const card = createCard({ selectionId: 'variant-1', title: 'Test product', price: 1000 }, 0, { addButtonText: 'Add +' });
    const addButton = card.querySelector('button[data-product-id]');
    expect(addButton?.getAttribute('aria-label')).toBe('Add + Test product');
    expect(addButton?.textContent).toBe('Add +');
  });

  it('passes localized modal card labels and aria text', () => {
    const card = createCard(
      { selectionId: 'variant-1', title: 'Test product', price: 1000, variantTitle: 'Red' }, 0, {
        productDetailsEnabled: true,
        openImageLabel: 'Open localized image',
        openTitleLabel: 'Open localized title',
        selectedStateLabel: 'Added localized',
        quantityAriaLabel: 'Quantity FR',
        variantAriaLabel: 'Variante',
        removeAriaLabel: 'Retirer le produit',
        soldOutAriaLabel: 'Épuisé',
        addButtonAriaLabel: 'Ajouter',
        addButtonText: 'Ajouter',
      }
    );

    ['Open localized image', 'Open localized title', 'Variante: Red', 'Quantity FR controls', 'Ajouter Test product']
      .forEach((label) => expect(card.querySelector(`[aria-label="${label}"]`)).not.toBeNull());
  });

  it('passes localized quantity control labels', () => {
    const card = createCard(
      { selectionId: 'variant-2', title: 'Test product', price: 1000, variantTitle: 'Blue' }, 1, {
        quantityAriaLabel: 'Quantity FR',
        variantAriaLabel: 'Variante',
        removeAriaLabel: 'Retirer le produit',
        decreaseLabel: 'Moins',
        increaseLabel: 'Plus',
      }
    );

    ['Variante: Blue', 'Retirer le produit Test product', 'Quantity FR: 1', 'Plus Test product']
      .forEach((label) => expect(card.querySelector(`[aria-label="${label}"]`)).not.toBeNull());
  });

  it('passes localized nav and description controls', () => {
    const card = createCard(
      {
        id: 'variant-3',
        title: 'Image-rich product',
        price: 1000,
        images: ['a.jpg', 'b.jpg', 'c.jpg'],
        description: 'This is a long product description for parity testing.',
      },
      1, {
        productDetailsEnabled: true,
        displaySeeMoreLink: true,
        descriptionMaxLength: 6,
        seeMoreText: 'See all',
        imageNavPreviousLabel: 'Précédente',
        imageNavNextLabel: 'Suivante',
        decreaseLabel: 'Moins',
        increaseLabel: 'Plus',
      }
    );

    expect(card.querySelector('[aria-label="Précédente"]')).not.toBeNull();
    expect(card.querySelector('[aria-label="Suivante"]')).not.toBeNull();
    expect(card.textContent).toMatch(/See all/);
  });

  it('renders product-details cards with keyboard focus metadata', () => {
    const card = createCard(
      { selectionId: 'variant-4', title: 'Accessible product', price: 1000 },
      0,
      { productDetailsEnabled: true },
    );
    expect(card.tabIndex).toBe(0);
    expect(card.getAttribute('role')).toEqual('group');
    expect(card.getAttribute('aria-label')).toEqual('Open product details (not selected)');
    expect(card.hasAttribute('aria-pressed')).toBe(false);
  });

  it('keeps product media informational when product details are disabled', () => {
    const card = createCard({ selectionId: 'variant-5', title: 'Static product', price: 1000 }, 0);
    const media = card.querySelector('[data-bw-product-media="true"]');

    expect(card.tabIndex).toBe(-1);
    expect(media?.getAttribute('role')).toBeNull();
    expect((media as HTMLElement | null)?.tabIndex).toBe(-1);
    expect(media?.getAttribute('aria-label')).toBeNull();
  });
});
