export type PpbModalCardPresentationMode = 'add' | 'quantity' | 'maximum-reached';

type PpbQuantityValidation = {
  isEnabled?: boolean;
  allowedQuantity?: number | string | null;
};

type PpbModalCardPresentationInput = {
  quantity?: number | string;
  validation?: PpbQuantityValidation | null;
};

type PpbDetailsCommitInput = {
  stepIndex?: number | string;
  originalSelectionKey?: string;
  nextSelectionKey?: string;
  quantity?: number | string;
};

export function resolvePpbModalCardActivation(target = '') {
  if (target === 'image') return 'details';
  if (target === 'add') return 'add';
  if (target === 'maximum-reached') return 'remove-all';
  return 'none';
}

export function resolvePpbModalCardPresentation({
  quantity = 0,
  validation = null,
}: PpbModalCardPresentationInput = {}) {
  const normalizedQuantity = Math.max(0, Number(quantity || 0));
  if (normalizedQuantity === 0) {
    return { mode: 'add' as const, quantity: 0 };
  }

  const allowedQuantity = Number(validation?.allowedQuantity);
  const hasMaximum = validation?.isEnabled === true
    && Number.isFinite(allowedQuantity)
    && allowedQuantity > 0;

  return {
    mode: hasMaximum && normalizedQuantity >= allowedQuantity
      ? 'maximum-reached' as const
      : 'quantity' as const,
    quantity: normalizedQuantity,
  };
}

export function resolvePpbDetailsCommit({
  stepIndex = -1,
  originalSelectionKey = '',
  nextSelectionKey = '',
  quantity = 1,
}: PpbDetailsCommitInput = {}) {
  const normalizedOriginalKey = String(originalSelectionKey || '');
  return {
    stepIndex: Number(stepIndex),
    removeSelectionKey: normalizedOriginalKey && normalizedOriginalKey !== String(nextSelectionKey || '')
      ? normalizedOriginalKey
      : '',
    nextSelectionKey: String(nextSelectionKey || ''),
    quantity: Math.max(1, Number(quantity || 1)),
    action: normalizedOriginalKey ? 'update' as const : 'add' as const,
  };
}
