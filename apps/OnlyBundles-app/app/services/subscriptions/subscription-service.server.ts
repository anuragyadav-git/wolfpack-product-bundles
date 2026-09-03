import type { ProviderVerification } from "./subscription-resolution.server";
import {
  SubscriptionEntitlementService,
  type ManagedSubscriptionProvider,
  type ResolveShopSubscriptionInput,
  type SubscriptionEntitlementContext,
  type SubscriptionStateRepository,
} from "./subscription-entitlement-service.server";
import {
  getPartnerApiAccessToken,
  ShopifyAppPricingClient,
} from "./shopify-app-pricing.server";
import { PrismaSubscriptionStateRepository } from "./subscription-state-repository.server";
import { getInstalledShopifyAppIdentity } from "./shopify-app-identity.server";

class UnavailableManagedPricingProvider implements ManagedSubscriptionProvider {
  async verify(): Promise<ProviderVerification> {
    return {
      provider: "SHOPIFY_APP_PRICING",
      outcome: "UNKNOWN",
      status: "UNKNOWN",
      planCode: null,
      billingInterval: "NONE",
      verifiedAt: new Date(),
      errorCode: "missing_partner_api_configuration",
    };
  }
}

export interface CreateSubscriptionServiceOptions {
  repository?: SubscriptionStateRepository;
  managedProvider?: ManagedSubscriptionProvider;
}

export function createSubscriptionEntitlementService(
  options: CreateSubscriptionServiceOptions = {},
): SubscriptionEntitlementService {
  const partnerApiAccessToken = getPartnerApiAccessToken();
  return new SubscriptionEntitlementService({
    repository: options.repository ?? new PrismaSubscriptionStateRepository(),
    managedProvider: options.managedProvider
      ?? (partnerApiAccessToken
        ? {
          verify: async (shopifyShopGid, shopDomain) => {
            const app = await getInstalledShopifyAppIdentity(shopDomain);
            return new ShopifyAppPricingClient({
              accessToken: partnerApiAccessToken,
              appId: app.id,
            }).verify(shopifyShopGid);
          },
        }
        : new UnavailableManagedPricingProvider()),
  });
}

export async function resolveShopEntitlements(
  input: ResolveShopSubscriptionInput,
): Promise<SubscriptionEntitlementContext> {
  return createSubscriptionEntitlementService().resolve(input);
}
