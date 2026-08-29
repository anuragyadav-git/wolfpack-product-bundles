const CONFIGURE_ACTION_ICONS = {
  translate: 'language-translate',
  add: 'plus',
  'add-product': 'product-add',
  'add-collection': 'collection',
  'browse-product': 'product',
  setup: 'settings',
  place: 'theme-edit',
  edit: 'edit',
  replace: 'replace',
  refresh: 'refresh',
  variables: 'code',
  'subscription-plan': 'plan',
  remove: 'delete',
  back: 'arrow-left',
  next: 'arrow-right',
  complete: 'check',
  preview: 'view',
  'create-page': 'page-add',
  'select-template': 'paint-brush-flat',
} as const;

export type ConfigureAction = keyof typeof CONFIGURE_ACTION_ICONS;

export function getConfigureActionIcon(action: ConfigureAction) {
  return CONFIGURE_ACTION_ICONS[action];
}
