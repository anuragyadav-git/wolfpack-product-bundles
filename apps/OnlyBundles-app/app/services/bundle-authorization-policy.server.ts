import { isDeepStrictEqual } from 'node:util';
import { createHash } from 'node:crypto';
import { buildPriceAdjustmentConfig } from './bundles/metafield-sync/utils/price-adjustment';
import { buildPublicBundleSubscriptionConfig } from '../lib/bundle-subscriptions';
import { buildOfferCountryTargetingRule, encodeOfferCountryTargetingRule } from '../lib/offer-country-eligibility';
import { normalizeProductVariantGid } from '../lib/shopify-product-gid';
import { resolveOfferSchedule, type OfferPolicyTiming } from '../lib/offer-policy-decision';

export type PublishedBundlePolicy = { revision: string; pricingMode: 'standard' | 'scheduled' };

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
    .map(([key, child]) => [key, stable(child)]));
}

export function scheduleRevisionMaterial(policy?: OfferPolicyTiming | null) {
  const mode = policy?.scheduleMode ?? 'always';
  const instant = (value: Date | string | null | undefined) => value == null ? null : new Date(value).toISOString();
  if (mode === 'one_time') return { mode, startsAt: instant(policy?.startsAt), endsAt: instant(policy?.endsAt) };
  if (mode === 'recurring') return {
    mode, frequency: policy?.recurrenceFrequency, timezone: policy?.recurrenceTimezone,
    anchorDate: instant(policy?.recurrenceAnchorDate)?.slice(0, 10),
    startMinute: policy?.recurrenceWindowStartMinute, endMinute: policy?.recurrenceWindowEndMinute,
    termination: policy?.recurrenceTermination ?? 'never', endsOn: instant(policy?.recurrenceEndsOn)?.slice(0, 10),
    runCount: policy?.recurrenceRunCount ?? null,
  };
  return { mode };
}

function products(values: any) {
  return (Array.isArray(values) ? values : []).map((product: any) => ({
    id: product.productId ?? product.id ?? product.selectionId,
    variantId: product.variantId ?? product.selectedVariantId ?? null,
    requiredQuantity: product.requiredQuantity ?? null,
    variants: (Array.isArray(product.variants) ? product.variants : []).map((variant: any) =>
      normalizeProductVariantGid(variant.id ?? variant.variantId ?? variant.selectionId)).sort(),
  }));
}

function addonTiers(values: any) {
  return (Array.isArray(values) ? values : []).map((tier: any) => ({
    discount: tier.discount ?? null, discountType: tier.discountType ?? null, discountValue: tier.discountValue ?? null,
    eligibilityCondition: tier.eligibilityCondition ?? null,
    products: products(tier.selectedAddonProducts),
  }));
}

/** Input is the canonical save/sync configuration, before Shopify display enrichment. */
export function buildBundleAuthorizationPolicy(input: { bundle: any; shop: string; parentVariantId: string }) {
  const { bundle, shop } = input;
  const parentVariantId = normalizeProductVariantGid(input.parentVariantId);
  const bundleId = String(bundle.id ?? '').trim();
  if (!shop || !bundleId || !parentVariantId) throw new Error('Bundle authorization requires shop, bundle and parent identity');
  const timing = bundle.offerPolicy ?? {};
  if (resolveOfferSchedule(timing).state === 'invalid') throw new Error('Invalid bundle authorization schedule');
  const active = bundle.status === 'active' || bundle.status === 'unlisted';
  const countryRule = encodeOfferCountryTargetingRule(buildOfferCountryTargetingRule(timing));
  const pricingMode: PublishedBundlePolicy['pricingMode'] = (timing.scheduleMode ?? 'always') === 'always' ? 'standard' : 'scheduled';
  const subscription = buildPublicBundleSubscriptionConfig(bundle.bundleSubscriptionConfig);
  const material = {
    active, shop, bundleId, parentVariantId, countryRule,
    priceAdjustment: buildPriceAdjustmentConfig(bundle.pricing),
    subscription: subscription ? {
      selectedGroupId: subscription.selectedGroup?.id, selectedPlanIds: subscription.selectedPlanIds,
      oneTimePurchaseEnabled: subscription.oneTimePurchase.enabled,
      recurringBundleDiscount: subscription.recurringBundleDiscount,
      bundleDiscountAppliesOn: subscription.bundleDiscountAppliesOn,
    } : null,
    schedule: scheduleRevisionMaterial(timing),
    steps: (Array.isArray(bundle.steps) ? bundle.steps : []).map((step: any) => ({
      id: step.id, enabled: step.enabled !== false, minQuantity: step.minQuantity ?? 0, maxQuantity: step.maxQuantity ?? null,
      isDefault: step.isDefault === true, isFreeGift: step.isFreeGift === true, isAddon: step.isAddon === true,
      conditionType: step.conditionType ?? null, conditionOperator: step.conditionOperator ?? null,
      conditionValue: step.conditionValue ?? null, conditionOperator2: step.conditionOperator2 ?? null, conditionValue2: step.conditionValue2 ?? null,
      products: products(step.StepProduct), addonTiers: addonTiers(step.addonTiers),
      collections: (step.collections ?? []).map((value: any) => value.id ?? value.handle).sort(),
      categories: (step.categories ?? []).map((category: any) => ({
        id: category.id, products: products(category.products),
        collections: (category.collections ?? []).map((value: any) => value.id ?? value.handle).sort(),
      })),
    })),
    defaults: bundle.defaultProductsData?.isDefaultProductsEnabled === true ? products(bundle.defaultProductsData.products) : [],
    addons: bundle.personalizationData?.addonProducts?.isEnabled === true ? addonTiers(bundle.personalizationData.addonProducts.tiers) : [],
  };
  const revision = createHash('sha256').update(JSON.stringify(stable(material))).digest('hex').slice(0, 24);
  return { active, shop, bundleId, parentVariantId, revision, pricingMode, countryRule };
}

export type BundleAuthorizationPolicy = ReturnType<typeof buildBundleAuthorizationPolicy>;
type Admin = { graphql: (query: string, options?: any) => Promise<{ json: () => Promise<any> }> };

export async function readBundlePolicyMap(admin: Admin) {
  const response = await admin.graphql(`
    query BundlePolicyRevisions {
      shop { id policy: metafield(namespace: "$app", key: "ppb_policy_revisions") { value compareDigest } }
    }
  `);
  const payload = await response.json();
  if (payload.errors?.length || !payload.data?.shop?.id) throw new Error('Unable to read published bundle policies');
  const shop = payload.data.shop;
  if (!Object.hasOwn(shop, 'policy')) throw new Error('Incomplete published bundle policy response');
  const policies: unknown = shop.policy ? JSON.parse(shop.policy.value) : {};
  if (!policies || typeof policies !== 'object' || Array.isArray(policies)) throw new Error('Invalid published bundle policy map');
  if (shop.policy && typeof shop.policy.compareDigest !== 'string') throw new Error('Missing Shopify policy compareDigest');
  return { ownerId: String(shop.id), compareDigest: shop.policy?.compareDigest ?? null, policies: policies as Record<string, unknown> };
}

export async function readPublishedBundlePolicy(admin: Admin, bundleId: string): Promise<PublishedBundlePolicy | null> {
  const { policies } = await readBundlePolicyMap(admin);
  const value = policies[bundleId];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Partial<PublishedBundlePolicy>;
  return typeof record.revision === 'string' && record.revision.length > 0
    && (record.pricingMode === 'standard' || record.pricingMode === 'scheduled')
    ? { revision: record.revision, pricingMode: record.pricingMode } : null;
}

export async function buildBundlePolicyMetafield(input: {
  admin: Admin; bundleId: string; revision: string; pricingMode: PublishedBundlePolicy['pricingMode']; active: boolean;
}) {
  const { ownerId, compareDigest, policies } = await readBundlePolicyMap(input.admin);
  if (input.active) policies[input.bundleId] = { revision: input.revision, pricingMode: input.pricingMode };
  else delete policies[input.bundleId];
  const value = JSON.stringify(policies);
  if (Buffer.byteLength(value, 'utf8') > 10_000) throw new Error('Bundle policy map exceeds the Shopify Function 10KB input limit');
  return { ownerId, namespace: '$app', key: 'ppb_policy_revisions', type: 'json', value, compareDigest };
}

export async function removePublishedBundlePolicy(admin: Admin, bundleId: string): Promise<void> {
  const field = await buildBundlePolicyMetafield({ admin, bundleId, revision: '', pricingMode: 'standard', active: false });
  const response = await admin.graphql(`mutation RevokeBundlePolicy($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) { metafields { key value } userErrors { field message } }
  }`, { variables: { metafields: [field] } });
  const payload = await response.json();
  const result = payload.data?.metafieldsSet;
  const saved = result?.metafields?.find((value: any) => value.key === field.key);
  if (payload.errors?.length || !Array.isArray(result?.userErrors) || result.userErrors.length || !saved
    || !isDeepStrictEqual(JSON.parse(saved.value), JSON.parse(field.value))) throw new Error('Unable to revoke published bundle policy');
}
