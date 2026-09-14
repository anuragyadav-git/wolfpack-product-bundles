import { CurrencyManager } from "../../../app/assets/widgets/shared/currency-manager.js";

describe("CurrencyManager", () => {
  beforeEach(() => {
    (globalThis as any).Shopify = {
      shop: "shop.myshopify.com",
      currency: { active: "CAD", rate: 1.35 },
    };
    (globalThis as any).shopCurrency = "USD";
    (globalThis as any).shopifyMultiCurrency = {
      shopBaseCurrency: "USD",
      customerCurrency: "CAD",
    };
  });

  afterEach(() => {
    delete (globalThis as any).Shopify;
    delete (globalThis as any).shopCurrency;
    delete (globalThis as any).shopifyMultiCurrency;
    delete (globalThis as any).__WOLFPACK_PRESENTMENT_CURRENCY__;
  });

  it("formats already-presented minor units with Intl.NumberFormat", () => {
    expect(CurrencyManager.formatMoney(1234, "CAD", "en-CA")).toBe("$12.34");
  });

  it("supports compact native symbols without changing the default formatter", () => {
    expect(CurrencyManager.formatMoney(1234, "USD", "en-CA")).toBe("US$12.34");
    expect(CurrencyManager.formatMoney(1234, "USD", "en-CA", "narrowSymbol"))
      .toBe("$12.34");
  });

  it("does not convert a Shopify-presented product amount again", () => {
    expect(CurrencyManager.convertAndFormat(1350, CurrencyManager.getCurrencyInfo(), "en-CA"))
      .toBe("$13.50");
  });

  it("converts a merchant-authored base-currency amount exactly once", () => {
    expect(CurrencyManager.convertMerchantAmountToPresentment(1000, CurrencyManager.getCurrencyInfo()))
      .toBe(1350);
  });

  it("derives the display symbol from Intl rather than a manual table", () => {
    expect(CurrencyManager.getCurrencyInfo("en-CA").display.symbol).toBe("$");
  });

  it("does not convert authored values in Shopify's base market", () => {
    (globalThis as any).Shopify.currency = { active: "GBP", rate: 1 };
    (globalThis as any).shopCurrency = "GBP";
    (globalThis as any).shopifyMultiCurrency = {
      shopBaseCurrency: "GBP",
      customerCurrency: "GBP",
    };

    const currencyInfo = CurrencyManager.getCurrencyInfo("en-GB");

    expect(currencyInfo.calculation.code).toBe("GBP");
    expect(currencyInfo.display.code).toBe("GBP");
    expect(currencyInfo.isMultiCurrency).toBe(false);
    expect(CurrencyManager.convertMerchantAmountToPresentment(1000, currencyInfo)).toBe(1000);
  });

  it("fails closed when Shopify's base currency context is missing", () => {
    delete (globalThis as any).shopCurrency;
    delete (globalThis as any).shopifyMultiCurrency;

    expect(() => CurrencyManager.getCurrencyInfo()).toThrow(
      "Missing Shopify base currency context",
    );
  });
});
