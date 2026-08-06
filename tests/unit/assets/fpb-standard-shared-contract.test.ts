// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  TemplateDesignSystem: { fpb: { contracts: FPB_TEMPLATE_CONTRACTS } = {} } = {},
} = require('../../../app/assets/widgets/shared/template-design-system.js');

const FPB_STANDARD_TEMPLATE_CONFIG = FPB_TEMPLATE_CONTRACTS?.STANDARD || null;

describe('FPB Standard template config contract', () => {
  it('uses STANDARD as the only Standard preset identity', () => {
    expect(FPB_STANDARD_TEMPLATE_CONFIG.id).toBe('STANDARD');
    expect(FPB_STANDARD_TEMPLATE_CONFIG.presetId).toBe('STANDARD');
    expect(FPB_STANDARD_TEMPLATE_CONFIG.aliases).toEqual(['STANDARD']);
  });
});
