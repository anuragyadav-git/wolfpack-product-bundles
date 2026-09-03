export {};

const mockUseCartLines = jest.fn();
const mockUseDiscountAllocations = jest.fn();
const mockUseTotalAmount = jest.fn();

jest.mock("@shopify/ui-extensions/checkout/preact", () => ({
  useCartLines: mockUseCartLines,
  useDiscountAllocations: mockUseDiscountAllocations,
  useTotalAmount: mockUseTotalAmount,
}), { virtual: true });

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  BundlePricingExtension,
  TotalSavingsExtension,
  calculateCheckoutTotalSavings,
  formatCheckoutMoney,
} = require("../../../extensions/bundle-checkout-ui/src/Checkout.tsx");

describe("BundlePricingExtension native checkout parity", () => {
  const originalShopify = (global as any).shopify;

  afterEach(() => {
    (global as any).shopify = originalShopify;
  });

  it("does not render a custom panel for bundle parent lines with native checkout attributes", () => {
    (global as any).shopify = {
      target: {
        value: {
          attributes: [
            { key: "_is_bundle_parent", value: "true" },
            { key: "_bundle_total_retail_cents", value: "165800" },
            { key: "_bundle_total_price_cents", value: "157510" },
            { key: "_bundle_total_savings_cents", value: "8290" },
          ],
        },
      },
      cost: {
        totalAmount: {
          value: {
            currencyCode: "USD",
          },
        },
      },
    };

    expect(BundlePricingExtension({})).toBeNull();
  });
});

describe("TotalSavingsExtension native checkout parity", () => {
  beforeEach(() => {
    mockUseCartLines.mockReset();
    mockUseDiscountAllocations.mockReset();
    mockUseTotalAmount.mockReset();
  });

  it("returns zero when checkout has no savings", () => {
    expect(calculateCheckoutTotalSavings({ lines: [], discountAllocations: [] })).toBe(0);
  });

  it("uses native checkout discount allocations for total savings", () => {
    expect(
      calculateCheckoutTotalSavings({
        lines: [
          {
            attributes: [{ key: "Box", value: "1" }],
            discountAllocations: [
              { discountedAmount: { amount: 82.9, currencyCode: "USD" } },
            ],
          },
        ],
        discountAllocations: [
          { discountedAmount: { amount: 82.9, currencyCode: "USD" } },
        ],
      }),
    ).toBe(82.9);
  });

  it("does not use Cart Transform bundle savings attributes", () => {
    expect(
      calculateCheckoutTotalSavings({
        lines: [
          {
            attributes: [
              { key: "_is_bundle_parent", value: "true" },
              { key: "_bundle_total_savings_cents", value: "8290" },
            ],
            discountAllocations: [],
          },
        ],
        discountAllocations: [],
      }),
    ).toBe(0);
  });

  it("does not derive savings from the parent public retail price", () => {
    expect(
      calculateCheckoutTotalSavings({
        lines: [
          {
            attributes: [
              { key: "Retail Price", value: "$2,606.00" },
            ],
            cost: {
              totalAmount: { amount: 2596, currencyCode: "USD" },
            },
            discountAllocations: [],
          },
        ],
        discountAllocations: [],
      }),
    ).toBe(0);
  });

  it("does not double count the public retail price fallback and native discounts", () => {
    expect(
      calculateCheckoutTotalSavings({
        lines: [
          {
            attributes: [
              { key: "Retail Price", value: "$100.00" },
            ],
            cost: {
              totalAmount: { amount: 90, currencyCode: "USD" },
            },
            discountAllocations: [
              { discountedAmount: { amount: 10, currencyCode: "USD" } },
            ],
          },
        ],
        discountAllocations: [],
      }),
    ).toBe(10);
  });

  it("uses native checkout discounts without adding parent bundle price savings", () => {
    expect(
      calculateCheckoutTotalSavings({
        lines: [
          {
            attributes: [
              { key: "_bundle_total_savings_cents", value: "1000" },
              { key: "Retail Price", value: "$2,606.00" },
            ],
            cost: {
              totalAmount: { amount: 2596, currencyCode: "USD" },
            },
            discountAllocations: [],
          },
          {
            attributes: [{ key: "Add On", value: "" }],
            cost: {
              totalAmount: { amount: 0, currencyCode: "USD" },
            },
            discountAllocations: [
              { discountedAmount: { amount: 30, currencyCode: "USD" } },
            ],
          },
        ],
        discountAllocations: [
          { discountedAmount: { amount: 30, currencyCode: "USD" } },
        ],
      }),
    ).toBe(30);
  });

  it("deduplicates checkout and line views of the same native allocation", () => {
    expect(
      calculateCheckoutTotalSavings({
        lines: [
          {
            discountAllocations: [
              { discountedAmount: { amount: 30, currencyCode: "INR" } },
            ],
          },
        ],
        discountAllocations: [
          { discountedAmount: { amount: 30, currencyCode: "INR" } },
        ],
      }),
    ).toBe(30);
  });

  it("formats savings with the active checkout currency", () => {
    expect(formatCheckoutMoney(82.9, "INR")).toBe("₹82.90");
  });

  it("uses the currency's native fraction digits", () => {
    expect(formatCheckoutMoney(1000, "JPY")).toBe("¥1,000");
  });

  it("renders one inline native-savings stack with discount icon and active-currency amount", () => {
    mockUseCartLines.mockReturnValue([
      {
        discountAllocations: [
          { discountedAmount: { amount: 30, currencyCode: "INR" } },
        ],
      },
    ]);
    mockUseDiscountAllocations.mockReturnValue([
      { discountedAmount: { amount: 30, currencyCode: "INR" } },
    ]);
    mockUseTotalAmount.mockReturnValue({ amount: 100, currencyCode: "INR" });

    const rendered = TotalSavingsExtension({});

    expect(rendered.type).toBe("s-stack");
    expect(rendered.props.direction).toBe("inline");
    expect(rendered.props.children).toHaveLength(3);
    expect(rendered.props.children[0]).toMatchObject({
      type: "s-icon",
      props: { type: "discount" },
    });
    expect(rendered.props.children[1]).toMatchObject({
      type: "s-text",
      props: { type: "strong", children: "TOTAL SAVINGS" },
    });
    expect(rendered.props.children[2]).toMatchObject({
      type: "s-text",
      props: { type: "strong", children: "₹30.00" },
    });
  });

  it("renders nothing when native allocations have no savings", () => {
    mockUseCartLines.mockReturnValue([]);
    mockUseDiscountAllocations.mockReturnValue([]);
    mockUseTotalAmount.mockReturnValue({ amount: 100, currencyCode: "INR" });

    expect(TotalSavingsExtension({})).toBeNull();
  });
});
