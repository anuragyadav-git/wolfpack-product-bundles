import { JSDOM } from 'jsdom';
import { cleanupInternalCartProperties } from '../../../app/storefront/cart-properties-cleanup';

describe('cleanupInternalCartProperties', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    document = dom.window.document;
    (global as any).document = document;
    (global as any).NodeFilter = dom.window.NodeFilter;
    (global as any).Node = dom.window.Node;
  });

  afterEach(() => {
    delete (global as any).document;
    delete (global as any).NodeFilter;
    delete (global as any).Node;
  });

  it('removes raw text nodes and trailing <br> for leading underscore properties in legacy theme containers', () => {
    document.body.innerHTML = `
      <div class="cart-item">
        <div class="content">
          <a href="/products/headband">Wide Headband</a>
          <span class="price">$15.00</span>
          _bundle_name: Mixed 3-Pack
          <br>
          _wolfpack_bundle_runtime: {"pricingMethod":"EQUAL_DISCOUNT"}
          <br>
          _is_bundle_parent: true
          <br>
          <div class="quantity">Qty: 1</div>
        </div>
      </div>
    `;

    cleanupInternalCartProperties(document);

    const content = document.querySelector('.content')!;
    expect(content.textContent).not.toContain('_bundle_name');
    expect(content.textContent).not.toContain('_wolfpack_bundle_runtime');
    expect(content.textContent).not.toContain('_is_bundle_parent');
    expect(content.textContent).toContain('Wide Headband');
    expect(content.textContent).toContain('$15.00');
    expect(content.textContent).toContain('Qty: 1');
    expect(content.querySelectorAll('br').length).toBe(0);
  });

  it('removes wrapper element when property is inside a property wrapper', () => {
    document.body.innerHTML = `
      <ul class="cart-item__properties">
        <li class="cart-item__property">
          <span class="cart-item__property-label">_bundle_name:</span>
          <span>Mixed 3-Pack</span>
        </li>
        <li class="cart-item__property">
          <span class="cart-item__property-label">Color:</span>
          <span>Red</span>
        </li>
      </ul>
    `;

    cleanupInternalCartProperties(document);

    expect(document.body.textContent).not.toContain('_bundle_name');
    expect(document.body.textContent).toContain('Color:');
    expect(document.body.textContent).toContain('Red');
    const listItems = document.querySelectorAll('li');
    expect(listItems.length).toBe(1);
    expect(listItems[0].textContent).toContain('Color:');
  });

  it('preserves public line item properties without leading underscores', () => {
    document.body.innerHTML = `
      <div class="content">
        <p>Custom Engraving: John Doe</p>
        <p>Gift Note: Happy Birthday!</p>
      </div>
    `;

    cleanupInternalCartProperties(document);

    expect(document.body.textContent).toContain('Custom Engraving: John Doe');
    expect(document.body.textContent).toContain('Gift Note: Happy Birthday!');
  });
});
