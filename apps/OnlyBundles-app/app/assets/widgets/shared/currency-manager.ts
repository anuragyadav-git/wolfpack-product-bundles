'use strict';

export type CurrencyInfo = {
  calculation: { code: string };
  display: { code: string; symbol: string; rate: number };
  isMultiCurrency: boolean;
  locale?: string;
};

export class CurrencyManager {
  static getShopify() {
    if (typeof window !== 'undefined' && window.Shopify) return window.Shopify;
    return (globalThis as any).Shopify || null;
  }

  static getShopBaseCurrency() {
    const currencyContext = (globalThis as any).shopifyMultiCurrency;
    const code = String(currencyContext?.shopBaseCurrency || '').trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) {
      throw new Error('Missing Shopify base currency context');
    }
    return { code };
  }

  static detectCustomerCurrency() {
    const shopify = this.getShopify();
    const hydratedCurrency = typeof window !== 'undefined'
      ? (window as any).__WOLFPACK_PRESENTMENT_CURRENCY__
      : (globalThis as any).__WOLFPACK_PRESENTMENT_CURRENCY__;
    const currencyContext = (globalThis as any).shopifyMultiCurrency;
    const code = String(hydratedCurrency || currencyContext?.customerCurrency || '')
      .toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) {
      throw new Error('Missing Shopify presentment currency context');
    }
    const baseCurrency = this.getShopBaseCurrency().code;
    if (code === baseCurrency) return { code, rate: 1 };
    const rate = Number(shopify?.currency?.rate);
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error('Missing Shopify presentment currency rate');
    }
    return { code, rate };
  }

  static formatMoney(amount: number, currencyCode: string, locale?: string) {
    const numericAmount = Number(amount);
    const code = String(currencyCode || this.detectCustomerCurrency().code).toUpperCase();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
    }).format((Number.isFinite(numericAmount) ? numericAmount : 0) / 100);
  }

  static getCurrencyInfo(locale?: string): CurrencyInfo {
    const calculation = this.getShopBaseCurrency();
    const customerCurrency = this.detectCustomerCurrency();
    const symbol = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: customerCurrency.code,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0).find((part) => part.type === 'currency')?.value ?? customerCurrency.code;

    return {
      calculation,
      display: {
        code: customerCurrency.code,
        symbol,
        rate: customerCurrency.rate,
      },
      isMultiCurrency: customerCurrency.code !== calculation.code,
      locale,
    };
  }

  static convertMerchantAmountToPresentment(amount: number, currencyInfo: CurrencyInfo) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) return 0;
    if (!currencyInfo.isMultiCurrency) return Math.round(numericAmount);
    return Math.round(numericAmount * currencyInfo.display.rate);
  }

  static convertAndFormat(amount: number, currencyInfo: CurrencyInfo, locale?: string) {
    return this.formatMoney(amount, currencyInfo.display.code, locale ?? currencyInfo.locale);
  }
}
