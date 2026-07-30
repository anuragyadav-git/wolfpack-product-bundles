import type {FunctionComponent} from 'preact';
import {
  useCartLines,
  useDiscountAllocations,
  useTotalAmount,
} from '@shopify/ui-extensions/checkout/preact';

type CheckoutAttribute = {
  key: string;
  value: string;
};

type CheckoutMoney = {
  amount?: number | string;
  currencyCode?: string;
};

type CheckoutDiscountAllocation = {
  discountedAmount?: CheckoutMoney;
};

type CheckoutLine = {
  attributes?: CheckoutAttribute[];
  cost?: {
    totalAmount?: CheckoutMoney;
  };
  discountAllocations?: CheckoutDiscountAllocation[];
};

const BUNDLE_TOTAL_SAVINGS_ATTRIBUTE = '_bundle_total_savings_cents';
const BUNDLE_RETAIL_PRICE_ATTRIBUTE = 'Retail Price';

function sumDiscountAllocations(allocations: CheckoutDiscountAllocation[] = []) {
  return allocations.reduce((sum, allocation) => {
    const amount = Number(allocation.discountedAmount?.amount);
    return Number.isFinite(amount) && amount > 0 ? sum + amount : sum;
  }, 0);
}

function getLineAttributeValue(attributes: CheckoutAttribute[] = [], key: string) {
  return attributes.find((attribute) => attribute.key === key)?.value;
}

function getBundleAttributeSavings(line: CheckoutLine) {
  const cents = Number(getLineAttributeValue(line.attributes, BUNDLE_TOTAL_SAVINGS_ATTRIBUTE));
  return Number.isFinite(cents) && cents > 0 ? cents / 100 : 0;
}

function parseFormattedMoney(value: string, currencyCode: string) {
  const parts = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).formatToParts(12345.6);
  const group = parts.find((part) => part.type === 'group')?.value;
  const decimal = parts.find((part) => part.type === 'decimal')?.value;
  let normalized = value;

  if (group) {
    normalized = normalized.split(group).join('');
  }
  if (decimal && decimal !== '.') {
    normalized = normalized.replace(decimal, '.');
  }

  const amount = Number(normalized.replace(/[^\d.-]/g, ''));
  return Number.isFinite(amount) ? amount : 0;
}

function getPublicRetailSavings(line: CheckoutLine) {
  const totalAmount = Number(line.cost?.totalAmount?.amount);
  const currencyCode = line.cost?.totalAmount?.currencyCode ?? 'USD';
  const retailPrice = parseFormattedMoney(
    getLineAttributeValue(line.attributes, BUNDLE_RETAIL_PRICE_ATTRIBUTE) ?? '',
    currencyCode,
  );
  const savings = retailPrice - totalAmount;

  return Number.isFinite(savings) && savings > 0 ? savings : 0;
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
  const nativeSavings = Math.max(checkoutNativeSavings, lineNativeSavings);

  if (nativeSavings > 0) {
    return nativeSavings;
  }

  return lines.reduce((sum, line) => {
    const bundleSavings = getBundleAttributeSavings(line);
    const publicRetailSavings = getPublicRetailSavings(line);
    return sum + Math.max(bundleSavings, publicRetailSavings);
  }, 0);
}

export function formatCheckoutMoney(amount: number, currencyCode = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

/**
 * EB-style cart-line checkout display is handled by Shopify native line
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
    <s-grid gridTemplateColumns="1fr auto" gap="base">
      <s-text type="strong">TOTAL SAVINGS</s-text>
      <s-text type="strong">{formatCheckoutMoney(totalSavings, currencyCode)}</s-text>
    </s-grid>
  );
};
