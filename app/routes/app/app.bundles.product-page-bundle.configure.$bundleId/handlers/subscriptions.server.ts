import { json } from "@remix-run/node";
import type { Session } from "@shopify/shopify-api";
import type { ShopifyAdmin } from "../../../../lib/auth-guards.server";
import db from "../../../../db.server";
import { BundleType } from "../../../../constants/bundle";
import { ERROR_MESSAGES } from "../../../../constants/errors";
import {
  extractSellingPlanValidationSources,
  SUBSCRIPTION_NO_COMMON_PLAN_MESSAGE,
} from "../../../../lib/bundle-config/product-page-admin-sections";
import type {
  NormalizedSellingPlanPricingPolicy,
  PpbSubscriptionPlan,
} from "../../../../lib/ppb-subscriptions";

type SellingPlanGroupResult = {
  id: string;
  name: string;
  options: string[];
  position: number;
  plans: Array<PpbSubscriptionPlan & { position: number }>;
  eligibleVariantIds: string[];
};

function normalizePricingPolicy(policy: any): NormalizedSellingPlanPricingPolicy | null {
  const adjustmentType = String(policy?.adjustmentType ?? "").toUpperCase();
  const percentage = Number(policy?.adjustmentValue?.percentage);
  const amount = Number(policy?.adjustmentValue?.amount);
  const afterCycle = Number(policy?.afterCycle ?? 0);
  if (adjustmentType === "PERCENTAGE" && Number.isFinite(percentage)) {
    return { kind: "percentage", value: percentage, afterCycle };
  }
  if (adjustmentType === "FIXED_AMOUNT" && Number.isFinite(amount)) {
    return {
      kind: "fixed_amount",
      value: Math.round(amount * 100),
      afterCycle,
      currencyCode: policy.adjustmentValue?.currencyCode,
    };
  }
  if (adjustmentType === "PRICE" && Number.isFinite(amount)) {
    return {
      kind: "fixed_price",
      value: Math.round(amount * 100),
      afterCycle,
      currencyCode: policy.adjustmentValue?.currencyCode,
    };
  }
  return null;
}

async function fetchProductsWithSellingPlanGroups(
  admin: ShopifyAdmin,
  productIds: string[],
  variantIdsByProductId: Record<string, string[]>,
) {
  const products: Array<{
    id: string;
    title: string;
    variantIds: string[];
    sellingPlanGroups: { nodes: SellingPlanGroupResult[] };
  }> = [];

  const query = `
    query ProductWithSellingPlanGroups($id: ID!) {
      node(id: $id) {
        ... on Product {
          id
          title
          sellingPlanGroups(first: 50) {
            nodes {
              id
              name
              options
              position
              appliesToProduct(productId: $id)
              productVariants(first: 250) { nodes { id } }
              sellingPlans(first: 50) {
                nodes {
                  id
                  name
                  options
                  position
                  pricingPolicies {
                    ... on SellingPlanFixedPricingPolicy {
                      adjustmentType
                      adjustmentValue {
                        ... on MoneyV2 { amount currencyCode }
                        ... on SellingPlanPricingPolicyPercentageValue { percentage }
                      }
                    }
                    ... on SellingPlanRecurringPricingPolicy {
                      afterCycle
                      adjustmentType
                      adjustmentValue {
                        ... on MoneyV2 { amount currencyCode }
                        ... on SellingPlanPricingPolicyPercentageValue { percentage }
                      }
                    }
                  }
                }
              }
            }
          }
          variants(first: 250) { nodes { id } }
        }
      }
    }
  `;

  for (const id of productIds) {
    const response = await admin.graphql(query, { variables: { id } });
    const data = (await response.json()) as {
      data?: {
        node?: {
          id?: string;
          title?: string;
          variants?: { nodes?: Array<{ id?: string }> };
          sellingPlanGroups?: { nodes?: any[] };
        } | null;
      };
    };

    const product = data.data?.node;
    if (!product?.id) continue;
    const variantIds = variantIdsByProductId[product.id] ?? (product.variants?.nodes ?? [])
      .map((variant) => variant?.id)
      .filter((variantId): variantId is string => typeof variantId === "string");
    products.push({
        id: product.id,
        title: product.title ?? "",
        variantIds,
        sellingPlanGroups: {
          nodes: (product.sellingPlanGroups?.nodes ?? []).filter(
            (group): group is any =>
              typeof group?.id === "string" && typeof group?.name === "string",
          ).map((group) => ({
            id: group.id,
            name: group.name,
            options: Array.isArray(group.options) ? group.options.filter((option: unknown) => typeof option === "string") : [],
            position: Number(group.position ?? 0),
            eligibleVariantIds: group.appliesToProduct === true
              ? variantIds
              : (group.productVariants?.nodes ?? [])
                .map((variant: any) => variant?.id)
                .filter((variantId: unknown): variantId is string => typeof variantId === "string"),
            plans: (group.sellingPlans?.nodes ?? []).map((plan: any) => ({
              id: plan.id,
              sourceName: plan.name ?? "",
              options: Array.isArray(plan.options) ? plan.options : [],
              position: Number(plan.position ?? 0),
              pricingPolicies: (plan.pricingPolicies ?? [])
                .map(normalizePricingPolicy)
                .filter((policy: NormalizedSellingPlanPricingPolicy | null): policy is NormalizedSellingPlanPricingPolicy => policy !== null),
            })).filter((plan: PpbSubscriptionPlan & { position: number }) => typeof plan.id === "string"),
          })),
        },
      });
  }

  return products;
}

async function fetchCollectionProductIds(
  admin: ShopifyAdmin,
  collectionIds: string[],
) {
  const products: string[] = [];
  const seen = new Set<string>();

  const query = `
    query CollectionProductsForSellingPlanValidation($id: ID!, $after: String) {
      node(id: $id) {
        ... on Collection {
          products(first: 100, after: $after) {
            edges {
              node {
                id
              }
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
    }
  `;

  for (const id of collectionIds) {
    let after: string | null = null;
    do {
    const response = await admin.graphql(query, { variables: { id, after } });
    const data = (await response.json()) as {
      data?: {
        node?: {
          id?: string;
          products?: {
            edges?: Array<{ node?: { id?: string } }>;
            pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
          };
        };
      };
    };
      const collection = data.data?.node;
      const edges = collection?.products?.edges ?? [];
      for (const edge of edges) {
        const productId = edge.node?.id;
        if (typeof productId !== "string" || productId.trim() === "") continue;
        if (seen.has(productId)) continue;
        seen.add(productId);
        products.push(productId);
      }
      after = collection?.products?.pageInfo?.hasNextPage
        ? collection.products.pageInfo.endCursor ?? null
        : null;
    } while (after);
  }

  return products;
}

function deriveCommonGroups(products: Awaited<ReturnType<typeof fetchProductsWithSellingPlanGroups>>) {
  if (products.length === 0) return [];
  const common = new Map(products[0].sellingPlanGroups.nodes.map((group) => [group.id, group]));
  for (const product of products) {
    const validGroupIds = new Set(product.sellingPlanGroups.nodes
      .filter((group) => group.plans.length > 0 && product.variantIds.every((variantId) => group.eligibleVariantIds.includes(variantId)))
      .map((group) => group.id));
    for (const groupId of common.keys()) {
      if (!validGroupIds.has(groupId)) common.delete(groupId);
    }
  }
  return Array.from(common.values())
    .map(({ eligibleVariantIds: _eligibleVariantIds, ...group }) => ({
      ...group,
      plans: [...group.plans].sort((left, right) => left.position - right.position || left.id.localeCompare(right.id)),
    }))
    .sort((left, right) => left.position - right.position || left.id.localeCompare(right.id));
}

export async function handleValidateSellingPlanGroups(
  admin: ShopifyAdmin,
  session: Session,
  bundleId: string,
) {
  const bundle = await db.bundle.findFirst({
    where: {
      id: bundleId,
      shopId: session.shop,
      bundleType: BundleType.PRODUCT_PAGE,
    },
    include: {
      steps: {
        include: {
          StepProduct: true,
          StepCategory: true,
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!bundle) {
    return json(
      { success: false, error: ERROR_MESSAGES.BUNDLE_NOT_FOUND },
      { status: 404 },
    );
  }

  const sources = extractSellingPlanValidationSources(bundle);
  const collectionProductIds = await fetchCollectionProductIds(
    admin,
    sources.collectionIds,
  );
  const allProductIds = Array.from(
    new Set([...sources.productIds, ...collectionProductIds]),
  );
  if (allProductIds.length === 0) {
    return json({
      success: true,
      isValid: false,
      productCount: 0,
      plans: [],
      message: SUBSCRIPTION_NO_COMMON_PLAN_MESSAGE,
    });
  }

  const products = await fetchProductsWithSellingPlanGroups(
    admin,
    allProductIds,
    sources.variantIdsByProductId,
  );
  const groups = deriveCommonGroups(products);
  const isValid =
    allProductIds.length > 0 &&
    products.length === allProductIds.length &&
    groups.length > 0;

  return json({
    success: true,
    isValid,
    productCount: products.length,
    groups,
    message: isValid ? null : SUBSCRIPTION_NO_COMMON_PLAN_MESSAGE,
  });
}
