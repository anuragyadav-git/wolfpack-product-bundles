import { createHmac, timingSafeEqual } from "node:crypto";
import { buildPriceAdjustmentConfig } from "./bundles/metafield-sync/utils/price-adjustment";
import { collectAddonComponentVariants } from "./bundles/metafield-sync/utils/addon-components";
import {
  buildPublicBundleSubscriptionConfig,
  shouldApplyBundleDiscount,
} from "../lib/bundle-subscriptions";

const RUNTIME_TOKEN_VERSION = 1;
const RUNTIME_TOKEN_SECRET_CONTEXT = "wpb-runtime-token:";

export type RuntimeTokenDiscount = {
  type: "PERCENTAGE";
  value: number;
};

export type RuntimeTokenLine = {
  variantId: string;
  quantity: number;
};

export type RuntimeTokenAddonLine = RuntimeTokenLine & {
  discount?: RuntimeTokenDiscount | null;
};

export type RuntimeTokenPayload = {
  version: 1;
  shop: string;
  bundleId: string;
  bundleType: string;
  offerGroupId: string;
  parentVariantId: string;
  bundleName: string;
  components: RuntimeTokenLine[];
  addons: RuntimeTokenAddonLine[];
  priceAdjustment: unknown;
  subscription?: {
    sellingPlanGroupId: string;
    sellingPlanId: string;
    recurringBundleDiscount: boolean;
  };
};

type SelectionInput = {
  components?: Array<{ variantId?: unknown; productId?: unknown; quantity?: unknown }>;
  addons?: Array<{ variantId?: unknown; quantity?: unknown; discount?: unknown }>;
  subscription?: {
    sellingPlanGroupId?: unknown;
    sellingPlanId?: unknown;
    recurringBundleDiscount?: unknown;
  };
};

function normalizeSubscriptionSelection(bundle: any, value: SelectionInput["subscription"]) {
  if (!value) return undefined;
  const config = buildPublicBundleSubscriptionConfig(bundle?.bundleSubscriptionConfig);
  const sellingPlanGroupId = String(value.sellingPlanGroupId ?? "").trim();
  const sellingPlanId = String(value.sellingPlanId ?? "").trim();
  if (!config || config.selectedGroup?.id !== sellingPlanGroupId) {
    throw new Error("Subscription selling-plan group is not enabled for this bundle");
  }
  if (!config.selectedPlanIds.includes(sellingPlanId)) {
    throw new Error("Subscription selling plan is not enabled for this bundle");
  }
  if ((value.recurringBundleDiscount === true) !== config.recurringBundleDiscount) {
    throw new Error("Recurring bundle discount selection does not match the saved bundle configuration");
  }
  return {
    sellingPlanGroupId,
    sellingPlanId,
    recurringBundleDiscount: config.recurringBundleDiscount,
  };
}

export function normalizeProductVariantGid(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const raw = String(value).trim();
  if (!raw) return null;
  if (raw.startsWith("gid://shopify/ProductVariant/")) return raw;
  if (/^\d+$/.test(raw)) return `gid://shopify/ProductVariant/${raw}`;
  return null;
}

function normalizeProductGid(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const raw = String(value).trim();
  if (!raw) return null;
  if (raw.startsWith("gid://shopify/Product/")) return raw;
  if (/^\d+$/.test(raw)) return `gid://shopify/Product/${raw}`;
  return null;
}

function getCachedVariantGid(variant: any): string | null {
  return normalizeProductVariantGid(
    variant?.id
      ?? variant?.gid
      ?? variant?.variantId
      ?? variant?.variantGraphqlId
      ?? variant?.graphqlId
      ?? variant?.admin_graphql_api_id,
  );
}

function getCachedProductGid(product: any): string | null {
  return normalizeProductGid(
    product?.productId
      ?? product?.id
      ?? product?.gid
      ?? product?.productGraphqlId
      ?? product?.graphqlId
      ?? product?.admin_graphql_api_id,
  );
}

function collectAllowedSelectionIds(bundle: any): { variantIds: Set<string>; productIds: Set<string> } {
  const variantIds = new Set<string>();
  const productIds = new Set<string>();

  const addVariant = (variant: unknown) => {
    const variantId = getCachedVariantGid(variant);
    if (variantId) variantIds.add(variantId);
  };

  const addProduct = (product: any) => {
    const productId = getCachedProductGid(product);
    if (productId) productIds.add(productId);
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    variants.forEach(addVariant);
    const directVariantId = normalizeProductVariantGid(product?.variantId ?? product?.selectedVariantId);
    if (directVariantId) variantIds.add(directVariantId);
  };

  for (const step of Array.isArray(bundle?.steps) ? bundle.steps : []) {
    for (const stepProduct of Array.isArray(step?.StepProduct) ? step.StepProduct : []) {
      addProduct(stepProduct);
    }
    for (const product of Array.isArray(step?.products) ? step.products : []) {
      addProduct(product);
    }
    const categories = Array.isArray(step?.StepCategory) ? step.StepCategory : [];
    for (const category of categories) {
      const categoryProducts = Array.isArray(category?.products) ? category.products : [];
      for (const product of categoryProducts) {
        addProduct(product);
      }
    }
  }

  for (const addonVariant of collectAddonComponentVariants(bundle?.personalizationData)) {
    if (addonVariant.variantId) variantIds.add(addonVariant.variantId);
  }

  return { variantIds, productIds };
}

function normalizeQuantity(value: unknown): number {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Runtime token line quantity must be a positive integer");
  }
  return quantity;
}

function normalizeDiscount(value: unknown): RuntimeTokenDiscount | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as { type?: unknown; value?: unknown };
  const type = String(input.type ?? "").toUpperCase();
  const discountValue = Number(input.value);
  if (type !== "PERCENTAGE" || !Number.isFinite(discountValue) || discountValue <= 0) {
    return null;
  }
  return { type: "PERCENTAGE", value: Math.min(100, discountValue) };
}

function normalizeLines(
  lines: SelectionInput["components"],
  allowedIds: { variantIds: Set<string>; productIds: Set<string> },
): RuntimeTokenLine[] {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error("Runtime token payload must include selected components");
  }

  return lines.map((line) => {
    const variantId = normalizeProductVariantGid(line?.variantId);
    const productId = normalizeProductGid(line?.productId);
    const isAllowedVariant = Boolean(variantId && allowedIds.variantIds.has(variantId));
    const isAllowedHydratedProduct = Boolean(productId && allowedIds.productIds.has(productId));
    if (!variantId || (!isAllowedVariant && !isAllowedHydratedProduct)) {
      throw new Error(`Selected variant is not part of bundle: ${String(line?.variantId ?? "")}`);
    }
    return {
      variantId,
      quantity: normalizeQuantity(line?.quantity),
    };
  });
}

function normalizeAddonLines(
  lines: SelectionInput["addons"],
  allowedVariantIds: Set<string>,
): RuntimeTokenAddonLine[] {
  if (!Array.isArray(lines)) return [];

  return lines.map((line) => {
    const variantId = normalizeProductVariantGid(line?.variantId);
    if (!variantId || !allowedVariantIds.has(variantId)) {
      throw new Error(`Selected add-on variant is not part of bundle: ${String(line?.variantId ?? "")}`);
    }
    return {
      variantId,
      quantity: normalizeQuantity(line?.quantity),
      discount: normalizeDiscount(line?.discount),
    };
  });
}

export function validateRuntimeTokenSelection(bundle: any, selection: SelectionInput) {
  const allowedIds = collectAllowedSelectionIds(bundle);
  if (allowedIds.variantIds.size === 0 && allowedIds.productIds.size === 0) {
    throw new Error("Bundle has no cached selectable variants for runtime validation");
  }

  return {
    components: normalizeLines(selection.components, allowedIds),
    addons: normalizeAddonLines(selection.addons, allowedIds.variantIds),
    subscription: normalizeSubscriptionSelection(bundle, selection.subscription),
  };
}

export async function validateLiveSellingPlanSelection(
  admin: { graphql: (query: string, options: any) => Promise<{ json: () => Promise<any> }> },
  selection: NonNullable<RuntimeTokenPayload["subscription"]>,
  components: RuntimeTokenLine[],
) {
  if (components.length === 0) return;

  const variantIds = [...new Set(components.map((component) => component.variantId))];
  const productIdByVariantId = new Map<string, string>();
  const variantQuery = `
    query ResolveRuntimeSellingPlanVariants($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on ProductVariant {
          id
          product { id }
        }
      }
    }
  `;

  for (let index = 0; index < variantIds.length; index += 50) {
    const ids = variantIds.slice(index, index + 50);
    const response = await admin.graphql(variantQuery, { variables: { ids } });
    const data = await response.json();
    for (const node of data.data?.nodes ?? []) {
      if (typeof node?.id === "string" && typeof node?.product?.id === "string") {
        productIdByVariantId.set(node.id, node.product.id);
      }
    }
  }

  const assignments = variantIds.map((variantId) => ({
    variantId,
    productId: productIdByVariantId.get(variantId),
  }));
  if (assignments.some(({ productId }) => typeof productId !== "string")) {
    throw new Error("Selected subscription variant no longer exists");
  }

  let planValidated = false;
  for (let start = 0; start < assignments.length; start += 25) {
    const batch = assignments.slice(start, start + 25) as Array<{
      variantId: string;
      productId: string;
    }>;
    const variableDefinitions = batch.flatMap((_, index) => [
      `$productId${index}: ID!`,
      `$variantId${index}: ID!`,
    ]).join(", ");
    const assignmentFields = batch.map((_, index) => `
      product${index}: appliesToProduct(productId: $productId${index})
      variant${index}: appliesToProductVariant(productVariantId: $variantId${index})
    `).join("\n");
    const groupQuery = `
      query ValidateRuntimeSellingPlanAssignments($id: ID!, ${variableDefinitions}) {
        node(id: $id) {
          ... on SellingPlanGroup {
            ${planValidated ? "" : "sellingPlans(first: 250) { nodes { id } }"}
            ${assignmentFields}
          }
        }
      }
    `;
    const variables: Record<string, string> = { id: selection.sellingPlanGroupId };
    batch.forEach((assignment, index) => {
      variables[`productId${index}`] = assignment.productId;
      variables[`variantId${index}`] = assignment.variantId;
    });

    const response = await admin.graphql(groupQuery, { variables });
    const data = await response.json();
    const group = data.data?.node;
    if (!group) {
      throw new Error("Saved subscription selling-plan group no longer exists");
    }
    if (!planValidated) {
      const planIds = new Set((group.sellingPlans?.nodes ?? []).map((plan: any) => plan?.id));
      if (!planIds.has(selection.sellingPlanId)) {
        throw new Error("Saved subscription selling plan no longer exists");
      }
      planValidated = true;
    }
    for (let index = 0; index < batch.length; index += 1) {
      if (group[`product${index}`] !== true && group[`variant${index}`] !== true) {
        throw new Error("Selected variant does not support the saved selling plan");
      }
    }
  }

  if (!planValidated) {
      throw new Error("Selected subscription variant no longer exists");
  }
}

export function buildRuntimeTokenPayload(input: {
  shop: string;
  bundle: any;
  parentVariantId: string;
  offerGroupId: string;
  bundleType: string;
  selection: SelectionInput;
}): RuntimeTokenPayload {
  const normalizedParentVariantId = normalizeProductVariantGid(input.parentVariantId);
  if (!normalizedParentVariantId) {
    throw new Error("Bundle parent variant is required for runtime token payload");
  }

  const offerGroupId = String(input.offerGroupId ?? "").trim();
  if (!offerGroupId) {
    throw new Error("Runtime token offer group is required");
  }

  const selection = validateRuntimeTokenSelection(input.bundle, input.selection);
  const subscriptionConfig = buildPublicBundleSubscriptionConfig(
    input.bundle.bundleSubscriptionConfig,
  );
  const appliesToPurchaseMode = !subscriptionConfig || shouldApplyBundleDiscount(
    subscriptionConfig.bundleDiscountAppliesOn,
    selection.subscription?.sellingPlanId,
  );

  return {
    version: RUNTIME_TOKEN_VERSION,
    shop: input.shop,
    bundleId: input.bundle.id,
    bundleType: input.bundleType,
    offerGroupId,
    parentVariantId: normalizedParentVariantId,
    bundleName: String(input.bundle.name ?? "Bundle"),
    components: selection.components,
    addons: selection.addons,
    priceAdjustment: appliesToPurchaseMode
      ? buildPriceAdjustmentConfig(input.bundle.pricing)
      : { method: "percentage_off", value: 0 },
    ...(selection.subscription ? { subscription: selection.subscription } : {}),
  };
}

export function generateCartTransformRuntimeTokenSecret(
  shopDomain: string,
  apiSecret = process.env.SHOPIFY_API_SECRET,
) {
  if (!apiSecret) {
    throw new Error("SHOPIFY_API_SECRET is required to generate runtime token secret");
  }
  return createHmac("sha256", apiSecret)
    .update(`${RUNTIME_TOKEN_SECRET_CONTEXT}${shopDomain}`)
    .digest("hex");
}

export function signRuntimeCartToken(payload: RuntimeTokenPayload, secret: string) {
  const payloadPart = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signaturePart = createHmac("sha256", secret)
    .update(payloadPart)
    .digest("base64url");
  return `${payloadPart}.${signaturePart}`;
}

export function verifyRuntimeCartToken(token: string, secret: string): RuntimeTokenPayload | null {
  const [payloadPart, signaturePart, extra] = String(token).split(".");
  if (!payloadPart || !signaturePart || extra !== undefined) return null;

  const expectedSignature = createHmac("sha256", secret)
    .update(payloadPart)
    .digest("base64url");
  const expected = Buffer.from(expectedSignature, "utf8");
  const actual = Buffer.from(signaturePart, "utf8");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    return payload?.version === RUNTIME_TOKEN_VERSION ? payload : null;
  } catch {
    return null;
  }
}
