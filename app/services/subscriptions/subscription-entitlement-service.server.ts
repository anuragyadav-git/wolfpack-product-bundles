import {
  getPlanEntitlements,
  type PlanEntitlements,
} from "../../lib/subscriptions/entitlements";
import {
  resolveSubscriptionState,
  type ProviderVerification,
  type ResolvedSubscriptionState,
} from "./subscription-resolution.server";

export interface SubscriptionShopRecord {
  id: string;
  shopDomain: string;
  shopifyShopGid: string | null;
}

export interface SubscriptionStateRepository {
  getShop(shopDomain: string): Promise<SubscriptionShopRecord | null>;
  getLatestVerification(shopId: string): Promise<ProviderVerification | null>;
  saveVerification(shopId: string, verification: ProviderVerification): Promise<void>;
}

export interface ManagedSubscriptionProvider {
  verify(shopifyShopGid: string, shopDomain: string): Promise<ProviderVerification>;
}

export interface SubscriptionEntitlementContext extends ResolvedSubscriptionState {
  shopId: string;
  shopDomain: string;
  entitlements: PlanEntitlements | null;
}

export interface ResolveShopSubscriptionInput {
  shopDomain: string;
  forceRefresh?: boolean;
}

export interface SubscriptionEntitlementServiceDependencies {
  repository: SubscriptionStateRepository;
  managedProvider: ManagedSubscriptionProvider;
  now?: () => Date;
  cacheTtlMs?: number;
  activeOutageGraceMs?: number;
}

const DEFAULT_CACHE_TTL_MS = 15 * 60 * 1000;

function isFresh(
  verification: ProviderVerification | null,
  now: Date,
  cacheTtlMs: number,
): verification is ProviderVerification {
  return Boolean(
    verification
      && now.getTime() - verification.verifiedAt.getTime() <= cacheTtlMs,
  );
}

function latestActiveGrowth(
  verifications: Array<ProviderVerification | null>,
): ProviderVerification | null {
  return verifications
    .filter((verification): verification is ProviderVerification =>
      verification?.outcome === "ACTIVE_GROWTH")
    .sort((left, right) => right.verifiedAt.getTime() - left.verifiedAt.getTime())[0]
    ?? null;
}

export class SubscriptionEntitlementService {
  private readonly now: () => Date;
  private readonly cacheTtlMs: number;
  private readonly activeOutageGraceMs?: number;

  constructor(private readonly dependencies: SubscriptionEntitlementServiceDependencies) {
    this.now = dependencies.now ?? (() => new Date());
    this.cacheTtlMs = dependencies.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
    this.activeOutageGraceMs = dependencies.activeOutageGraceMs;
  }

  async resolve(
    input: ResolveShopSubscriptionInput,
  ): Promise<SubscriptionEntitlementContext> {
    const now = this.now();
    const shop = await this.dependencies.repository.getShop(input.shopDomain);
    if (!shop) throw new Error("Subscription shop record not found");
    if (!shop.shopifyShopGid) throw new Error("Shopify shop GID is required for subscription verification");

    const cachedManaged = await this.dependencies.repository.getLatestVerification(shop.id);

    let managed = cachedManaged;
    const canUseCache = !input.forceRefresh
      && isFresh(cachedManaged, now, this.cacheTtlMs);

    if (!canUseCache) {
      managed = await this.dependencies.managedProvider.verify(
        shop.shopifyShopGid,
        shop.shopDomain,
      );
      await this.dependencies.repository.saveVerification(shop.id, managed);
    }

    if (!managed) {
      throw new Error("Subscription provider verification is incomplete");
    }

    const resolved = resolveSubscriptionState({
      now,
      managed,
      cached: latestActiveGrowth([cachedManaged]),
      activeOutageGraceMs: this.activeOutageGraceMs,
    });

    return {
      shopId: shop.id,
      shopDomain: shop.shopDomain,
      ...resolved,
      entitlements: resolved.planCode
        ? getPlanEntitlements(resolved.planCode, resolved.billingInterval)
        : null,
    };
  }
}
