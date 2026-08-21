const CHECKOUT_INTEGRATION_PROVIDERS: any[] = [
  {
    id: 'native',
    label: 'Shopify checkout',
    callbackMode: 'native',
    strategy: 'native_redirect',
    requiresDiscountCode: false,
    requiresCartRefresh: false,
    timeoutMs: 0,
    fallbackAction: 'checkout',
  },
  {
    id: 'theme_cart_drawer',
    label: 'Theme cart drawer',
    callbackMode: 'side_cart',
    strategy: 'shopify_standard_actions',
    requiresDiscountCode: false,
    requiresCartRefresh: true,
    timeoutMs: 1500,
    fallbackAction: 'cart',
  },
  {
    id: 'gokwik',
    label: 'GoKwik',
    callbackMode: 'checkout_handoff',
    strategy: 'third_party_checkout',
    requiresDiscountCode: true,
    requiresCartRefresh: false,
    timeoutMs: 1500,
    fallbackAction: 'checkout',
  },
  {
    id: 'shopflo',
    label: 'Shopflo',
    callbackMode: 'checkout_handoff',
    strategy: 'third_party_checkout',
    requiresDiscountCode: true,
    requiresCartRefresh: false,
    timeoutMs: 1500,
    fallbackAction: 'checkout',
  },
  {
    id: 'zecpay', label: 'Zecpay', callbackMode: 'checkout_handoff', strategy: 'third_party_checkout',
    requiresDiscountCode: true, requiresCartRefresh: false, timeoutMs: 1500, fallbackAction: 'checkout',
  },
  {
    id: 'rebuy', label: 'Rebuy', callbackMode: 'side_cart', strategy: 'third_party_side_cart',
    requiresDiscountCode: false, requiresCartRefresh: true, timeoutMs: 1500, fallbackAction: 'cart',
  },
  {
    id: 'shiprocket_fastrr', label: 'Shiprocket / Fastrr', callbackMode: 'checkout_handoff', strategy: 'third_party_checkout',
    requiresDiscountCode: true, requiresCartRefresh: false, timeoutMs: 1500, fallbackAction: 'checkout',
  },
  {
    id: 'monster_cart', label: 'Monster Cart', callbackMode: 'side_cart', strategy: 'third_party_side_cart',
    requiresDiscountCode: false, requiresCartRefresh: true, timeoutMs: 1500, fallbackAction: 'cart',
  },
  {
    id: 'upcart', label: 'UpCart', callbackMode: 'side_cart', strategy: 'third_party_side_cart',
    requiresDiscountCode: false, requiresCartRefresh: true, timeoutMs: 1500, fallbackAction: 'cart',
  },
  {
    id: 'kaching_cart', label: 'Kaching Cart', callbackMode: 'side_cart', strategy: 'third_party_side_cart',
    requiresDiscountCode: false, requiresCartRefresh: true, timeoutMs: 1500, fallbackAction: 'cart',
  },
];

const CHECKOUT_INTEGRATION_PROVIDER_IDS = CHECKOUT_INTEGRATION_PROVIDERS.map((provider) => provider.id);

const CHECKOUT_INTEGRATION_PROVIDER_OPTIONS = CHECKOUT_INTEGRATION_PROVIDERS.map((provider) => provider.label);

const CHECKOUT_INTEGRATION_PROVIDER_LABELS = Object.fromEntries(
  CHECKOUT_INTEGRATION_PROVIDERS.map((provider) => [provider.id, provider.label]),
);

const PROVIDERS_BY_ID = new Map(
  CHECKOUT_INTEGRATION_PROVIDERS.map((provider) => [provider.id, provider]),
);

const LABEL_TO_PROVIDER = new Map(
  Object.entries(CHECKOUT_INTEGRATION_PROVIDER_LABELS).map(([id, label]: any) => [
    String(label).toLowerCase(),
    id,
  ]),
);

export { CHECKOUT_INTEGRATION_PROVIDERS };
export { CHECKOUT_INTEGRATION_PROVIDER_OPTIONS };
export { CHECKOUT_INTEGRATION_PROVIDER_LABELS };

export function normalizeCheckoutIntegrationProvider(value: string) {
  if (typeof value !== 'string') return 'native';
  const normalized = value.trim().toLowerCase();
  if (!normalized) return 'native';
  if (CHECKOUT_INTEGRATION_PROVIDER_IDS.includes(normalized)) return normalized;
  return LABEL_TO_PROVIDER.get(normalized) ?? 'native';
}

export function getCheckoutIntegrationProvider(value: any) {
  return PROVIDERS_BY_ID.get(normalizeCheckoutIntegrationProvider(value))
    ?? CHECKOUT_INTEGRATION_PROVIDERS[0];
}

export function isDiscountCodeCheckoutIntegrationProvider(value: any) {
  return getCheckoutIntegrationProvider(value).requiresDiscountCode;
}

export function isSupportedCheckoutIntegrationProvider(value: any) {
  return isDiscountCodeCheckoutIntegrationProvider(value);
}

function getCapability(providerId: string, runtimeWindow: any, options: any = {}) {
  const provider = getCheckoutIntegrationProvider(providerId);
  const shopifyActions = runtimeWindow?.Shopify?.actions;

  if (provider.id === 'native') {
    return { available: true, capability: 'native_redirect', provider };
  }

  if (provider.id === 'theme_cart_drawer') {
    if (
      typeof shopifyActions?.updateCart === 'function'
      && typeof shopifyActions?.openCart === 'function'
    ) {
      return { available: true, capability: 'shopify_standard_actions', provider };
    }
    return {
      available: typeof options.openThemeCartDrawer === 'function',
      capability: 'theme_cart_callback',
      provider,
    };
  }

  if (provider.id === 'gokwik') {
    if (typeof runtimeWindow?.gokwikSdk?.initCheckout === 'function') {
      return {
        available: true,
        capability: 'gokwik_sdk_callback',
        provider,
      };
    }
    return {
      available: typeof options.openGokwikCheckout === 'function',
      capability: 'gokwik_callback',
      provider,
    };
  }

  if (provider.id === 'shopflo') {
    if (typeof runtimeWindow?.Shopflo?.openCheckout === 'function') {
      return {
        available: true,
        capability: 'shopflo_sdk_callback',
        provider,
      };
    }
    return {
      available: typeof options.openShopfloCheckout === 'function',
      capability: 'shopflo_callback',
      provider,
    };
  }

  if (provider.id === 'zecpay') {
    return {
      available: typeof runtimeWindow?.zecpeCheckFunctionAndCall === 'function',
      capability: 'zecpay_callback',
      provider,
    };
  }
  if (provider.id === 'shiprocket_fastrr') {
    return {
      available: typeof runtimeWindow?.shiprocketCheckoutBuyCartHandler === 'function',
      capability: 'shiprocket_fastrr_callback',
      provider,
    };
  }
  if (provider.id === 'rebuy') {
    return {
      available: typeof runtimeWindow?.Cart?.getCart === 'function',
      capability: 'rebuy_cart_callback',
      provider,
    };
  }
  if (provider.id === 'upcart') {
    return {
      available: typeof runtimeWindow?.upcartOpenCart === 'function',
      capability: 'upcart_callback',
      provider,
    };
  }
  if (provider.id === 'kaching_cart') {
    return {
      available: typeof runtimeWindow?.kachingCartApi?.openCart === 'function'
        && typeof runtimeWindow?.kachingCartApi?.refreshCart === 'function',
      capability: 'kaching_cart_callback',
      provider,
    };
  }
  if (provider.id === 'monster_cart') {
    return {
      available: typeof options.openThemeCartDrawer === 'function',
      capability: 'monster_cart_callback',
      provider,
    };
  }

  return { available: false, capability: 'unknown', provider };
}

export function detectCheckoutIntegrationCapability(providerId: string, runtimeWindow: any, options: any = {}) {
  return getCapability(providerId, runtimeWindow, options);
}

export async function waitForCheckoutIntegrationCapability(
  providerId: string,
  runtimeWindow: any,
  options: any = {},
) {
  const provider = getCheckoutIntegrationProvider(providerId);
  const timeoutMs = options.timeoutMs ?? provider.timeoutMs;
  const pollIntervalMs = options.pollIntervalMs ?? 50;
  const startedAt = Date.now();
  let capability = getCapability(provider.id, runtimeWindow, options);

  while (!capability.available && Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    capability = getCapability(provider.id, runtimeWindow, options);
  }

  return capability.available
    ? capability
    : { ...capability, reason: 'capability-timeout' };
}

export function claimCheckoutIntegrationInvocation(state: Set<string>, lifecycleKey: string) {
  if (!state || typeof state.has !== 'function' || typeof state.add !== 'function') {
    return false;
  }
  if (state.has(lifecycleKey)) return false;
  state.add(lifecycleKey);
  return true;
}

async function runProviderInvocation(provider: any, runtimeWindow: any, options: any, capability: string) {
  if (provider.id === 'native') {
    return true;
  }

  if (capability === 'shopify_standard_actions') {
    const updateResult = await runtimeWindow.Shopify.actions.updateCart({});
    if (updateResult?.userErrors?.length) {
      return {
        ok: false,
        phase: 'cart-refresh',
        reason: 'cart-update-rejected',
      };
    }
    return runtimeWindow.Shopify.actions.openCart();
  }
  if (capability === 'theme_cart_callback') {
    return options.openThemeCartDrawer();
  }
  if (capability === 'gokwik_sdk_callback') {
    return runtimeWindow?.gokwikSdk?.initCheckout?.(options.checkoutUrl);
  }
  if (capability === 'gokwik_callback') {
    return options.openGokwikCheckout();
  }
  if (capability === 'shopflo_sdk_callback') {
    return runtimeWindow?.Shopflo?.openCheckout?.();
  }
  if (capability === 'shopflo_callback') {
    return options.openShopfloCheckout();
  }
  if (capability === 'zecpay_callback') {
    return runtimeWindow.zecpeCheckFunctionAndCall('handleOcc');
  }
  if (capability === 'shiprocket_fastrr_callback') {
    return runtimeWindow.shiprocketCheckoutBuyCartHandler();
  }
  if (capability === 'rebuy_cart_callback') {
    return runtimeWindow.Cart.getCart();
  }
  if (capability === 'upcart_callback') {
    return runtimeWindow.upcartOpenCart();
  }
  if (capability === 'kaching_cart_callback') {
    await runtimeWindow.kachingCartApi.refreshCart();
    return runtimeWindow.kachingCartApi.openCart();
  }
  if (capability === 'monster_cart_callback') {
    return options.openThemeCartDrawer();
  }
  return true;
}

function runProviderInvocationWithTimeout(invocationPromise: Promise<any>, timeoutMs: number|undefined) {
  if (timeoutMs === undefined || timeoutMs <= 0) return invocationPromise;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => resolve({ timedOut: true }), timeoutMs);
    invocationPromise.then(
      (result: unknown) => {
        clearTimeout(timeoutId);
        resolve(result);
      },
      (error: any) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

export async function invokeCheckoutIntegrationProvider(
  providerId: string,
  runtimeWindow: any,
  options: any = {},
) {
  const capability = getCapability(providerId, runtimeWindow, options);
  const provider = capability.provider;

  if (!capability.available) {
    return {
      ok: false,
      phase: 'capability',
      reason: 'capability-unavailable',
      capability: capability.capability,
      provider,
    };
  }

  try {
    const timeoutMs = options.timeoutMs ?? provider.timeoutMs;
    const invocationPromise = runProviderInvocation(
      provider,
      runtimeWindow,
      options,
      capability.capability,
    );
    const invocationResult = await runProviderInvocationWithTimeout(invocationPromise, timeoutMs);

    if (invocationResult?.timedOut) {
      return {
        ok: false,
        phase: 'invoke',
        reason: 'invocation-timeout',
        capability: capability.capability,
        provider,
      };
    }
    if (invocationResult?.ok === false) {
      return {
        ...invocationResult,
        capability: capability.capability,
        provider,
      };
    }
    if (invocationResult === false) {
      return {
        ok: false,
        phase: 'invoke',
        reason: 'invocation-blocked',
        capability: capability.capability,
        provider,
      };
    }

    return { ok: true, capability: capability.capability, provider };
  } catch {
    return {
      ok: false,
      phase: 'invoke',
      reason: 'callback-error',
      capability: capability.capability,
      provider,
    };
  }
}
