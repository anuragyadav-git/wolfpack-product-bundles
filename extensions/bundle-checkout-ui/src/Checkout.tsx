import type {FunctionComponent} from 'preact';
import {
  useCartLines,
  useDiscountAllocations,
  useTotalAmount,
} from '@shopify/ui-extensions/checkout/preact';

type CheckoutMoney = {
  amount?: number | string;
  currencyCode?: string;
};

type CheckoutDiscountAllocation = {
  discountedAmount?: CheckoutMoney;
};

type CheckoutLine = {
  discountAllocations?: CheckoutDiscountAllocation[];
};

function sumDiscountAllocations(allocations: CheckoutDiscountAllocation[] = []) {
  return allocations.reduce((sum, allocation) => {
    const amount = Number(allocation.discountedAmount?.amount);
    return Number.isFinite(amount) && amount > 0 ? sum + amount : sum;
  }, 0);
}

function getCurrencyCode(
  lines: CheckoutLine[],
  discountAllocations: CheckoutDiscountAllocation[],
  totalAmount?: CheckoutMoney,
) {
  return (
    totalAmount?.currencyCode
    ?? lines
      .flatMap((line) => line.discountAllocations ?? [])
      .find((allocation) => allocation.discountedAmount?.currencyCode)
      ?.discountedAmount?.currencyCode
    ?? discountAllocations.find((allocation) => allocation.discountedAmount?.currencyCode)
      ?.discountedAmount?.currencyCode
    ?? 'USD'
  );
}

export function calculateCheckoutTotalSavings({
  lines = [],
  discountAllocations = [],
}: {
  lines?: CheckoutLine[];
  discountAllocations?: CheckoutDiscountAllocation[];
} = {}) {
  const checkoutNativeSavings = sumDiscountAllocations(discountAllocations);
  const lineNativeSavings = lines.reduce(
    (sum, line) => sum + sumDiscountAllocations(line.discountAllocations),
    0,
  );
  return Math.max(checkoutNativeSavings, lineNativeSavings);
}

export function formatCheckoutMoney(amount: number, currencyCode = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

/**
 * Cart-line checkout display is handled by Shopify native line
 * properties and discount allocations. This target intentionally renders
 * nothing so it cannot duplicate native checkout rows.
 */
export const BundlePricingExtension: FunctionComponent = () => {
  return null;
};

export const TotalSavingsExtension: FunctionComponent = () => {
  const lines = useCartLines() as CheckoutLine[];
  const discountAllocations = useDiscountAllocations() as CheckoutDiscountAllocation[];
  const totalAmount = useTotalAmount() as CheckoutMoney | undefined;
  const totalSavings = calculateCheckoutTotalSavings({lines, discountAllocations});

  if (totalSavings <= 0) {
    return null;
  }

  const currencyCode = getCurrencyCode(lines, discountAllocations, totalAmount);

  return (
    <s-stack direction="inline" gap="small-400" alignItems="center">
      <s-icon type="discount" />
      <s-text type="strong">TOTAL SAVINGS</s-text>
      <s-text type="strong">{formatCheckoutMoney(totalSavings, currencyCode)}</s-text>
    </s-stack>
  );
};
