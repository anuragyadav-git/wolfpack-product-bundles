import type { BillingInterval } from "../../lib/subscriptions/entitlements";
import type { ProviderVerification } from "./subscription-resolution.server";

export interface ShopifyAppPricingConfig {
  accessToken: string;
  appId: string;
}

const PARTNER_ORGANIZATION_ID = "4162406";
const PARTNER_API_VERSION = "2026-07";
const FREE_PLAN_HANDLE = "free";
const GROWTH_PLAN_HANDLE = "growth";

type ActiveSubscriptionResponse = {
  data?: {
    activeSubscription?: {
      billingPeriod?: string;
      items?: Array<{
        handle?: string | null;
        price?: { active?: boolean } | null;
      }>;
    } | null;
  };
  errors?: Array<{ message?: string }>;
};

const ACTIVE_SUBSCRIPTION_QUERY = `
  query ActiveSubscription($appId: ID!, $shopId: ID!) {
    activeSubscription(appId: $appId, shopId: $shopId) {
      billingPeriod
      items {
        handle
        price {
          __typename
          active
        }
      }
    }
  }
`;

export function getPartnerApiAccessToken(
  environment: Record<string, string | undefined> = process.env,
): string | null {
  const token = environment.SHOPIFY_PARTNER_API_ACCESS_TOKEN?.trim();
  return token?.length ? token : null;
}

function mapBillingInterval(value: string | undefined): BillingInterval {
  const normalized = value?.trim().toUpperCase();
  if (normalized === "ANNUAL" || normalized === "YEARLY") return "ANNUAL";
  if (normalized === "EVERY_30_DAYS" || normalized === "MONTHLY") return "MONTHLY";
  return "NONE";
}

export class ShopifyAppPricingClient {
  private readonly config: ShopifyAppPricingConfig;

  constructor(config: ShopifyAppPricingConfig) {
    this.config = config;
  }

  async verify(shopifyShopGid: string): Promise<ProviderVerification> {
    const verifiedAt = new Date();
    try {
      const response = await fetch(
        `https://partners.shopify.com/${PARTNER_ORGANIZATION_ID}/api/${PARTNER_API_VERSION}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": this.config.accessToken,
          },
          body: JSON.stringify({
            query: ACTIVE_SUBSCRIPTION_QUERY,
            variables: {
              appId: this.config.appId,
              shopId: shopifyShopGid,
            },
          }),
        },
      );

      if (!response.ok) {
        return this.unknown(verifiedAt, `http_${response.status}`);
      }

      const payload = await response.json() as ActiveSubscriptionResponse;
      if (payload.errors?.length) return this.unknown(verifiedAt, "graphql_error");

      const subscription = payload.data?.activeSubscription;
      if (subscription === null) {
        return {
          provider: "SHOPIFY_APP_PRICING",
          outcome: "NO_PAID_CONTRACT",
          status: "ACTIVE",
          planCode: "FREE",
          billingInterval: "NONE",
          verifiedAt,
        };
      }
      if (!subscription) return this.unknown(verifiedAt, "missing_active_subscription_field");

      const handles = (subscription.items ?? [])
        .filter((item) => item.price?.active !== false)
        .map((item) => item.handle?.trim())
        .filter((handle): handle is string => Boolean(handle));
      const hasGrowth = handles.includes(GROWTH_PLAN_HANDLE);
      const hasFree = handles.includes(FREE_PLAN_HANDLE);

      if (!hasGrowth && !hasFree) return this.unknown(verifiedAt, "unknown_item_handle");

      return {
        provider: "SHOPIFY_APP_PRICING",
        outcome: hasGrowth ? "ACTIVE_GROWTH" : "NO_PAID_CONTRACT",
        status: "ACTIVE",
        planCode: hasGrowth ? "GROWTH" : "FREE",
        billingInterval: hasGrowth
          ? mapBillingInterval(subscription.billingPeriod)
          : "NONE",
        verifiedAt,
        itemHandles: handles,
      };
    } catch {
      return this.unknown(verifiedAt, "network_error");
    }
  }

  private unknown(verifiedAt: Date, errorCode: string): ProviderVerification {
    return {
      provider: "SHOPIFY_APP_PRICING",
      outcome: "UNKNOWN",
      status: "UNKNOWN",
      planCode: null,
      billingInterval: "NONE",
      verifiedAt,
      errorCode,
    };
  }
}
