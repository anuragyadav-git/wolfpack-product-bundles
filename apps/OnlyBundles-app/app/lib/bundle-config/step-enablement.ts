export function resolveBundleStepEnabled(
  stepIndex: number,
  enabled: boolean | undefined,
): boolean {
  return stepIndex === 0 || enabled !== false;
}
