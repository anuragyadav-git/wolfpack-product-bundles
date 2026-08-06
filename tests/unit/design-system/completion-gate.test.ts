describe('bundle design-system completion gate', () => {
  it('accepts structurally complete artifacts and registry evidence', async () => {
    const { auditDesignSystem } = await import(
      '../../../design-system/scripts/completion-audit.cjs'
    );

    expect(auditDesignSystem(process.cwd(), { requireApprovals: false })).toEqual([]);
  });

  it('keeps the final gate closed until every live state is approved or waived', async () => {
    const { auditDesignSystem } = await import(
      '../../../design-system/scripts/completion-audit.cjs'
    );

    const violations = auditDesignSystem(process.cwd());
    expect(violations).toHaveLength(13);
    expect(violations.every((violation: string) => violation.endsWith('is not approved or waived'))).toBe(true);
  });
});
