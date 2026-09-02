import { normalizeStorefrontQuantityAvailable } from "../../../app/lib/storefront-variant-inventory";
import {
  parseLowStockAlertSettings,
  resolveLowStockAlert,
  validateLowStockAlertSettings,
} from "../../../app/lib/low-stock-alert";

describe("normalizeStorefrontQuantityAvailable", () => {
  it("treats sellable zero-quantity variants as unbounded inventory", () => {
    expect(
      normalizeStorefrontQuantityAvailable({
        availableForSale: true,
        quantityAvailable: 0,
        currentlyNotInStock: false,
      }),
    ).toBeNull();
  });

  it("keeps true unavailable zero-quantity variants bounded at zero", () => {
    expect(
      normalizeStorefrontQuantityAvailable({
        availableForSale: false,
        quantityAvailable: 0,
        currentlyNotInStock: false,
      }),
    ).toBe(0);
  });

  it("preserves positive quantity values", () => {
    expect(
      normalizeStorefrontQuantityAvailable({
        availableForSale: true,
        quantityAvailable: 7,
        currentlyNotInStock: false,
      }),
    ).toBe(7);
  });
});

describe("low-stock alert", () => {
  it("parses canonical defaults and direct merchant settings", () => {
    expect(parseLowStockAlertSettings(new FormData())).toEqual({
      lowStockAlertEnabled: false,
      lowStockAlertThreshold: 5,
      lowStockAlertMessage: "Only {{stock}} left",
    });

    const formData = new FormData();
    formData.set("lowStockAlertEnabled", "true");
    formData.set("lowStockAlertThreshold", "8");
    formData.set("lowStockAlertMessage", "Hurry, {{stock}} remaining");

    expect(parseLowStockAlertSettings(formData)).toEqual({
      lowStockAlertEnabled: true,
      lowStockAlertThreshold: 8,
      lowStockAlertMessage: "Hurry, {{stock}} remaining",
    });
  });

  it.each(["0", "1001", "2.5", "invalid"])(
    "rejects invalid threshold %s",
    (threshold) => {
      const formData = new FormData();
      formData.set("lowStockAlertEnabled", "true");
      formData.set("lowStockAlertThreshold", threshold);
      formData.set("lowStockAlertMessage", "Only {{stock}} left");

      expect(
        validateLowStockAlertSettings(parseLowStockAlertSettings(formData)),
      ).toContainEqual({
        path: "settings.lowStockThreshold",
        message: "Enter a whole number from 1 to 1000.",
      });
    },
  );

  it("requires the stock token and limits copy to 200 characters", () => {
    expect(
      validateLowStockAlertSettings({
        lowStockAlertEnabled: true,
        lowStockAlertThreshold: 5,
        lowStockAlertMessage: "Almost gone",
      }),
    ).toContainEqual({
      path: "settings.lowStockMessage",
      message: "Include {{stock}} in the message.",
    });

    expect(
      validateLowStockAlertSettings({
        lowStockAlertEnabled: true,
        lowStockAlertThreshold: 5,
        lowStockAlertMessage: `${"x".repeat(191)}{{stock}}xx`,
      }),
    ).toContainEqual({
      path: "settings.lowStockMessage",
      message: "Keep the message at 200 characters or fewer.",
    });
  });

  it("keeps disabled merchant settings valid for later re-enablement", () => {
    expect(
      validateLowStockAlertSettings({
        lowStockAlertEnabled: false,
        lowStockAlertThreshold: Number.NaN,
        lowStockAlertMessage: "Almost gone",
      }),
    ).toEqual([
      {
        path: "settings.lowStockThreshold",
        message: "Enter a whole number from 1 to 1000.",
      },
      {
        path: "settings.lowStockMessage",
        message: "Include {{stock}} in the message.",
      },
    ]);
  });

  it("suppresses disabled, unknown, zero, unavailable, and backorder states", () => {
    const config = {
      enabled: true,
      threshold: 5,
      message: "Only {{stock}} left",
    };

    expect(resolveLowStockAlert({ ...config, enabled: false }, [
      { quantityAvailable: 3, requiredQuantity: 1 },
    ])).toBeNull();
    expect(resolveLowStockAlert(config, [
      { quantityAvailable: null, requiredQuantity: 1 },
    ])).toBeNull();
    expect(resolveLowStockAlert(config, [
      { quantityAvailable: 0, requiredQuantity: 1 },
    ])).toBeNull();
    expect(resolveLowStockAlert(config, [
      { quantityAvailable: 3, requiredQuantity: 1, availableForSale: false },
    ])).toBeNull();
    expect(resolveLowStockAlert(config, [
      { quantityAvailable: 3, requiredQuantity: 1, currentlyNotInStock: true },
    ])).toBeNull();
  });

  it("uses the minimum required-component ratio and ignores optional components", () => {
    expect(resolveLowStockAlert({
      enabled: true,
      threshold: 5,
      message: "Only {{stock}} bundles left — {{stock}} total",
    }, [
      { quantityAvailable: 12, requiredQuantity: 2, availableForSale: true },
      { quantityAvailable: 4, requiredQuantity: 1, availableForSale: true },
      { quantityAvailable: null, requiredQuantity: 0, availableForSale: true },
    ])).toEqual({
      stock: 4,
      message: "Only 4 bundles left — 4 total",
    });
  });

  it("hides stock above the configured threshold", () => {
    expect(resolveLowStockAlert({
      enabled: true,
      threshold: 3,
      message: "Only {{stock}} left",
    }, [
      { quantityAvailable: 4, requiredQuantity: 1, availableForSale: true },
    ])).toBeNull();
  });

  it("shows stock exactly at the configured threshold", () => {
    expect(resolveLowStockAlert({
      enabled: true,
      threshold: 4,
      message: "Only {{stock}} left",
    }, [
      { quantityAvailable: 4, requiredQuantity: 1, availableForSale: true },
    ])).toEqual({ stock: 4, message: "Only 4 left" });
  });

  it("suppresses an aggregate when a required quantity is invalid", () => {
    expect(resolveLowStockAlert({
      enabled: true,
      threshold: 5,
      message: "Only {{stock}} left",
    }, [
      { quantityAvailable: 4, requiredQuantity: -1, availableForSale: true },
    ])).toBeNull();
  });
});
