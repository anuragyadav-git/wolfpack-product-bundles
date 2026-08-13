// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  TemplateDesignSystem: { fpb: { contracts: FPB_TEMPLATE_CONTRACTS } = {} } = {},
} = require('../../../app/assets/widgets/shared/template-design-system.js');

const FPB_HORIZONTAL_TEMPLATE_CONFIG = FPB_TEMPLATE_CONTRACTS?.HORIZONTAL || null;

describe('FPB Horizontal template config contract', () => {
  it('keeps the HORIZONTAL preset mapping', () => {
    expect(FPB_HORIZONTAL_TEMPLATE_CONFIG.id).toBe('HORIZONTAL');
    expect(FPB_HORIZONTAL_TEMPLATE_CONFIG.presetId).toBe('HORIZONTAL');
    expect(FPB_HORIZONTAL_TEMPLATE_CONFIG.aliases).toEqual(expect.arrayContaining(['HORIZONTAL']));
  });
});
