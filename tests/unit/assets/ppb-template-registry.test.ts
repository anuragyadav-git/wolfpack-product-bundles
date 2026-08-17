// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  PPB_TEMPLATE_CONFIGS,
} = require('../../../app/assets/widgets/product-page/templates/registry.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TemplateDesignSystem } = require('../../../app/assets/widgets/shared/template-design-system.js');
const { resolvePpbTemplate } = TemplateDesignSystem;

describe('PPB template registry resolver', () => {
  it('maps PDP_INPAGE + GRID to Grid', () => {
    expect(resolvePpbTemplate({
      templateType: 'PDP_INPAGE',
      designPreset: 'GRID',
    }).id).toBe('GRID');
  });

  it('maps PDP_INPAGE + LIST to List', () => {
    expect(resolvePpbTemplate({
      templateType: 'PDP_INPAGE',
      designPreset: 'LIST',
    }).id).toBe('LIST');
  });

  it('maps modal horizontal slots to Horizontal Slots', () => {
    expect(resolvePpbTemplate({
      templateType: 'PDP_MODAL',
      designPreset: 'HORIZONTAL_SLOTS',
    }).id).toBe('HORIZONTAL_SLOTS');
  });

  it('maps PDP_MODAL + VERTICAL_SLOTS to Vertical Slots', () => {
    expect(resolvePpbTemplate({
      templateType: 'PDP_MODAL',
      designPreset: 'VERTICAL_SLOTS',
    }).id).toBe('VERTICAL_SLOTS');
  });

  it('uses explicit preset IDs for PDP_MODAL templates', () => {
    expect(resolvePpbTemplate({
      templateType: 'PDP_MODAL',
      designPreset: 'VERTICAL_SLOTS',
    }).id).toBe('VERTICAL_SLOTS');
    expect(resolvePpbTemplate({
      templateType: 'PDP_MODAL',
      designPreset: 'HORIZONTAL_SLOTS',
    }).id).toBe('HORIZONTAL_SLOTS');
  });

  it('does not resolve unknown preset IDs', () => {
    expect(resolvePpbTemplate({
      templateType: 'PDP_INPAGE',
      designPreset: 'UNKNOWN_PRESET',
    })).toBeNull();
  });

  it('resolves EB-style legacy aliases from PDP_MODAL and PDP_INPAGE', () => {
    expect(resolvePpbTemplate({
      templateType: 'PDP_INPAGE',
      designPreset: 'CASCADE',
    }).id).toBe('LIST');
    expect(resolvePpbTemplate({
      templateType: 'PDP_MODAL',
      designPreset: 'MODAL',
    }).id).toBe('HORIZONTAL_SLOTS');
    expect(resolvePpbTemplate({
      templateType: 'PDP_MODAL',
      designPreset: 'SIMPLIFIED',
    }).id).toBe('VERTICAL_SLOTS');
    expect(resolvePpbTemplate({
      templateType: 'PDP_INPAGE',
      designPreset: 'COGNIVE',
    }).id).toBe('GRID');
    expect(resolvePpbTemplate({
      templateType: 'PDP_INPAGE',
      designPreset: 'cOgNiVe',
    }).id).toBe('GRID');
  });

  it('does not resolve legacy aliases when template type mismatches', () => {
    expect(resolvePpbTemplate({
      templateType: 'PDP_INPAGE',
      designPreset: 'MODAL',
    })).toBeNull();
    expect(resolvePpbTemplate({
      templateType: 'PDP_MODAL',
      designPreset: 'CASCADE',
    })).toBeNull();
  });

  it('exports all four target PPB configs', () => {
    expect(Object.keys(PPB_TEMPLATE_CONFIGS).sort()).toEqual([
      'GRID',
      'HORIZONTAL_SLOTS',
      'LIST',
      'VERTICAL_SLOTS',
    ]);
  });
});
