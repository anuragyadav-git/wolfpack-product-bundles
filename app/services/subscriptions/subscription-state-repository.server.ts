import db from "../../db.server";
import {
  SubscriptionBillingInterval as DatabaseBillingInterval,
  SubscriptionStatus as DatabaseSubscriptionStatus,
} from "@prisma/client";
import type {
  BillingInterval,
  PlanCode,
  SubscriptionStatus,
} from "../../lib/subscriptions/entitlements";
import type {
  ProviderOutcome,
  ProviderVerification,
} from "./subscription-resolution.server";
import type { SubscriptionStateRepository } from "./subscription-entitlement-service.server";

type DatabaseClient = typeof db;

function mapPlan(value: unknown): PlanCode | null {
  if (value === "growth") return "GROWTH";
  if (value === "free") return "FREE";
  return null;
}

function mapInterval(value: unknown): BillingInterval {
  if (value === "monthly") return "MONTHLY";
  if (value === "annual") return "ANNUAL";
  return "NONE";
}

function mapStatus(value: unknown): SubscriptionStatus {
  if (value === "active") return "ACTIVE";
  if (value === "pending") return "PENDING";
  if (value === "cancelled") return "CANCELLED";
  if (value === "frozen") return "FROZEN";
  if (value === "expired") return "EXPIRED";
  return "UNKNOWN";
}

function outcomeForSnapshot(input: {
  planCode: PlanCode | null;
  status: SubscriptionStatus;
  errorCode?: string | null;
}): ProviderOutcome {
  if (input.errorCode || input.status === "UNKNOWN") return "UNKNOWN";
  if (input.status === "CANCELLED") return "CANCELLED";
  if (input.status === "FROZEN") return "FROZEN";
  if (input.status === "EXPIRED") return "EXPIRED";
  if (input.status === "PENDING") return "PENDING";
  return input.planCode === "GROWTH" ? "ACTIVE_GROWTH" : "NO_PAID_CONTRACT";
}

function databaseStatus(status: SubscriptionStatus): DatabaseSubscriptionStatus {
  return status.toLowerCase() as DatabaseSubscriptionStatus;
}

function databaseInterval(interval: BillingInterval): DatabaseBillingInterval {
  return interval.toLowerCase() as DatabaseBillingInterval;
}

export class PrismaSubscriptionStateRepository implements SubscriptionStateRepository {
  constructor(private readonly database: DatabaseClient = db) {}

  async getShop(shopDomain: string) {
    return this.database.shop.findUnique({
      where: { shopDomain },
      select: {
        id: true,
        shopDomain: true,
        shopifyShopGid: true,
      },
    });
  }

  async getLatestVerification(shopId: string): Promise<ProviderVerification | null> {
    const snapshot = await this.database.subscription.findFirst({
      where: {
        shopId,
        provider: "shopify_app_pricing",
        lastVerifiedAt: { not: null },
      },
      orderBy: { lastVerifiedAt: "desc" },
    });
    if (!snapshot?.lastVerifiedAt) return null;

    const planCode = mapPlan(snapshot.plan);
    const status = mapStatus(snapshot.status);
    return {
      provider: "SHOPIFY_APP_PRICING",
      outcome: outcomeForSnapshot({
        planCode,
        status,
        errorCode: snapshot.verificationErrorCode,
      }),
      status,
      planCode: status === "UNKNOWN" ? null : planCode,
      billingInterval: mapInterval(snapshot.billingInterval),
      verifiedAt: snapshot.lastVerifiedAt,
      itemHandles: Array.isArray(snapshot.itemHandles)
        ? snapshot.itemHandles.filter((value): value is string => typeof value === "string")
        : [],
      errorCode: snapshot.verificationErrorCode ?? undefined,
    };
  }

  async saveVerification(
    shopId: string,
    verification: ProviderVerification,
  ): Promise<void> {
    const provider = "shopify_app_pricing" as const;
    const data = {
      shopId,
      provider,
      plan: verification.planCode === "GROWTH" ? "growth" : "free",
      billingInterval: databaseInterval(verification.billingInterval),
      status: databaseStatus(verification.status),
      name: verification.planCode === "GROWTH" ? "Growth" : "Free",
      itemHandles: verification.itemHandles ?? [],
      lastVerifiedAt: verification.verifiedAt,
      verificationErrorCode: verification.errorCode ?? null,
    } as const;

    const existing = await this.database.subscription.findFirst({
      where: { shopId, provider },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });

    if (existing) {
      await this.database.subscription.update({
        where: { id: existing.id },
        data,
      });
      return;
    }

    await this.database.subscription.create({ data });
  }
}
