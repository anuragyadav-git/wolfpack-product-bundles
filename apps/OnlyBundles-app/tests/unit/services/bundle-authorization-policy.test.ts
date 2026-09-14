import { buildBundleAuthorizationPolicy, buildBundlePolicyMetafield, readPublishedBundlePolicy } from '../../../app/services/bundle-authorization-policy.server';
const input = {
  shop: 'test.myshopify.com', parentVariantId: 'gid://shopify/ProductVariant/9',
  bundle: {
    id: 'bundle-1', status: 'active', steps: [{ id: 'step-1', minQuantity: 1, maxQuantity: 2,
      StepProduct: [{ productId: 'gid://shopify/Product/1', variants: [{ id: 'gid://shopify/ProductVariant/1' }] }] }],
    pricing: { enabled: true, method: 'percentage_off', rules: [{ id: 'rule-1', conditionType: 'quantity', conditionValue: 1, discountValue: 20 }] },
    offerPolicy: { scheduleMode: 'one_time', startsAt: '2026-09-14T09:00:00Z', endsAt: '2026-09-14T11:00:00Z', countryTargetingEnabled: true, countryTargetingMode: 'include', countryCodes: ['CA'] },
  },
};
it('keeps policy identity stable across presentation edits and equivalent dates', () => {
  const original = buildBundleAuthorizationPolicy(input);
  const changed = structuredClone(input);
  Object.assign(changed.bundle.offerPolicy, { priority: 1, stopLowerPriority: true });
  Object.assign(changed.bundle, { countdownTitle: 'Presentation', name: 'New title' });
  changed.bundle.offerPolicy.startsAt = new Date(input.bundle.offerPolicy.startsAt) as never;
  expect(buildBundleAuthorizationPolicy(changed)).toEqual(original);
  expect(original).toMatchObject({ bundleId: 'bundle-1', active: true, pricingMode: 'scheduled', countryRule: 'include:CA' });
});
it.each(['country', 'schedule', 'quantity', 'variant', 'pricing', 'status'])('revises authorization when %s changes', (field) => {
  const changed = structuredClone(input);
  if (field === 'country') changed.bundle.offerPolicy.countryCodes = ['US'];
  if (field === 'schedule') changed.bundle.offerPolicy.endsAt = '2026-09-14T12:00:00Z';
  if (field === 'quantity') changed.bundle.steps[0].maxQuantity = 3;
  if (field === 'variant') changed.bundle.steps[0].StepProduct[0].variants[0].id = 'gid://shopify/ProductVariant/2';
  if (field === 'pricing') changed.bundle.pricing.rules[0].discountValue = 30;
  if (field === 'status') changed.bundle.status = 'draft';
  expect(buildBundleAuthorizationPolicy(changed).revision).not.toBe(buildBundleAuthorizationPolicy(input).revision);
});
it('uses standard pricing for always-on offers and rejects invalid identity or dates', () => {
  const always = structuredClone(input);
  always.bundle.offerPolicy.scheduleMode = 'always';
  expect(buildBundleAuthorizationPolicy(always).pricingMode).toBe('standard');
  expect(() => buildBundleAuthorizationPolicy({ ...input, shop: '' })).toThrow();
  expect(() => buildBundleAuthorizationPolicy({ ...input, parentVariantId: '' })).toThrow();
  const invalid = structuredClone(input);
  invalid.bundle.offerPolicy.endsAt = 'invalid';
  expect(() => buildBundleAuthorizationPolicy(invalid)).toThrow();
});

it('publishes one policy with Shopify compareDigest while preserving other opaque entries', async () => {
  const admin = { graphql: jest.fn().mockResolvedValue({ json: async () => ({ data: { shop: {
    id: 'gid://shopify/Shop/1', policy: { value: JSON.stringify({ other: { revision: 'keep', pricingMode: 'standard' } }), compareDigest: 'digest' },
  } } }) }) };
  const field = await buildBundlePolicyMetafield({ admin, bundleId: 'bundle-1', revision: 'new', pricingMode: 'scheduled', active: true });
  expect(field.compareDigest).toBe('digest');
  expect(JSON.parse(field.value)).toEqual({ other: { revision: 'keep', pricingMode: 'standard' }, 'bundle-1': { revision: 'new', pricingMode: 'scheduled' } });
  const inactive = await buildBundlePolicyMetafield({ admin, bundleId: 'other', revision: 'new', pricingMode: 'standard', active: false });
  expect(JSON.parse(inactive.value)).toEqual({});
});
it.each([null, { revision: 'one' }, 'old', { revision: 'one', pricingMode: 'invalid' }])('rejects unpublished or invalid current authorization: %j', async (value) => {
  const admin = { graphql: jest.fn().mockResolvedValue({ json: async () => ({ data: { shop: { id: 'gid://shopify/Shop/1', policy: { value: JSON.stringify({ 'bundle-1': value }), compareDigest: 'digest' } } } }) }) };
  await expect(readPublishedBundlePolicy(admin, 'bundle-1')).resolves.toBeNull();
});
it.each([
  { errors: [{ message: 'Denied' }], data: { shop: { id: 'gid://shopify/Shop/1', policy: null } } },
  { data: {} },
  { data: { shop: { id: 'gid://shopify/Shop/1' } } },
  { data: { shop: { id: 'gid://shopify/Shop/1', policy: { value: '{}', compareDigest: null } } } },
])('never creates a replacement map from an incomplete read: %j', async (response) => {
  const admin = { graphql: jest.fn().mockResolvedValue({ json: async () => response }) };
  await expect(buildBundlePolicyMetafield({ admin, bundleId: 'bundle-1', revision: 'new', pricingMode: 'standard', active: true })).rejects.toThrow();
});
it('counts the complete UTF-8 policy map before publishing', async () => {
  const admin = { graphql: jest.fn().mockResolvedValue({ json: async () => ({ data: { shop: { id: 'gid://shopify/Shop/1', policy: { value: JSON.stringify({ other: 'é'.repeat(5000) }), compareDigest: 'digest' } } } }) }) };
  await expect(buildBundlePolicyMetafield({ admin, bundleId: 'bundle-1', revision: 'new', pricingMode: 'standard', active: true })).rejects.toThrow('10KB');
});

it('revokes a deleted bundle with the native compareDigest while retaining other policies', async () => {
  const { removePublishedBundlePolicy } = await import('../../../app/services/bundle-authorization-policy.server');
  const admin = { graphql: jest.fn(async (_q, options?: any) => ({ json: async () => options?.variables
    ? { data: { metafieldsSet: { metafields: options.variables.metafields, userErrors: [] } } }
    : { data: { shop: { id: 'shop', policy: { value: JSON.stringify({ 'bundle-1': { revision: 'old', pricingMode: 'scheduled' }, other: { revision: 'keep', pricingMode: 'standard' } }), compareDigest: 'digest' } } } } })) };
  await removePublishedBundlePolicy(admin, 'bundle-1');
  const field = admin.graphql.mock.calls[1][1].variables.metafields[0];
  expect(field.compareDigest).toBe('digest');
  expect(JSON.parse(field.value)).toEqual({ other: { revision: 'keep', pricingMode: 'standard' } });
});

it('does not revoke authorization for add-on product display data edits', () => {
  const original: any = structuredClone(input);
  original.bundle.personalizationData = { addonProducts: { isEnabled: true, tiers: [{ tierId: 'tier', discount: { type: 'PERCENTAGE', value: 10 }, eligibilityCondition: { type: 'QUANTITY', value: 2 }, selectedAddonProducts: [{ id: 'gid://shopify/Product/2', title: 'Before', imageUrl: 'before.jpg', variants: [{ id: 'gid://shopify/ProductVariant/2', title: 'Before' }] }] }] } };
  const changed = structuredClone(original);
  changed.bundle.personalizationData.addonProducts.tiers[0].selectedAddonProducts[0].title = 'After';
  changed.bundle.personalizationData.addonProducts.tiers[0].selectedAddonProducts[0].imageUrl = 'after.jpg';
  expect(buildBundleAuthorizationPolicy(changed).revision).toBe(buildBundleAuthorizationPolicy(original).revision);
  changed.bundle.personalizationData.addonProducts.tiers[0].discount.value = 20;
  expect(buildBundleAuthorizationPolicy(changed).revision).not.toBe(buildBundleAuthorizationPolicy(original).revision);
});
