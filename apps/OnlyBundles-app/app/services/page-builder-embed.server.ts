import {
  resolveFpbLoadingScreenSettings,
  type FpbLoadingScreenSettings,
} from "../lib/fpb-loading-screen";
import type { PageBuilderEmbedRequest } from "../lib/page-builder-embed";
import { resolveOfferSchedule } from "../lib/offer-policy-decision";
import { resolveOfferCountryEligibility } from "../lib/offer-country-eligibility";

type Database = {
  bundle: {
    findFirst: (args: Record<string, unknown>) => Promise<Record<string, any> | null>;
  };
  designSettings: {
    findUnique: (args: Record<string, unknown>) => Promise<{ generalSettings?: unknown } | null>;
  };
};

const bundleInclude = {
  steps: {
    orderBy: { position: "asc" },
    include: {
      StepProduct: { orderBy: { position: "asc" } },
      StepCategory: { orderBy: { sortOrder: "asc" } },
    },
  },
  pricing: true,
  offerPolicy: true,
};

export type PageBuilderEmbedResolution = {
  bundle: Record<string, any>;
  loadingScreen: FpbLoadingScreenSettings | null;
};

export async function resolvePageBuilderEmbed(
  database: Database,
  shopDomain: string,
  request: PageBuilderEmbedRequest,
  now = new Date(),
): Promise<PageBuilderEmbedResolution | null> {
  const where = request.bundleType === "product_page"
    ? {
        shopId: shopDomain,
        bundleType: "product_page",
        shopifyProductHandle: request.parentProductHandle,
        status: { in: ["active", "unlisted"] },
        OR: [
          { offerPolicy: { is: null } },
          { offerPolicy: { is: { specificLinkRequired: false } } },
        ],
      }
    : {
        shopId: shopDomain,
        bundleType: "full_page",
        publicNumber: request.publicNumber,
        status: { in: ["active", "unlisted"] },
        OR: [
          { offerPolicy: { is: null } },
          { offerPolicy: { is: { specificLinkRequired: false } } },
        ],
      };
  const bundle = await database.bundle.findFirst({ where, include: bundleInclude });
  if (!bundle) return null;
  if (!resolveOfferSchedule(bundle.offerPolicy ?? {}, now).effective) return null;
  if (!resolveOfferCountryEligibility(bundle.offerPolicy, request.countryCode)) return null;

  if (request.bundleType === "product_page") {
    return { bundle, loadingScreen: null };
  }

  const designSettings = await database.designSettings.findUnique({
    where: {
      shopId_bundleType: {
        shopId: shopDomain,
        bundleType: "full_page",
      },
    },
    select: { generalSettings: true },
  });
  return {
    bundle,
    loadingScreen: resolveFpbLoadingScreenSettings(designSettings?.generalSettings),
  };
}
