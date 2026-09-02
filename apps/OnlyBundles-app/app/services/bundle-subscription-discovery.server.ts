import { json } from "@remix-run/node";
import type { Session } from "@shopify/shopify-api";
import type { ShopifyAdmin } from "../lib/auth-guards.server";
import db from "../db.server";
import { ERROR_MESSAGES } from "../constants/errors";
import {
  extractSellingPlanValidationSources,
  SUBSCRIPTION_NO_COMMON_PLAN_MESSAGE,
  supportsBundleSubscriptions,
} from "../lib/bundle-subscriptions";
import type {
  NormalizedSellingPlanPricingPolicy,
  BundleSubscriptionPlan,
} from "../lib/bundle-subscriptions";

type SellingPlanGroupResult = {
  id: string;
  name: string;
  options: string[];
  position: number;
  plans: Array<BundleSubscriptionPlan & { position: number }>;
  eligibleVariantIds: string[];
};

const PRODUCT_BATCH_SIZE = 25;
const COLLECTION_BATCH_SIZE = 50;
const SELLING_PLAN_GROUP_BATCH_SIZE = 25;
const CONNECTION_PAGE_SIZE = 250;

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
  type ProductResult = {
    id: string;
    title: string;
    variantIds: string[];
    sellingPlanGroups: { nodes: SellingPlanGroupResult[] };
  };
  type ProductNode = {
    id?: string;
    title?: string;
    variants?: {
      nodes?: Array<{ id?: string }>;
      pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
    };
    sellingPlanGroups?: { nodes?: any[] };
  };

  const productNodes: ProductNode[] = [];

  const query = `
    query ProductsWithSellingPlanGroupsBatch($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Product {
          id
          title
          sellingPlanGroups(first: 50) {
            nodes {
              id
              name
              options
              position
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
          variants(first: ${CONNECTION_PAGE_SIZE}) {
            nodes { id }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
    }
  `;
  const uniqueProductIds = [...new Set(productIds)];
  for (let index = 0; index < uniqueProductIds.length; index += PRODUCT_BATCH_SIZE) {
    const ids = uniqueProductIds.slice(index, index + PRODUCT_BATCH_SIZE);
    const response = await admin.graphql(query, { variables: { ids } });
    const data = await response.json() as { data?: { nodes?: ProductNode[] } };
    productNodes.push(...(data.data?.nodes ?? []).filter((node): node is ProductNode => Boolean(node?.id)));
  }

  const groupIds = [...new Set(productNodes.flatMap((product) =>
    (product.sellingPlanGroups?.nodes ?? [])
      .map((group: any) => group?.id)
      .filter((id: unknown): id is string => typeof id === "string"),
  ))];
  const groupAssignments = await fetchSellingPlanGroupAssignments(admin, groupIds);
  const products: ProductResult[] = [];

  for (const productData of productNodes) {
    if (!productData.id) continue;
    const configuredVariantIds = variantIdsByProductId[productData.id] ?? [];
    const discoveredVariantIds = (productData.variants?.nodes ?? [])
      .map((variant) => variant?.id)
      .filter((id): id is string => typeof id === "string");
    let after = configuredVariantIds.length === 0 && productData.variants?.pageInfo?.hasNextPage
      ? productData.variants.pageInfo.endCursor ?? null
      : null;
    while (after) {
      const response = await admin.graphql(`
        query ProductVariantsForSellingPlanValidation($id: ID!, $after: String!) {
          node(id: $id) {
            ... on Product {
              variants(first: ${CONNECTION_PAGE_SIZE}, after: $after) {
                nodes { id }
                pageInfo { hasNextPage endCursor }
              }
            }
          }
        }
      `, { variables: { id: productData.id, after } });
      const data = await response.json();
      const variants = data.data?.node?.variants;
      for (const variant of variants?.nodes ?? []) {
        if (typeof variant?.id === "string" && !discoveredVariantIds.includes(variant.id)) {
          discoveredVariantIds.push(variant.id);
        }
      }
      after = variants?.pageInfo?.hasNextPage ? variants.pageInfo.endCursor ?? null : null;
    }

    const variantIds = configuredVariantIds.length > 0
      ? configuredVariantIds
      : discoveredVariantIds;
    const groups: SellingPlanGroupResult[] = [];
    for (const group of (productData.sellingPlanGroups?.nodes ?? []).filter(
      (candidate): candidate is any =>
        typeof candidate?.id === "string" && typeof candidate?.name === "string",
    )) {
      const assignments = groupAssignments.get(group.id);
      const eligibleVariantIds = assignments?.productIds.has(productData.id)
        ? [...variantIds]
        : variantIds.filter((variantId) => assignments?.variantIds.has(variantId));
      groups.push({
        id: group.id,
        name: group.name,
        options: Array.isArray(group.options)
          ? group.options.filter((option: unknown) => typeof option === "string")
          : [],
        position: Number(group.position ?? 0),
        eligibleVariantIds,
        plans: (group.sellingPlans?.nodes ?? []).map((plan: any) => ({
          id: plan.id,
          sourceName: plan.name ?? "",
          options: Array.isArray(plan.options) ? plan.options : [],
          position: Number(plan.position ?? 0),
          pricingPolicies: (plan.pricingPolicies ?? [])
            .map((policy: any) => normalizePricingPolicy(policy))
            .filter((policy: NormalizedSellingPlanPricingPolicy | null): policy is NormalizedSellingPlanPricingPolicy => policy !== null),
        })).filter((plan: BundleSubscriptionPlan & { position: number }) => typeof plan.id === "string"),
      });
    }
    products.push({
      id: productData.id,
      title: productData.title ?? "",
      variantIds,
      sellingPlanGroups: { nodes: groups },
    });
  }

  return products;
}

async function fetchSellingPlanGroupAssignments(
  admin: ShopifyAdmin,
  groupIds: string[],
) {
  const assignments = new Map<string, { productIds: Set<string>; variantIds: Set<string> }>();
  const query = `
    query SellingPlanGroupAssignmentsBatch($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on SellingPlanGroup {
          id
          products(first: ${CONNECTION_PAGE_SIZE}) {
            nodes { id }
            pageInfo { hasNextPage endCursor }
          }
          productVariants(first: ${CONNECTION_PAGE_SIZE}) {
            nodes { id }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
    }
  `;

  for (let index = 0; index < groupIds.length; index += SELLING_PLAN_GROUP_BATCH_SIZE) {
    const ids = groupIds.slice(index, index + SELLING_PLAN_GROUP_BATCH_SIZE);
    const response = await admin.graphql(query, { variables: { ids } });
    const data = await response.json();
    for (const group of data.data?.nodes ?? []) {
      if (typeof group?.id !== "string") continue;
      const entry = {
        productIds: new Set<string>((group.products?.nodes ?? []).map((product: any) => product?.id).filter(Boolean)),
        variantIds: new Set<string>((group.productVariants?.nodes ?? []).map((variant: any) => variant?.id).filter(Boolean)),
      };
      assignments.set(group.id, entry);
      await appendSellingPlanGroupAssignmentPages(admin, group.id, "products", group.products?.pageInfo, entry.productIds);
      await appendSellingPlanGroupAssignmentPages(admin, group.id, "productVariants", group.productVariants?.pageInfo, entry.variantIds);
    }
  }

  return assignments;
}

async function appendSellingPlanGroupAssignmentPages(
  admin: ShopifyAdmin,
  groupId: string,
  connection: "products" | "productVariants",
  initialPageInfo: { hasNextPage?: boolean; endCursor?: string | null } | undefined,
  target: Set<string>,
) {
  let after = initialPageInfo?.hasNextPage ? initialPageInfo.endCursor ?? null : null;
  while (after) {
    const operationName = connection === "products"
      ? "SellingPlanGroupProductsPage"
      : "SellingPlanGroupVariantsPage";
    const response = await admin.graphql(`
      query ${operationName}($id: ID!, $after: String!) {
        node(id: $id) {
          ... on SellingPlanGroup {
            ${connection}(first: ${CONNECTION_PAGE_SIZE}, after: $after) {
              nodes { id }
              pageInfo { hasNextPage endCursor }
            }
          }
        }
      }
    `, { variables: { id: groupId, after } });
    const data = await response.json();
    const page = data.data?.node?.[connection];
    for (const node of page?.nodes ?? []) {
      if (typeof node?.id === "string") target.add(node.id);
    }
    after = page?.pageInfo?.hasNextPage ? page.pageInfo.endCursor ?? null : null;
  }
}

async function fetchCollectionProductIds(
  admin: ShopifyAdmin,
  collectionIds: string[],
) {
  const products: string[] = [];
  const seen = new Set<string>();

  const query = `
    query CollectionProductsForSellingPlanValidationBatch($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Collection {
          id
          products(first: ${CONNECTION_PAGE_SIZE}) {
            nodes { id }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
    }
  `;

  const uniqueCollectionIds = [...new Set(collectionIds)];
  for (let index = 0; index < uniqueCollectionIds.length; index += COLLECTION_BATCH_SIZE) {
    const ids = uniqueCollectionIds.slice(index, index + COLLECTION_BATCH_SIZE);
    const response = await admin.graphql(query, { variables: { ids } });
    const data = await response.json();
    for (const collection of data.data?.nodes ?? []) {
      for (const product of collection?.products?.nodes ?? []) {
        const productId = product?.id;
        if (typeof productId !== "string" || productId.trim() === "") continue;
        if (seen.has(productId)) continue;
        seen.add(productId);
        products.push(productId);
      }
      let after = collection?.products?.pageInfo?.hasNextPage
        ? collection.products.pageInfo.endCursor ?? null
        : null;
      while (after) {
        const pageResponse = await admin.graphql(`
          query CollectionProductsForSellingPlanValidationPage($id: ID!, $after: String!) {
            node(id: $id) {
              ... on Collection {
                products(first: ${CONNECTION_PAGE_SIZE}, after: $after) {
                  nodes { id }
                  pageInfo { hasNextPage endCursor }
                }
              }
            }
          }
        `, { variables: { id: collection.id, after } });
        const pageData = await pageResponse.json();
        const page = pageData.data?.node?.products;
        for (const product of page?.nodes ?? []) {
          if (typeof product?.id !== "string" || seen.has(product.id)) continue;
          seen.add(product.id);
          products.push(product.id);
        }
        after = page?.pageInfo?.hasNextPage ? page.pageInfo.endCursor ?? null : null;
      }
    }
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
    .map(({ eligibleVariantIds: _eligibleVariantIds, ...group }: any) => ({
      ...group,
      plans: [...group.plans].sort((left, right) => left.position - right.position || left.id.localeCompare(right.id)),
    }))
    .sort((left, right) => left.position - right.position || left.id.localeCompare(right.id));
}

export async function handleValidateSellingPlanGroups(
  admin: ShopifyAdmin,
  session: Session,
  bundleId: string,
  bundleType: "full_page" | "product_page",
) {
  if (!supportsBundleSubscriptions(bundleType)) {
    return json(
      { success: false, error: ERROR_MESSAGES.BUNDLE_NOT_FOUND },
      { status: 404 },
    );
  }
  const bundle = await db.bundle.findFirst({
    where: {
      id: bundleId,
      shopId: session.shop,
      bundleType,
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
