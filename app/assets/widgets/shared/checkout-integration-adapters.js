import {
  getCheckoutIntegrationProvider,
} from '../../../lib/checkout-integrations.ts';

export { getCheckoutIntegrationProvider };

function getCapability(providerId, runtimeWindow, options = {}) {
  const provider = getCheckoutIntegrationProvider(providerId);
  const shopifyActions = runtimeWindow?.Shopify?.actions;

  if (provider.id === 'native') {
    return { available: true, capability: 'native_redirect', provider };
  }

  if (provider.id === 'custom_script') {
    return {
      available: typeof options.executeScript === 'function',
      capability: 'merchant_script',
      provider,
    };
  }

  if (provider.id === 'theme_cart_drawer' || provider.id === 'monster_cart') {
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
    return {
      available: typeof runtimeWindow?.gokwikSdk?.initCheckout === 'function',
      capability: 'installed_sdk',
      provider,
    };
  }

  if (provider.id === 'shopflo') {
    return {
      available:
      typeof runtimeWindow?.Shopflo?.openFloCheckout === 'function'
      && typeof options.checkoutUrl === 'string'
      && options.checkoutUrl.length > 0,
      capability: 'token_checkout_url',
      provider,
    };
  }

  if (provider.id === 'zecpay') {
    return {
      available: typeof runtimeWindow?.zecpeCheckFunctionAndCall === 'function',
      capability: 'installed_sdk',
      provider,
    };
  }

  if (provider.id === 'rebuy') {
    return {
      available: typeof runtimeWindow?.Rebuy?.init === 'function'
        || typeof runtimeWindow?.Cart?.getCart === 'function',
      capability: 'installed_sdk',
      provider,
    };
  }

  if (provider.id === 'shiprocket_fastrr') {
    return {
      available: typeof runtimeWindow?.shiprocketCheckoutBuyCartHandler === 'function',
      capability: 'installed_sdk',
      provider,
    };
  }

  if (provider.id === 'upcart') {
    return {
      available: typeof runtimeWindow?.upcartOpenCart === 'function',
      capability: 'installed_sdk',
      provider,
    };
  }

  if (provider.id === 'kaching_cart') {
    return {
      available: typeof runtimeWindow?.kachingCartApi?.openCart === 'function'
        || typeof runtimeWindow?.kachingCartApi?.refreshCart === 'function',
      capability: 'installed_sdk',
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

  if (provider.id === 'custom_script') {
    return options.executeScript();
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
  if (provider.id === 'gokwik') {
    return runtimeWindow.gokwikSdk.initCheckout(
      runtimeWindow.merchantInfo || runtimeWindow.gokwikMerchantInfo || undefined,
    );
  }
  if (provider.id === 'shopflo' && capability === 'token_checkout_url') {
    return runtimeWindow.Shopflo.openFloCheckout(options.checkoutUrl);
  }
  if (provider.id === 'zecpay') {
    return runtimeWindow.zecpeCheckFunctionAndCall('handleOcc');
  }
  if (provider.id === 'rebuy') {
    if (typeof runtimeWindow.Rebuy?.init === 'function') {
      return runtimeWindow.Rebuy.init();
    }
    return runtimeWindow.Cart.getCart();
  }
  if (provider.id === 'shiprocket_fastrr') {
    return runtimeWindow.shiprocketCheckoutBuyCartHandler();
  }
  if (provider.id === 'upcart') {
    return runtimeWindow.upcartOpenCart();
  }
  if (provider.id === 'kaching_cart') {
    if (typeof runtimeWindow.kachingCartApi.refreshCart === 'function') {
      await runtimeWindow.kachingCartApi.refreshCart();
    }
    if (typeof runtimeWindow.kachingCartApi.openCart === 'function') {
      return runtimeWindow.kachingCartApi.openCart();
    }
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
