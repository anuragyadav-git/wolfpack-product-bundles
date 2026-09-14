import { isDeepStrictEqual } from 'node:util';
import { resolveOfferSchedule, type OfferPolicyTiming } from '../lib/offer-policy-decision';
import type { BundleAuthorizationPolicy } from './bundle-authorization-policy.server';

type Admin = { graphql: (query: string, options?: any) => Promise<{ json: () => Promise<any> }> };
type Role = 'scheduled_initial' | 'scheduled_recurring';
type Owner = {
  id: string;
  discount: { __typename: string; appDiscountType?: { functionId: string }; startsAt?: string; endsAt?: string | null; recurringCycleLimit?: number; discountClasses?: string[]; combinesWith?: Record<string, boolean> };
  config?: { id?: string; value: string } | null;
  role?: { id?: string; value: string } | null;
  secret?: { id?: string; value: string } | null;
};
const HANDLE = 'scheduled-bundle-discount';
const OWNER_FIELDS = `
  id
  config: metafield(namespace: "$app", key: "scheduled_offer") { id value }
  role: metafield(namespace: "$app", key: "discount_role") { id value }
  secret: metafield(namespace: "$app", key: "runtime_token_secret") { id value }
  discount {
    __typename
    ... on DiscountAutomaticApp {
      startsAt endsAt recurringCycleLimit discountClasses
      combinesWith { productDiscounts orderDiscounts shippingDiscounts }
      appDiscountType { functionId }
    }
  }
`;

async function execute(admin: Admin, query: string, variables?: Record<string, unknown>) {
  const response = await admin.graphql(query, { apiVersion: '2026-07', variables });
  const payload = await response.json();
  // Do not include returned values: owner metadata contains the runtime signing secret.
  if (payload.errors?.length || !payload.data) throw new Error('Shopify scheduled discount request failed');
  return payload.data;
}

async function inventory(admin: Admin) {
  const owners: Owner[] = [];
  let cursor: string | null = null;
  let functionId: string | undefined;
  let timezone: string | undefined;
  do {
    const data = await execute(admin, `query ScheduledDiscountOwners($after: String) {
      shop { ianaTimezone }
      shopifyFunctions(first: 250) { nodes { id handle } pageInfo { hasNextPage } }
      discountNodes(first: 100, after: $after) { nodes { ${OWNER_FIELDS} } pageInfo { hasNextPage endCursor } }
    }`, { after: cursor });
    const page = data.discountNodes;
    if (!Array.isArray(page?.nodes) || typeof page.pageInfo?.hasNextPage !== 'boolean'
      || !Array.isArray(data.shopifyFunctions?.nodes) || data.shopifyFunctions.pageInfo?.hasNextPage !== false
      || typeof data.shop?.ianaTimezone !== 'string') throw new Error('Incomplete Shopify scheduled discount inventory');
    functionId = data.shopifyFunctions.nodes.find((value: any) => value.handle === HANDLE)?.id;
    timezone = data.shop.ianaTimezone;
    owners.push(...page.nodes);
    const next = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
    if (page.pageInfo.hasNextPage && (!next || next === cursor)) throw new Error('Incomplete Shopify scheduled discount pagination');
    cursor = next;
  } while (cursor);
  return { owners, functionId, timezone };
}

function ownerBundle(owner: Owner): { shop: string; bundleId: string } | null {
  try {
    const config = JSON.parse(owner.config?.value ?? 'null');
    return config?.version === 1 && typeof config.shop === 'string' && typeof config.bundleId === 'string' ? config : null;
  } catch { return null; }
}

function scheduledConfig(policy: BundleAuthorizationPolicy, timing: OfferPolicyTiming, timezone: string | undefined) {
  if (resolveOfferSchedule(timing).state === 'invalid') throw new Error('Invalid scheduled bundle policy');
  const day = (date: Date | string | null | undefined) => date == null ? null : new Date(date).toISOString().slice(0, 10);
  const time = (minute: number | null | undefined) => `${String(Math.floor(minute! / 60)).padStart(2, '0')}:${String(minute! % 60).padStart(2, '0')}:00`;
  if (timing.scheduleMode === 'recurring' && timing.recurrenceTimezone !== timezone) {
    throw new Error('Bundle recurrence timezone must match the Shopify shop timezone');
  }
  if (timing.scheduleMode !== 'one_time' && timing.scheduleMode !== 'recurring') throw new Error('Scheduled discount requires a scheduled policy');
  return {
    version: 1, shop: policy.shop, bundleId: policy.bundleId, parentVariantId: policy.parentVariantId,
    revision: policy.revision, countryRule: policy.countryRule, scheduleMode: timing.scheduleMode,
    windowStart: timing.scheduleMode === 'recurring' ? time(timing.recurrenceWindowStartMinute) : '00:00:00',
    windowEnd: timing.scheduleMode === 'recurring' ? time(timing.recurrenceWindowEndMinute) : '23:59:59',
    ...(timing.scheduleMode === 'recurring' ? {
      recurrenceFrequency: timing.recurrenceFrequency, recurrenceAnchorDate: day(timing.recurrenceAnchorDate),
      recurrenceTermination: timing.recurrenceTermination ?? 'never', recurrenceEndsOn: day(timing.recurrenceEndsOn),
      recurrenceRunCount: timing.recurrenceRunCount ?? null,
    } : {}),
  };
}

async function remove(admin: Admin, id: string) {
  const data = await execute(admin, `mutation DeleteScheduledDiscount($id: ID!) {
    discountAutomaticDelete(id: $id) { deletedAutomaticDiscountId userErrors { field message code } }
  }`, { id });
  const result = data.discountAutomaticDelete;
  if (result?.userErrors?.length || result?.deletedAutomaticDiscountId !== id) throw new Error('Unable to remove scheduled bundle discount');
}

/** Prepare and verify native owners before publishing the matching Function policy revision. */
export async function syncScheduledBundleDiscounts(input: {
  admin: Admin; policy: BundleAuthorizationPolicy; timing: OfferPolicyTiming; title: string;
  secret: string; recurringSubscription: boolean;
}) {
  const { admin, policy } = input;
  const { owners, functionId, timezone } = await inventory(admin);
  const existing = owners.filter(owner => {
    const config = ownerBundle(owner);
    return owner.discount?.__typename === 'DiscountAutomaticApp'
      && owner.discount.appDiscountType?.functionId === functionId
      && config?.shop === policy.shop && config?.bundleId === policy.bundleId;
  });
  const ids: { scheduledInitialDiscountId: string | null; scheduledRecurringDiscountId: string | null } = {
    scheduledInitialDiscountId: null, scheduledRecurringDiscountId: null,
  };
  if (!policy.active || policy.pricingMode === 'standard') {
    for (const owner of existing) await remove(admin, owner.id);
    return ids;
  }
  if (!functionId) throw new Error('The scheduled bundle Discount Function must be deployed before syncing scheduled offers');
  if (!input.secret || !input.title.trim()) throw new Error('Scheduled discount requires a signing secret and configured bundle title');
  const config = scheduledConfig(policy, input.timing, timezone);
  const configValue = JSON.stringify(config);
  if (Buffer.byteLength(configValue, 'utf8') > 10_000) throw new Error('Scheduled offer exceeds Shopify Function metafield input limit');
  const roles: Role[] = input.recurringSubscription ? ['scheduled_initial', 'scheduled_recurring'] : ['scheduled_initial'];
  const kept = new Set<string>();
  for (const role of roles) {
    const previous = existing.find(owner => owner.role?.value === role);
    const metafields = [
      { key: 'scheduled_offer', type: 'json', value: configValue },
      { key: 'discount_role', type: 'single_line_text_field', value: role },
      { key: 'runtime_token_secret', type: 'single_line_text_field', value: input.secret },
    ].map(value => ({ ...value, namespace: '$app' }));
    const discount = {
      title: input.title, functionHandle: HANDLE, discountClasses: ['PRODUCT'],
      // A recurrence has no absolute end: the Function owns each local occurrence.
      startsAt: input.timing.scheduleMode === 'one_time' && input.timing.startsAt
        ? new Date(input.timing.startsAt).toISOString() : '1970-01-01T00:00:00.000Z',
      endsAt: input.timing.scheduleMode === 'one_time' && input.timing.endsAt ? new Date(input.timing.endsAt).toISOString() : null,
      recurringCycleLimit: role === 'scheduled_recurring' ? 0 : 1,
      combinesWith: { productDiscounts: true, orderDiscounts: true, shippingDiscounts: false }, metafields,
    };
    const data = previous
      ? await execute(admin, `mutation UpdateScheduledDiscount($id: ID!, $discount: DiscountAutomaticAppInput!) {
          discountAutomaticAppUpdate(id: $id, automaticAppDiscount: $discount) { automaticAppDiscount { discountId } userErrors { field message code } }
        }`, { id: previous.id, discount })
      : await execute(admin, `mutation CreateScheduledDiscount($discount: DiscountAutomaticAppInput!) {
          discountAutomaticAppCreate(automaticAppDiscount: $discount) { automaticAppDiscount { discountId } userErrors { field message code } }
        }`, { discount });
    const result = previous ? data.discountAutomaticAppUpdate : data.discountAutomaticAppCreate;
    if (result?.userErrors?.length) throw new Error(`Unable to sync scheduled bundle discount: ${result.userErrors.map((e: any) => e.message).join('; ')}`);
    const id = result?.automaticAppDiscount?.discountId;
    if (typeof id !== 'string' || (previous && previous.id !== id)) throw new Error('Incomplete Shopify scheduled discount mutation');
    const verified = await execute(admin, `query VerifyScheduledDiscount($id: ID!) { discountNode(id: $id) { ${OWNER_FIELDS} } }`, { id });
    const owner: Owner | undefined = verified.discountNode;
    const sameDate = (actual: string | null | undefined, expected: string | null) => expected === null ? actual === null : actual != null && new Date(actual).getTime() === new Date(expected).getTime();
    if (owner?.id !== id || owner.discount?.appDiscountType?.functionId !== functionId
      || !sameConfig(owner.config?.value, config) || owner.role?.value !== role || owner.secret?.value !== input.secret
      || !sameDate(owner.discount.startsAt, discount.startsAt) || !sameDate(owner.discount.endsAt, discount.endsAt)
      || owner.discount.recurringCycleLimit !== discount.recurringCycleLimit
      || owner.discount.discountClasses?.length !== 1 || owner.discount.discountClasses[0] !== 'PRODUCT'
      || Object.entries(discount.combinesWith).some(([key, value]) => owner.discount.combinesWith?.[key] !== value)) {
      throw new Error('Scheduled bundle discount readback did not match the published configuration');
    }
    kept.add(id);
    ids[role === 'scheduled_initial' ? 'scheduledInitialDiscountId' : 'scheduledRecurringDiscountId'] = id;
  }
  for (const owner of existing) if (!kept.has(owner.id)) await remove(admin, owner.id);
  return ids;
}

function sameConfig(value: string | undefined, config: unknown): boolean {
  try { return isDeepStrictEqual(JSON.parse(value ?? 'null'), config); } catch { return false; }
}

export async function removeScheduledBundleDiscounts(admin: Admin, shop: string, bundleId: string): Promise<void> {
  const { owners, functionId } = await inventory(admin);
  for (const owner of owners) {
    const config = ownerBundle(owner);
    if (owner.discount?.__typename === 'DiscountAutomaticApp' && functionId
      && owner.discount.appDiscountType?.functionId === functionId
      && config?.shop === shop && config.bundleId === bundleId) await remove(admin, owner.id);
  }
}
