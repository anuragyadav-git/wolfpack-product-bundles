const DEFAULT_LOW_STOCK_THRESHOLD = 5;
const DEFAULT_LOW_STOCK_MESSAGE = "Only {{stock}} left";
const LOW_STOCK_MESSAGE_TOKEN = "{{stock}}";
const MAX_LOW_STOCK_MESSAGE_LENGTH = 200;

export interface LowStockAlertSettings {
  lowStockAlertEnabled: boolean;
  lowStockAlertThreshold: number;
  lowStockAlertMessage: string;
}

export interface LowStockAlertConfig {
  enabled: boolean;
  threshold: number;
  message: string;
}

export interface LowStockComponentInventory {
  quantityAvailable: number | null;
  currentlyNotInStock?: boolean | null;
  availableForSale?: boolean | null;
  requiredQuantity?: number | null;
}

export interface LowStockAlertValidationIssue {
  path: "settings.lowStockThreshold" | "settings.lowStockMessage";
  message: string;
}

export function parseLowStockAlertSettings(
  formData: FormData,
): LowStockAlertSettings {
  const thresholdValue = formData.get("lowStockAlertThreshold");
  const parsedThreshold =
    typeof thresholdValue === "string" && thresholdValue.trim() !== ""
      ? Number(thresholdValue)
      : DEFAULT_LOW_STOCK_THRESHOLD;
  const messageValue = formData.get("lowStockAlertMessage");

  return {
    lowStockAlertEnabled: formData.get("lowStockAlertEnabled") === "true",
    lowStockAlertThreshold: parsedThreshold,
    lowStockAlertMessage:
      typeof messageValue === "string" && messageValue.trim() !== ""
        ? messageValue.trim()
        : DEFAULT_LOW_STOCK_MESSAGE,
  };
}

export function validateLowStockAlertSettings(
  settings: LowStockAlertSettings,
): LowStockAlertValidationIssue[] {
  const issues: LowStockAlertValidationIssue[] = [];
  if (
    !Number.isInteger(settings.lowStockAlertThreshold) ||
    settings.lowStockAlertThreshold < 1 ||
    settings.lowStockAlertThreshold > 1000
  ) {
    issues.push({
      path: "settings.lowStockThreshold",
      message: "Enter a whole number from 1 to 1000.",
    });
  }
  if (!settings.lowStockAlertMessage.includes(LOW_STOCK_MESSAGE_TOKEN)) {
    issues.push({
      path: "settings.lowStockMessage",
      message: "Include {{stock}} in the message.",
    });
  }
  if (settings.lowStockAlertMessage.length > MAX_LOW_STOCK_MESSAGE_LENGTH) {
    issues.push({
      path: "settings.lowStockMessage",
      message: "Keep the message at 200 characters or fewer.",
    });
  }
  return issues;
}

export function resolveLowStockAlert(
  config: LowStockAlertConfig,
  components: LowStockComponentInventory[],
): { stock: number; message: string } | null {
  if (
    config.enabled !== true ||
    !Number.isInteger(config.threshold) ||
    config.threshold < 1 ||
    config.threshold > 1000 ||
    !config.message.includes(LOW_STOCK_MESSAGE_TOKEN)
  ) {
    return null;
  }

  const requiredComponents: LowStockComponentInventory[] = [];
  for (const component of components) {
    const requiredQuantity = component.requiredQuantity ?? 1;
    if (requiredQuantity === 0) continue;
    if (!Number.isInteger(requiredQuantity) || requiredQuantity < 0) return null;
    requiredComponents.push(component);
  }
  if (requiredComponents.length === 0) return null;

  const bundleQuantities = requiredComponents.map((component) => {
    if (
      component.currentlyNotInStock === true ||
      component.availableForSale === false ||
      typeof component.quantityAvailable !== "number" ||
      !Number.isFinite(component.quantityAvailable) ||
      component.quantityAvailable <= 0
    ) {
      return null;
    }
    const requiredQuantity = component.requiredQuantity ?? 1;
    return Math.floor(component.quantityAvailable / requiredQuantity);
  });
  if (bundleQuantities.some((quantity) => quantity === null)) return null;

  const stock = Math.min(...(bundleQuantities as number[]));
  if (stock <= 0 || stock > config.threshold) return null;

  return {
    stock,
    message: config.message.replaceAll(LOW_STOCK_MESSAGE_TOKEN, String(stock)),
  };
}
