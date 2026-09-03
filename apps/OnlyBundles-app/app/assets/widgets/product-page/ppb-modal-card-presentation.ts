export type PpbModalCardPresentationMode = 'add' | 'quantity' | 'maximum-reached';

type PpbQuantityValidation = {
  isEnabled?: boolean;
  allowedQuantity?: number | string | null;
};

type PpbModalCardPresentationInput = {
  quantity?: number | string;
  validation?: PpbQuantityValidation | null;
};

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
