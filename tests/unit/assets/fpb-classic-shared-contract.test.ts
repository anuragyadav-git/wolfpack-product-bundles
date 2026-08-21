// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  TemplateDesignSystem: { fpb: { contracts: FPB_TEMPLATE_CONTRACTS } = {} } = {},
} = require('../../../app/assets/widgets/shared/template-design-system.js');

const FPB_CLASSIC_TEMPLATE_CONFIG = FPB_TEMPLATE_CONTRACTS?.CLASSIC || null;

describe('FPB Classic template config contract', () => {
  it('keeps the CLASSIC preset mapping', () => {
    expect(FPB_CLASSIC_TEMPLATE_CONFIG.id).toBe('CLASSIC');
    expect(FPB_CLASSIC_TEMPLATE_CONFIG.presetId).toBe('CLASSIC');
    expect(FPB_CLASSIC_TEMPLATE_CONFIG.aliases).toEqual(expect.arrayContaining(['CLASSIC']));
  });
});
export {};
