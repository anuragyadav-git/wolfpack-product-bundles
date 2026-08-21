export {};

const {
  renderCascadeDiscountMessage,
} = require('../../../app/assets/widgets/product-page/templates/cascade-template.js');

describe('PPB Cascade discount message rendering', () => {
  it('renders trusted template spans instead of escaped HTML source', () => {
    const element = { innerHTML: '' };
    const message = 'Add <span>2 more items</span> to unlock a discount';

    renderCascadeDiscountMessage(element, message);

    expect(element.innerHTML).toBe(message);
    expect(element.innerHTML).not.toContain('&lt;span');
  });
});
