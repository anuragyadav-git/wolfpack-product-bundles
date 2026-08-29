import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { buildPriceAdjustmentConfig } from "./bundles/metafield-sync/utils/price-adjustment";
import { buildPublicBundleSubscriptionConfig } from "../lib/bundle-subscriptions";
import { normalizeProductVariantGid } from "./cart-transform-runtime-token.server";

export type PpbLineRole = "component" | "default" | "free_gift" | "addon";

export type PpbRuntimePolicyV2 = {
  version: 2;
  active: boolean;
  shop: string;
  bundleId: string;
  parentVariantId: string;
  revision: string;
  priceAdjustment: unknown;
  subscription: ReturnType<typeof buildPublicBundleSubscriptionConfig>;
};

export type PpbRuntimeAuthorizationV2 = {
  version: 2;
  revision: string;
  bundleToken: string;
  groups: Array<{
    id: string;
    role: PpbLineRole;
    minQuantity: number;
    maxQuantity: number;
  }>;
  lines: Array<{
    groupId: string;
    variantId: string;
    productId?: string;
    role: PpbLineRole;
    maxQuantity: number;
    maxDiscountPercentage: number;
    token: string;
  }>;
};

type StaticTokenPayload = {
  version: 2;
  kind: "bundle" | "line";
  shop: string;
  bundleId: string;
  revision: string;
  parentVariantId?: string;
  variantId?: string;
  productId?: string;
  role?: PpbLineRole;
  groupId?: string;
  groups?: PpbRuntimeAuthorizationV2["groups"];
  maxQuantity?: number;
  maxDiscountPercentage?: number;
  priceAdjustment?: unknown;
  subscription?: ReturnType<typeof buildPublicBundleSubscriptionConfig>;
};

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((value) => stable(value));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, stable(child)]),
  );
}

function sign(payload: StaticTokenPayload, secret: string) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyPpbStaticToken(token: string, secret: string): StaticTokenPayload | null {
  const [payloadPart, signaturePart, extra] = String(token).split(".");
  if (!payloadPart || !signaturePart || extra !== undefined) return null;
  const expected = Buffer.from(createHmac("sha256", secret).update(payloadPart).digest("base64url"));
  const actual = Buffer.from(signaturePart);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    return payload?.version === 2 && (payload.kind === "bundle" || payload.kind === "line")
      ? payload as StaticTokenPayload
      : null;
  } catch {
    return null;
  }
}

function variantIds(product: any): string[] {
  return (Array.isArray(product?.variants) ? product.variants : [])
    .map((variant: any) => normalizeProductVariantGid(
      variant?.id
        ?? variant?.selectionId
        ?? variant?.gid
        ?? variant?.variantId
        ?? variant?.variantGraphqlId
        ?? variant?.graphqlId,
    ))
    .filter((id: string | null): id is string => Boolean(id));
}

function productId(product: any): string | null {
  const value = product?.productId
    ?? product?.id
    ?? product?.selectionId
    ?? product?.gid
    ?? product?.graphqlId;
  if (typeof value !== "string") return null;
  if (/^gid:\/\/shopify\/Product\/\d+$/.test(value)) return value;
  if (/^\d+$/.test(value)) return `gid://shopify/Product/${value}`;
  return null;
}

function roleForStep(step: any): PpbLineRole {
  if (step?.isDefault === true) return "default";
  if (step?.isFreeGift === true && step?.addonDisplayFree === true) return "free_gift";
  if (step?.isFreeGift === true) return "addon";
  return "component";
}

function maxAddonDiscount(step: any, role: PpbLineRole) {
  if (role === "free_gift") return 100;
  if (role !== "addon") return 0;
  return Math.min(100, Math.max(0, ...(Array.isArray(step?.addonTiers) ? step.addonTiers : []).map(
    (tier: any) => Number(tier?.discount?.value ?? tier?.discountValue ?? 0) || 0,
  )));
}

function collectAuthorization(bundle: any) {
  const lines = new Map<string, Omit<PpbRuntimeAuthorizationV2["lines"][number], "token">>();
  const groups: PpbRuntimeAuthorizationV2["groups"] = [];
  for (const [index, step] of (Array.isArray(bundle?.steps) ? bundle.steps : []).entries()) {
    const role = roleForStep(step);
    const groupId = String(step?.id ?? `step-${index}`);
    const minQuantity = Math.max(0, Number(step?.minQuantity) || 0);
    const maxQuantity = Math.max(1, Number(step?.maxQuantity) || minQuantity || 1);
    groups.push({ id: groupId, role, minQuantity, maxQuantity });
    const products = [
      ...(Array.isArray(step?.StepProduct) ? step.StepProduct : []),
      ...(Array.isArray(step?.products) ? step.products : []),
      ...(Array.isArray(step?.StepCategory) ? step.StepCategory.flatMap((category: any) => category?.products ?? []) : []),
      ...(Array.isArray(step?.categories) ? step.categories.flatMap((category: any) => category?.products ?? []) : []),
    ];
    for (const product of products) {
      const resolvedProductId = productId(product);
      const resolvedVariantIds = variantIds(product);
      const candidates = resolvedVariantIds.length > 0
        ? resolvedVariantIds.map((variantId) => ({ variantId, productId: resolvedProductId ?? undefined }))
        : resolvedProductId ? [{ variantId: "", productId: resolvedProductId }] : [];
      for (const candidate of candidates) {
        const line = {
          groupId,
          variantId: candidate.variantId,
          ...(candidate.productId ? { productId: candidate.productId } : {}),
          role,
          maxQuantity,
          maxDiscountPercentage: maxAddonDiscount(step, role),
        };
        lines.set(`${groupId}:${candidate.variantId || candidate.productId}:${role}`, line);
      }
    }
  }
  const defaultProducts = bundle?.defaultProductsData?.isDefaultProductsEnabled === true
    && Array.isArray(bundle.defaultProductsData.products)
    ? bundle.defaultProductsData.products
    : [];
  const defaultQuantities = defaultProducts.map((product: any) => ({
    product,
    quantity: Math.max(0, Number(product?.requiredQuantity) || 0),
  })).filter(({ quantity }: any) => quantity > 0);
  const defaultTotal = defaultQuantities.reduce((sum: number, item: any) => sum + item.quantity, 0);
  if (defaultTotal > 0) {
    groups.push({
      id: "default-products",
      role: "default",
      minQuantity: defaultTotal,
      maxQuantity: defaultTotal,
    });
    for (const { product, quantity } of defaultQuantities) {
      const resolvedProductId = productId(product);
      const resolvedVariantIds = variantIds(product);
      const candidates = resolvedVariantIds.length > 0
        ? resolvedVariantIds.map((variantId) => ({ variantId, productId: resolvedProductId ?? undefined }))
        : resolvedProductId ? [{ variantId: "", productId: resolvedProductId }] : [];
      for (const candidate of candidates) {
        const line = {
          groupId: "default-products",
          variantId: candidate.variantId,
          ...(candidate.productId ? { productId: candidate.productId } : {}),
          role: "default" as const,
          maxQuantity: quantity,
          maxDiscountPercentage: 0,
        };
        lines.set(`default-products:${candidate.variantId || candidate.productId}:default`, line);
      }
    }
  }
  return {
    groups,
    lines: [...lines.values()].sort((left, right) => (
      `${left.groupId}:${left.variantId || left.productId}:${left.role}`
        .localeCompare(`${right.groupId}:${right.variantId || right.productId}:${right.role}`)
    )),
  };
}

export function buildPpbStaticAuthorization(input: {
  bundle: any;
  shop: string;
  parentVariantId: string;
  secret: string;
}): { policy: PpbRuntimePolicyV2; authorization: PpbRuntimeAuthorizationV2 } {
  const parentVariantId = normalizeProductVariantGid(input.parentVariantId);
  if (!parentVariantId) throw new Error("PPB parent variant is required for static authorization");
  const bundleId = String(input.bundle?.id ?? input.bundle?.bundleId ?? "").trim();
  if (!bundleId) throw new Error("PPB bundle ID is required for static authorization");
  const { groups, lines: linePolicies } = collectAuthorization(input.bundle);
  if (linePolicies.length === 0) throw new Error("PPB static authorization requires cached variant IDs");

  const policyMaterial = {
    active: String(input.bundle?.status ?? "active").toLowerCase() === "active"
      || String(input.bundle?.status ?? "").toLowerCase() === "unlisted",
    shop: input.shop,
    bundleId,
    parentVariantId,
    priceAdjustment: buildPriceAdjustmentConfig(input.bundle?.pricing),
    subscription: buildPublicBundleSubscriptionConfig(input.bundle?.bundleSubscriptionConfig),
    lines: linePolicies,
    groups,
  };
  const revision = createHash("sha256")
    .update(JSON.stringify(stable(policyMaterial)))
    .digest("hex")
    .slice(0, 24);
  const policy: PpbRuntimePolicyV2 = {
    version: 2,
    active: policyMaterial.active,
    shop: input.shop,
    bundleId,
    parentVariantId,
    revision,
    priceAdjustment: policyMaterial.priceAdjustment,
    subscription: policyMaterial.subscription,
  };
  const base = { version: 2 as const, shop: input.shop, bundleId, revision };
  const bundleToken = sign({
    ...base,
    kind: "bundle",
    parentVariantId,
    priceAdjustment: policy.priceAdjustment,
    subscription: policy.subscription,
    groups,
  }, input.secret);
  return {
    policy,
    authorization: {
      version: 2,
      revision,
      bundleToken,
      groups,
      lines: linePolicies.map((line) => ({
        ...line,
        token: sign({ ...base, kind: "line", ...line }, input.secret),
      })),
    },
  };
}

function parsePolicyMap(value: unknown): Record<string, string> {
  if (typeof value !== "string" || !value) return {};
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).flatMap(([key, revision]) => (
      typeof revision === "string" ? [[key, revision]] : []
    )));
  } catch {
    return {};
  }
}

export async function buildPpbPolicyRevisionMetafield(input: {
  admin: { graphql: (query: string, options?: any) => Promise<{ json: () => Promise<any> }> };
  bundleId: string;
  revision: string;
  active: boolean;
}) {
  const response = await input.admin.graphql(`
    query PpbPolicyRevisions {
      shop {
        id
        policy: metafield(namespace: "$app", key: "ppb_policy_revisions") { value }
      }
    }
  `);
  const data = await response.json();
  if (data.errors?.length) throw new Error(`Unable to read PPB policy revisions: ${data.errors[0].message}`);
  const shop = data.data?.shop;
  if (!shop?.id) throw new Error("Unable to resolve Shopify Shop ID for PPB policy revision");
  const policies = parsePolicyMap(shop.policy?.value);
  if (input.active) policies[input.bundleId] = input.revision;
  else delete policies[input.bundleId];
  const value = JSON.stringify(policies);
  if (Buffer.byteLength(value, "utf8") > 10_000) {
    throw new Error("PPB policy revision map exceeds the Shopify Function 10KB input limit");
  }
  return {
    ownerId: shop.id,
    namespace: "$app",
    key: "ppb_policy_revisions",
    type: "json",
    value,
  };
}
