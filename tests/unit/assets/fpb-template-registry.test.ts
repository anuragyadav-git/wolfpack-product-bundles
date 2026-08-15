// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  FPB_TEMPLATE_CONFIGS,
} = require('../../../app/assets/widgets/full-page/templates/registry.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TemplateDesignSystem } = require('../../../app/assets/widgets/shared/template-design-system.js');
const { fpb: { resolveContract: resolveFpbPreset } = {} } = TemplateDesignSystem || {};

describe('FPB template registry resolver', () => {
  it('maps STANDARD to Standard', () => {
    expect(resolveFpbPreset('STANDARD').id).toBe('STANDARD');
  });

  it('does not expose DEFAULT or DEFAULT_FBP as Standard aliases', () => {
    expect(FPB_TEMPLATE_CONFIGS.STANDARD.aliases).toEqual(['STANDARD']);
  });

  it('maps CLASSIC, COMPACT, and HORIZONTAL presets', () => {
    expect(resolveFpbPreset('CLASSIC').id).toBe('CLASSIC');
    expect(resolveFpbPreset('COMPACT').id).toBe('COMPACT');
    expect(resolveFpbPreset('HORIZONTAL').id).toBe('HORIZONTAL');
  });

  it('exports all four target FPB configs', () => {
    expect(Object.keys(FPB_TEMPLATE_CONFIGS).sort()).toEqual([
      'CLASSIC',
      'COMPACT',
      'HORIZONTAL',
      'STANDARD',
    ]);
  });

  it('uses the Standard step timeline renderer for Classic', () => {
    expect(FPB_TEMPLATE_CONFIGS.CLASSIC.timeline.mode).toBe(
      FPB_TEMPLATE_CONFIGS.STANDARD.timeline.mode,
    );
    expect(FPB_TEMPLATE_CONFIGS.CLASSIC.timeline.mode).toBe('standard');
  });

});
