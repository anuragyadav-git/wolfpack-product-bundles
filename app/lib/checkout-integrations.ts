export const CHECKOUT_INTEGRATION_PROVIDERS = [
  {
    id: "native",
    label: "Shopify checkout",
    callbackMode: "native",
    strategy: "native_redirect",
    requiresDiscountCode: false,
    requiresCartRefresh: false,
    timeoutMs: 0,
    fallbackAction: "checkout",
  },
  {
    id: "theme_cart_drawer",
    label: "Theme cart drawer",
    callbackMode: "side_cart",
    strategy: "shopify_standard_actions",
    requiresDiscountCode: false,
    requiresCartRefresh: true,
    timeoutMs: 1500,
    fallbackAction: "cart",
  },
] as const;

export type CheckoutIntegrationProvider = typeof CHECKOUT_INTEGRATION_PROVIDERS[number];
export type CheckoutIntegrationProviderId = CheckoutIntegrationProvider["id"];
export type CheckoutIntegrationCallbackMode = CheckoutIntegrationProvider["callbackMode"];
export type ThirdPartyCheckoutIntegrationProviderId = Exclude<CheckoutIntegrationProviderId, "native">;
export type DiscountCodeCheckoutIntegrationProviderId = Extract<
  CheckoutIntegrationProvider,
  { requiresDiscountCode: true }
>["id"];

export const CHECKOUT_INTEGRATION_PROVIDER_IDS = CHECKOUT_INTEGRATION_PROVIDERS.map(
  (provider) => provider.id,
) as CheckoutIntegrationProviderId[];

export const CHECKOUT_INTEGRATION_PROVIDER_OPTIONS = CHECKOUT_INTEGRATION_PROVIDERS.map(
  (provider) => provider.label,
);

export const CHECKOUT_INTEGRATION_PROVIDER_LABELS = Object.fromEntries(
  CHECKOUT_INTEGRATION_PROVIDERS.map((provider) => [provider.id, provider.label]),
) as Record<CheckoutIntegrationProviderId, string>;

const PROVIDERS_BY_ID = new Map<CheckoutIntegrationProviderId, CheckoutIntegrationProvider>(
  CHECKOUT_INTEGRATION_PROVIDERS.map((provider) => [provider.id, provider]),
);

const LABEL_TO_PROVIDER = new Map<string, CheckoutIntegrationProviderId>(
  Object.entries(CHECKOUT_INTEGRATION_PROVIDER_LABELS).map(([id, label]) => [
    label.toLowerCase(),
    id as CheckoutIntegrationProviderId,
  ]),
);

export function normalizeCheckoutIntegrationProvider(value: unknown): CheckoutIntegrationProviderId {
  if (typeof value !== "string") return "native";
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "native";
  if ((CHECKOUT_INTEGRATION_PROVIDER_IDS as readonly string[]).includes(normalized)) {
    return normalized as CheckoutIntegrationProviderId;
  }
  return LABEL_TO_PROVIDER.get(normalized) ?? "native";
}

export function getCheckoutIntegrationProvider(value: unknown): CheckoutIntegrationProvider {
  return PROVIDERS_BY_ID.get(normalizeCheckoutIntegrationProvider(value)) ?? CHECKOUT_INTEGRATION_PROVIDERS[0];
}

export function isDiscountCodeCheckoutIntegrationProvider(
  value: unknown,
): value is DiscountCodeCheckoutIntegrationProviderId {
  return getCheckoutIntegrationProvider(value).requiresDiscountCode;
}

export function isSupportedCheckoutIntegrationProvider(
  value: unknown,
): value is DiscountCodeCheckoutIntegrationProviderId {
  return isDiscountCodeCheckoutIntegrationProvider(value);
}
