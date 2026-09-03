export function resolveProductPageStepText(step: any = {}, stepIndex = 0) {
  const configuredName = typeof step?.name === 'string' ? step.name.trim() : '';
  const contentTitle = typeof step?.pageTitle === 'string' ? step.pageTitle.trim() : '';

  return {
    navigationLabel: configuredName || `Step ${Number(stepIndex) + 1}`,
    contentTitle,
  };
}
