import { syncScheduledBundleDiscounts } from '../../../app/services/scheduled-bundle-discount.server';

const policy = { active: true, shop: 'test.myshopify.com', bundleId: 'bundle-1', parentVariantId: 'gid://shopify/ProductVariant/1', revision: 'revision-1', pricingMode: 'scheduled' as const, countryRule: 'include:CA' };
const timing = { scheduleMode: 'one_time' as const, startsAt: '2026-09-14T09:00:00Z', endsAt: '2026-09-14T11:00:00Z' };
function fixture(existing: any[] = []) {
  const stored = new Map<string, any>(existing.map(node => [node.id, node]));
  const admin = { graphql: jest.fn(async (query: string, options: any): Promise<{ json: () => Promise<any> }> => {
    const v = options?.variables;
    let data: any;
    if (query.includes('ScheduledDiscountOwners')) data = { shop: { ianaTimezone: 'America/Toronto' }, shopifyFunctions: { nodes: [{ id: 'function-1', handle: 'scheduled-bundle-discount' }], pageInfo: { hasNextPage: false } }, discountNodes: { nodes: [...stored.values()], pageInfo: { hasNextPage: false, endCursor: null } } };
    else if (query.includes('CreateScheduledDiscount')) {
      const id = `gid://shopify/DiscountAutomaticNode/${stored.size + 1}`;
      stored.set(id, node(id, v.discount)); data = { discountAutomaticAppCreate: { automaticAppDiscount: { discountId: id }, userErrors: [] } };
    } else if (query.includes('UpdateScheduledDiscount')) {
      stored.set(v.id, node(v.id, v.discount)); data = { discountAutomaticAppUpdate: { automaticAppDiscount: { discountId: v.id }, userErrors: [] } };
    } else if (query.includes('DeleteScheduledDiscount')) {
      stored.delete(v.id); data = { discountAutomaticDelete: { deletedAutomaticDiscountId: v.id, userErrors: [] } };
    } else if (query.includes('VerifyScheduledDiscount')) data = { discountNode: stored.get(v.id) };
    else throw new Error('Unexpected query');
    return { json: async () => ({ data }) };
  }) };
  return { admin, stored };
}
function node(id: string, discount: any) {
  return { id, discount: { __typename: 'DiscountAutomaticApp', ...discount, appDiscountType: { functionId: 'function-1' } },
    config: discount.metafields.find((m: any) => m.key === 'scheduled_offer'),
    role: discount.metafields.find((m: any) => m.key === 'discount_role'),
    secret: discount.metafields.find((m: any) => m.key === 'runtime_token_secret') };
}
const input = { policy, timing, title: 'Configured bundle title', secret: 'test-secret', recurringSubscription: false };
it('creates and verifies a Shopify scheduled initial owner with native dates and combinations', async () => {
  const { admin, stored } = fixture();
  const ids = await syncScheduledBundleDiscounts({ ...input, admin });
  expect(ids).toEqual({ scheduledInitialDiscountId: 'gid://shopify/DiscountAutomaticNode/1', scheduledRecurringDiscountId: null });
  const owner = [...stored.values()][0];
  expect(owner.discount).toMatchObject({ startsAt: '2026-09-14T09:00:00.000Z', endsAt: '2026-09-14T11:00:00.000Z', recurringCycleLimit: 1, discountClasses: ['PRODUCT'], combinesWith: { productDiscounts: true, orderDiscounts: true, shippingDiscounts: false } });
  expect(JSON.parse(owner.config.value)).toMatchObject({ bundleId: 'bundle-1', revision: 'revision-1', windowStart: '00:00:00', windowEnd: '23:59:59' });
  expect(owner.role.value).toBe('scheduled_initial');
});
it('reconciles an orphaned owner and uses separate native subscription billing-cycle ownership', async () => {
  const f = fixture();
  const first = await syncScheduledBundleDiscounts({ ...input, admin: f.admin });
  const second = await syncScheduledBundleDiscounts({ ...input, admin: f.admin, recurringSubscription: true });
  expect(second.scheduledInitialDiscountId).toBe(first.scheduledInitialDiscountId);
  expect(f.stored.size).toBe(2);
  expect(f.stored.get(second.scheduledRecurringDiscountId!)?.discount.recurringCycleLimit).toBe(0);
  const third = await syncScheduledBundleDiscounts({ ...input, admin: f.admin });
  expect(third.scheduledRecurringDiscountId).toBeNull();
  expect(f.stored.size).toBe(1);
});
it('removes only this bundle owners when unpublished or switched to always-on', async () => {
  const f = fixture();
  await syncScheduledBundleDiscounts({ ...input, admin: f.admin });
  await syncScheduledBundleDiscounts({ ...input, policy: { ...policy, bundleId: 'other' }, admin: f.admin });
  await expect(syncScheduledBundleDiscounts({ ...input, policy: { ...policy, pricingMode: 'standard' }, admin: f.admin })).resolves.toEqual({ scheduledInitialDiscountId: null, scheduledRecurringDiscountId: null });
  expect([...f.stored.values()].map(n => JSON.parse(n.config.value).bundleId)).toEqual(['other']);
});
it('uses Shopify shop time and rejects mismatched recurrence timezone before mutation', async () => {
  const f = fixture();
  const recurring = { scheduleMode: 'recurring' as const, recurrenceFrequency: 'weekly' as const, recurrenceTimezone: 'America/Toronto', recurrenceAnchorDate: '2026-09-14', recurrenceWindowStartMinute: 540, recurrenceWindowEndMinute: 660, recurrenceTermination: 'never' as const };
  await syncScheduledBundleDiscounts({ ...input, admin: f.admin, timing: recurring });
  expect(JSON.parse([...f.stored.values()][0].config.value)).toMatchObject({ windowStart: '09:00:00', windowEnd: '11:00:00', recurrenceAnchorDate: '2026-09-14' });
  f.admin.graphql.mockClear();
  await expect(syncScheduledBundleDiscounts({ ...input, admin: f.admin, timing: { ...recurring, recurrenceTimezone: 'Europe/London' } })).rejects.toThrow('timezone');
  expect(f.admin.graphql.mock.calls).toHaveLength(1);
});
it.each(['capacity', 'top-level', 'incomplete', 'readback'])('does not report success for %s failures', async (failure) => {
  const f = fixture();
  const real = f.admin.graphql.getMockImplementation()!;
  f.admin.graphql.mockImplementation(async (q, o) => {
    if (q.includes('CreateScheduledDiscount')) {
      if (failure === 'capacity') return { json: async () => ({ data: { discountAutomaticAppCreate: { userErrors: [{ message: 'Maximum active automatic discounts reached' }] } } }) };
      if (failure === 'top-level') return { json: async () => ({ errors: [{ message: 'Access denied' }] }) };
      if (failure === 'incomplete') return { json: async () => ({ data: {} }) };
    }
    if (failure === 'readback' && q.includes('VerifyScheduledDiscount')) return { json: async () => ({ data: { discountNode: null } }) };
    return real(q, o);
  });
  await expect(syncScheduledBundleDiscounts({ ...input, admin: f.admin })).rejects.toThrow();
});

it('deletes only app-owned native discounts for the deleted bundle', async () => {
  const { removeScheduledBundleDiscounts } = await import('../../../app/services/scheduled-bundle-discount.server');
  const f = fixture();
  await syncScheduledBundleDiscounts({ ...input, admin: f.admin });
  await syncScheduledBundleDiscounts({ ...input, policy: { ...policy, bundleId: 'other' }, admin: f.admin });
  await removeScheduledBundleDiscounts(f.admin, policy.shop, policy.bundleId);
  expect([...f.stored.values()].map(n => JSON.parse(n.config.value).bundleId)).toEqual(['other']);
});
it('accepts semantically identical native JSON readback', async () => {
  const f = fixture();
  const real = f.admin.graphql.getMockImplementation()!;
  f.admin.graphql.mockImplementation(async (q, o) => {
    const response = await real(q, o);
    const payload = await response.json();
    if (q.includes('VerifyScheduledDiscount')) payload.data.discountNode.config.value = JSON.stringify(JSON.parse(payload.data.discountNode.config.value), null, 2);
    return { json: async () => payload };
  });
  await expect(syncScheduledBundleDiscounts({ ...input, admin: f.admin })).resolves.toBeDefined();
});

it('updates existing metafields by namespace and key without conflicting returned IDs', async () => {
  const f = fixture();
  await syncScheduledBundleDiscounts({ ...input, admin: f.admin });
  for (const owner of f.stored.values()) {
    for (const key of ['config', 'role', 'secret']) owner[key].id = `gid://shopify/Metafield/${key}`;
  }
  const real = f.admin.graphql.getMockImplementation()!;
  f.admin.graphql.mockImplementation(async (query, options) => {
    if (query.includes('UpdateScheduledDiscount') && options.variables.discount.metafields.some((field: any) => field.id && field.namespace)) {
      return { json: async () => ({ data: { discountAutomaticAppUpdate: { userErrors: [{ message: 'Namespace and key do not match the metafield ID' }] } } }) };
    }
    return real(query, options);
  });
  await expect(syncScheduledBundleDiscounts({ ...input, admin: f.admin })).resolves.toBeDefined();
  const update = f.admin.graphql.mock.calls.find(([query]) => query.includes('UpdateScheduledDiscount'))!;
  expect(update[1].variables.discount.metafields).toEqual(expect.arrayContaining([
    { namespace: '$app', key: 'discount_role', type: 'single_line_text_field', value: 'scheduled_initial' },
  ]));
});
