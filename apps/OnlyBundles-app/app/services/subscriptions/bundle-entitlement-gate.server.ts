import {
  EntitlementDeniedError,
  detectBundleRequirements,
  type BundleEntitlementCandidate,
  type PlanEntitlements,
} from "../../lib/subscriptions/entitlements";
import { Prisma } from "@prisma/client";
import db from "../../db.server";

const PUBLICATION_TRANSACTION_TIMEOUT_MS = 10_000;

export interface BundlePublicationGateInput {
  candidate: BundleEntitlementCandidate;
  entitlements: PlanEntitlements | null;
  otherPublicBundleCount: number;
}

function isPublicStatus(status: BundleEntitlementCandidate["status"]): boolean {
  return status === "ACTIVE" || status === "UNLISTED";
}

export function assertBundlePublicationAllowed(
  input: BundlePublicationGateInput,
): void {
  if (!isPublicStatus(input.candidate.status)) return;

  if (!input.entitlements) {
    throw new EntitlementDeniedError({
      code: "BILLING_UNVERIFIED",
      entitlement: "bundle.public.limit",
      remediation: "RETRY",
    });
  }

  const publicLimit = input.entitlements.limits.publicBundles;
  if (
    publicLimit !== null
    && input.otherPublicBundleCount >= publicLimit
  ) {
    throw new EntitlementDeniedError({
      code: "LIMIT_REACHED",
      entitlement: "bundle.public.limit",
      currentUsage: input.otherPublicBundleCount,
      limit: publicLimit,
      remediation: "EDIT_CONFIGURATION",
    });
  }

  const requirements = detectBundleRequirements(input.candidate);
  if (requirements.includes("bundle.steps.limit")) {
    const stepLimit = input.entitlements.limits.enabledSteps;
    if (stepLimit !== null && input.candidate.enabledStepCount > stepLimit) {
      throw new EntitlementDeniedError({
        code: "LIMIT_REACHED",
        entitlement: "bundle.steps.limit",
        currentUsage: input.candidate.enabledStepCount,
        limit: stepLimit,
        remediation: "EDIT_CONFIGURATION",
      });
    }
  }

  if (
    requirements.includes("bundle.template.premium")
    && !input.entitlements.capabilities.premiumTemplates
  ) {
    throw new EntitlementDeniedError({
      code: "ENTITLEMENT_REQUIRED",
      entitlement: "bundle.template.premium",
      remediation: "UPGRADE",
    });
  }

  if (
    requirements.includes("design.advanced")
    && !input.entitlements.capabilities.advancedDesign
  ) {
    throw new EntitlementDeniedError({
      code: "ENTITLEMENT_REQUIRED",
      entitlement: "design.advanced",
      remediation: "UPGRADE",
    });
  }
}

export interface UpdateBundleWithPublicationGateInput {
  database?: typeof db;
  shopDomain: string;
  bundleId: string;
  candidate: BundleEntitlementCandidate;
  entitlements: PlanEntitlements | null;
  data: Prisma.BundleUpdateInput | Prisma.BundleUncheckedUpdateInput;
  include?: Prisma.BundleInclude;
  enforce?: boolean;
  now?: Date;
}

export async function updateBundleWithPublicationGate<T = unknown>(
  input: UpdateBundleWithPublicationGateInput,
): Promise<T> {
  const database = input.database ?? db;
  const enforce = input.enforce ?? true;
  const publicMutation = isPublicStatus(input.candidate.status);

  if (!publicMutation) {
    return database.bundle.update({
      where: { id: input.bundleId, shopId: input.shopDomain },
      data: input.data,
      ...(input.include ? { include: input.include } : {}),
    } as any) as unknown as Promise<T>;
  }

  if (!enforce) {
    return database.bundle.update({
      where: { id: input.bundleId, shopId: input.shopDomain },
      data: { ...input.data, publishedAt: input.now ?? new Date() },
      ...(input.include ? { include: input.include } : {}),
    } as any) as unknown as Promise<T>;
  }

  return database.$transaction(async (transaction) => {
    await transaction.$queryRaw(Prisma.sql`
      SELECT "id"
      FROM "Shop"
      WHERE "shopDomain" = ${input.shopDomain}
      FOR UPDATE
    `);
    const existingBundle = await transaction.bundle.findUnique({
      where: { id: input.bundleId, shopId: input.shopDomain },
      select: { status: true, publishedAt: true },
    });
    const wasAlreadyPublic = existingBundle?.status === "active"
      || existingBundle?.status === "unlisted";
    const publishedAt = wasAlreadyPublic && existingBundle.publishedAt
      ? existingBundle.publishedAt
      : input.now ?? new Date();
    const otherPublicBundleCount = await transaction.bundle.count({
      where: {
        shopId: input.shopDomain,
        id: { not: input.bundleId },
        status: { in: ["active", "unlisted"] },
      },
    });
    assertBundlePublicationAllowed({
      candidate: input.candidate,
      entitlements: input.entitlements,
      otherPublicBundleCount,
    });
    return transaction.bundle.update({
      where: { id: input.bundleId, shopId: input.shopDomain },
      data: { ...input.data, publishedAt },
      ...(input.include ? { include: input.include } : {}),
    } as any) as unknown as Promise<T>;
  }, {
    timeout: PUBLICATION_TRANSACTION_TIMEOUT_MS,
  }) as Promise<T>;
}
