import { getConfigureActionIcon } from '../../../app/lib/bundle-config/configure-action-icons';

describe('getConfigureActionIcon', () => {
  it('uses the dedicated translation icon for Multi Language actions', () => {
    expect(getConfigureActionIcon('translate')).toBe('language-translate');
  });

  it.each([
    ['add', 'plus'],
    ['add-product', 'product-add'],
    ['add-collection', 'collection'],
    ['browse-product', 'product'],
  ] as const)('maps the %s resource action', (action, icon) => {
    expect(getConfigureActionIcon(action)).toBe(icon);
  });

  it.each([
    ['setup', 'settings'],
    ['place', 'theme-edit'],
    ['edit', 'edit'],
    ['replace', 'replace'],
    ['refresh', 'refresh'],
    ['variables', 'code'],
    ['subscription-plan', 'plan'],
    ['remove', 'delete'],
  ] as const)('maps the %s setup action', (action, icon) => {
    expect(getConfigureActionIcon(action)).toBe(icon);
  });

  it.each([
    ['back', 'arrow-left'],
    ['next', 'arrow-right'],
    ['complete', 'check'],
    ['preview', 'view'],
    ['create-page', 'page-add'],
    ['select-template', 'paint-brush-flat'],
  ] as const)('maps the %s navigation action', (action, icon) => {
    expect(getConfigureActionIcon(action)).toBe(icon);
  });

  it('does not return an icon for an unsupported runtime action', () => {
    expect(getConfigureActionIcon('unknown' as never)).toBeUndefined();
  });
});
