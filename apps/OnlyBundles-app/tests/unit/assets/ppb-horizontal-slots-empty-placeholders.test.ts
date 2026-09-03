// eslint-disable-next-line @typescript-eslint/no-require-imports
const { modalSlotTemplateMethods } = require('../../../app/assets/widgets/product-page/templates/modal-slot-template.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { JSDOM } = require('jsdom');

export {};

describe('PPB Horizontal Slots empty placeholders', () => {
  let originalDocument: Document | undefined;

  beforeEach(() => {
    originalDocument = global.document;
    global.document = new JSDOM('<!doctype html><html><body></body></html>').window.document;
  });

  afterEach(() => {
    global.document = originalDocument as Document;
  });

  it.each([
    {
      name: 'renders every empty exact-match slot',
      step: { name: 'Step 1', conditionOperator: 'equal_to', conditionValue: 2 },
      selectedCount: 0,
      labels: ['Product 1', 'Product 2'],
    },
    {
      name: 'continues numbering after an existing selection',
      step: { name: 'Step 1', conditionOperator: 'equal_to', conditionValue: 2 },
      selectedCount: 1,
      labels: ['Product 2'],
    },
    {
      name: 'converts greater-than into the first valid quantity',
      step: { name: 'Step 1', conditionOperator: 'greater_than', conditionValue: 2 },
      selectedCount: 0,
      labels: ['Product 1', 'Product 2', 'Product 3'],
    },
    {
      name: 'keeps the next slot open when a minimum target is reached',
      step: { name: 'Step 1', conditionOperator: 'greater_than_or_equal_to', conditionValue: 2 },
      selectedCount: 2,
      labels: ['Product 3'],
    },
    {
      name: 'keeps the next slot open after selection exceeds a minimum target',
      step: { name: 'Step 1', conditionOperator: 'greater_than_or_equal_to', conditionValue: 2 },
      selectedCount: 3,
      labels: ['Product 4'],
    },
  ])('$name', ({ step, selectedCount, labels }: any) => {
    const target = document.createElement('div');
    const widget = createWidget();

    widget._appendModalSlotEmptyCards(target, step, 0, selectedCount);

    expect(getSlotLabels(target)).toEqual(labels);
  });

  it('retains expanded slot capacity after selections are removed', () => {
    const widget = createWidget();
    const step = { name: 'Step 1', conditionOperator: 'greater_than_or_equal_to', conditionValue: 2 };

    widget._appendModalSlotEmptyCards(document.createElement('div'), step, 0, 3);

    const target = document.createElement('div');
    widget._appendModalSlotEmptyCards(target, step, 0, 0);

    expect(getSlotLabels(target)).toEqual([
      'Product 1',
      'Product 2',
      'Product 3',
      'Product 4',
    ]);
  });

  it('does not append an overflow slot when an exact target is reached', () => {
    const target = document.createElement('div');
    const widget = createWidget();

    widget._appendModalSlotEmptyCards(
      target,
      { name: 'Step 2', conditionOperator: 'equal_to', conditionValue: 1 },
      1,
      1
    );

    expect(target.children).toHaveLength(0);
  });

  it('renders one empty slot when the global condition-based slot setting is disabled', () => {
    const target = document.createElement('div');
    const widget = createWidget({
      controlsSettings: {
        activeControls: {
          displayEmptyStateBoxesBasedOnBundleCondition: false,
        },
      },
    });

    widget._appendModalSlotEmptyCards(
      target,
      { name: 'Step 1', conditionOperator: 'greater_than_or_equal_to', conditionValue: 2 },
      0,
      0
    );

    expect(getSlotLabels(target)).toEqual([
      'Product 1',
    ]);
  });

  it('keeps one operable empty slot when the step has no capacity condition', () => {
    const target = document.createElement('div');
    const widget = createWidget();

    widget._appendModalSlotEmptyCards(
      target,
      { name: 'Step 1' },
      0,
      0
    );

    expect(getSlotLabels(target)).toEqual([
      'Product 1',
    ]);
  });

  it('keeps condition-sized slots when the global condition-based slot setting is enabled', () => {
    const target = document.createElement('div');
    const widget = createWidget({
      controlsSettings: {
        activeControls: {
          displayEmptyStateBoxesBasedOnBundleCondition: true,
        },
      },
    });

    widget._appendModalSlotEmptyCards(
      target,
      { name: 'Step 1', conditionOperator: 'greater_than_or_equal_to', conditionValue: 2 },
      0,
      0
    );

    expect(getSlotLabels(target)).toEqual([
      'Product 1',
      'Product 2',
    ]);
  });
});

function createWidget(config = {}) {
  const widget = {
    config,
    _getProductPageTemplateType: () => 'PDP_MODAL',
    _getProductPageDesignPreset: () => 'HORIZONTAL_SLOTS',
    _getProductPageTemplateContract: () => ({ templateType: 'PDP_MODAL', slots: { orientation: 'horizontal' } }),
    openModal: jest.fn(),
  } as any;
  Object.assign(widget, modalSlotTemplateMethods);
  return widget;
}

function getSlotLabels(target: Element) {
  return Array.from(target.children).map((card) => card.lastElementChild?.textContent);
}
