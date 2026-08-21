// eslint-disable-next-line @typescript-eslint/no-require-imports
const { renderSharedProductCard } = require('../../../app/assets/widgets/shared/components/product-card.js');

export {};

describe('shared product card add button', () => {
  it('adds an explicit label for plus-only icon buttons', () => {
    const html = renderSharedProductCard(
      { id: 'variant-1', title: 'Test product', price: 1000 },
      0,
      { display: { format: '${{amount}}' } },
      { addButtonText: '+' }
    );

    expect(html).toContain('aria-label="+ Test product"');
  });

  it('does not override text button labels', () => {
    const html = renderSharedProductCard(
      { id: 'variant-1', title: 'Test product', price: 1000 },
      0,
      { display: { format: '${{amount}}' } },
      { addButtonText: 'Add +' }
    );

    expect(html).toContain('aria-label="Add + Test product"');
    expect(html).toContain('Add +');
  });

  it('passes localized modal card labels and aria text', () => {
    const html = renderSharedProductCard(
      { id: 'variant-1', title: 'Test product', price: 1000, variantTitle: 'Red' },
      0,
      { display: { format: '${{amount}}' } },
      {
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

    expect(html).toContain('aria-label="Open localized image"');
    expect(html).toContain('aria-label="Open localized title"');
    expect(html).toContain('aria-label="Variante: Red"');
    expect(html).toContain('aria-label="Quantity FR controls"');
    expect(html).toContain('aria-label="Ajouter Test product"');
  });

  it('passes localized quantity control labels', () => {
    const html = renderSharedProductCard(
      { id: 'variant-2', title: 'Test product', price: 1000, variantTitle: 'Blue' },
      1,
      { display: { format: '${{amount}}' } },
      {
        quantityAriaLabel: 'Quantity FR',
        variantAriaLabel: 'Variante',
        removeAriaLabel: 'Retirer le produit',
        decreaseLabel: 'Moins',
        increaseLabel: 'Plus',
      }
    );

    expect(html).toContain('aria-label="Variante: Blue"');
    expect(html).toContain('aria-label="Retirer le produit Test product"');
    expect(html).toContain('aria-label="Quantity FR: 1"');
    expect(html).toContain('aria-label="Retirer le produit Test product"');
    expect(html).toContain('aria-label="Plus Test product"');
  });

  it('passes localized nav and description controls', () => {
    const html = renderSharedProductCard(
      {
        id: 'variant-3',
        title: 'Image-rich product',
        price: 1000,
        images: ['a.jpg', 'b.jpg', 'c.jpg'],
        description: 'This is a long product description for parity testing.',
      },
      1,
      { display: { format: '${{amount}}' } },
      {
        displaySeeMoreLink: true,
        descriptionMaxLength: 6,
        seeMoreText: 'See all',
        imageNavPreviousLabel: 'Précédente',
        imageNavNextLabel: 'Suivante',
        decreaseLabel: 'Moins',
        increaseLabel: 'Plus',
      }
    );

    expect(html).toContain('aria-label="Précédente"');
    expect(html).toContain('aria-label="Suivante"');
    expect(html).toContain('See all');
  });

  it('renders cards with keyboard focus metadata', () => {
    const html = renderSharedProductCard(
      { id: 'variant-4', title: 'Accessible product', price: 1000 },
      0,
      { display: { format: '${{amount}}' } },
    );

    expect(html).toContain('tabindex="0"');
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Open product details"');
    expect(html.slice(0, html.indexOf('>') + 1)).not.toContain('aria-pressed');
  });
});
