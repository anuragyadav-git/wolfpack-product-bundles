export type NewBundleStep = {
  id: string;
  name: string;
  collections: unknown[];
  products: unknown[];
  StepProduct: unknown[];
  displayVariantsAsIndividual: boolean;
  minQuantity: number;
  maxQuantity: number;
};

export function createBundleStep(
  stepNumber: number,
  timestamp = Date.now(),
): NewBundleStep {
  return {
    id: `step-${timestamp}`,
    name: `Step ${stepNumber}`,
    collections: [],
    products: [],
    StepProduct: [],
    displayVariantsAsIndividual: false,
    minQuantity: 0,
    maxQuantity: 10,
  };
}
