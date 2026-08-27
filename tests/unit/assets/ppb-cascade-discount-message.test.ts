export {};

const { JSDOM } = require('jsdom');

const {
  renderCascadeDiscountMessage,
} = require('../../../app/assets/widgets/product-page/templates/cascade-template.js');

describe('PPB Cascade discount message rendering', () => {
  it('renders only owned message segments as elements', () => {
    const dom = new JSDOM('<!doctype html><p></p>');
    const element = dom.window.document.querySelector('p');
    const message = [
      { kind: 'text', value: 'Add <img src=x onerror=alert(1)> ' },
      { kind: 'condition', value: '2 more items' },
      { kind: 'text', value: ' to unlock a discount' },
    ];

    renderCascadeDiscountMessage(element, message);

    expect(element.textContent).toContain('Add <img src=x onerror=alert(1)> 2 more items to unlock a discount');
    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('[data-message-segment="condition"]')?.textContent).toBe('2 more items');
  });
});
