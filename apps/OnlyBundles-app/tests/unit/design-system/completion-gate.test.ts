describe('bundle design-system completion gate', () => {
  it('accepts structurally complete artifacts and registry evidence', async () => {
    const { auditDesignSystem } = await import(
      '../../../design-system/scripts/completion-audit.cjs'
    );

    expect(auditDesignSystem(process.cwd(), { requireApprovals: false })).toEqual([]);
  });

  it('passes the final gate when every live state is approved or waived', async () => {
    const { auditDesignSystem } = await import(
      '../../../design-system/scripts/completion-audit.cjs'
    );

    expect(auditDesignSystem(process.cwd())).toEqual([]);
  });
});
