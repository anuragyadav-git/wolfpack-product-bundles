// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  TemplateDesignSystem: { fpb: { contracts: FPB_TEMPLATE_CONTRACTS } = {} } = {},
} = require('../../../app/assets/widgets/shared/template-design-system.js');

const FPB_COMPACT_TEMPLATE_CONFIG = FPB_TEMPLATE_CONTRACTS?.COMPACT || null;

describe('FPB Compact template config contract', () => {
  it('keeps the COMPACT preset mapping', () => {
    expect(FPB_COMPACT_TEMPLATE_CONFIG.id).toBe('COMPACT');
    expect(FPB_COMPACT_TEMPLATE_CONFIG.presetId).toBe('COMPACT');
    expect(FPB_COMPACT_TEMPLATE_CONFIG.aliases).toEqual(expect.arrayContaining(['COMPACT']));
  });
});
export {};
