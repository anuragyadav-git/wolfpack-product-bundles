const CHECKOUT_INTEGRATION_PROVIDERS = [
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
  Object.entries(CHECKOUT_INTEGRATION_PROVIDER_LABELS).map(([id, label]) => [
    String(label).toLowerCase(),
    id,
  ]),
);

export { CHECKOUT_INTEGRATION_PROVIDERS };
export { CHECKOUT_INTEGRATION_PROVIDER_OPTIONS };
export { CHECKOUT_INTEGRATION_PROVIDER_LABELS };

export function normalizeCheckoutIntegrationProvider(value) {
  if (typeof value !== 'string') return 'native';
  const normalized = value.trim().toLowerCase();
  if (!normalized) return 'native';
  if (CHECKOUT_INTEGRATION_PROVIDER_IDS.includes(normalized)) return normalized;
  return LABEL_TO_PROVIDER.get(normalized) ?? 'native';
}

export function getCheckoutIntegrationProvider(value) {
  return PROVIDERS_BY_ID.get(normalizeCheckoutIntegrationProvider(value))
    ?? CHECKOUT_INTEGRATION_PROVIDERS[0];
}

export function isDiscountCodeCheckoutIntegrationProvider(value) {
  return getCheckoutIntegrationProvider(value).requiresDiscountCode;
}

export function isSupportedCheckoutIntegrationProvider(value) {
  return isDiscountCodeCheckoutIntegrationProvider(value);
}

function getCapability(providerId, runtimeWindow, options = {}) {
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

  return { available: false, capability: 'unknown', provider };
}

export function detectCheckoutIntegrationCapability(providerId, runtimeWindow, options = {}) {
  return getCapability(providerId, runtimeWindow, options);
}

export async function waitForCheckoutIntegrationCapability(
  providerId,
  runtimeWindow,
  options = {},
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

export function claimCheckoutIntegrationInvocation(state, lifecycleKey) {
  if (!state || typeof state.has !== 'function' || typeof state.add !== 'function') {
    return false;
  }
  if (state.has(lifecycleKey)) return false;
  state.add(lifecycleKey);
  return true;
}

async function runProviderInvocation(provider, runtimeWindow, options, capability) {
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
  return true;
}

function runProviderInvocationWithTimeout(invocationPromise, timeoutMs) {
  if (timeoutMs <= 0) return invocationPromise;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => resolve({ timedOut: true }), timeoutMs);
    invocationPromise.then(
      (result) => {
        clearTimeout(timeoutId);
        resolve(result);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

export async function invokeCheckoutIntegrationProvider(
  providerId,
  runtimeWindow,
  options = {},
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
