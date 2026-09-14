import { mergeCartBundleDetails, syncCartBundleDetails } from '../../../app/lib/cart-bundle-details';
const entry = (key: string, runtimeToken = 'signed') => ({ key, runtimeToken, displayProperties: { Items: 'Bundle' } });
const page = (value: string | null, offers: string[], next = false, cursor: string | null = null) => ({ cart: {
  id: 'cart', metafields: [{ value }], lines: { nodes: offers.map(value => ({ offer: { value } })), pageInfo: { hasNextPage: next, endCursor: cursor } },
} });
describe('complete cart bundle payload', () => {
  it('retains active groups and pending group, pruning removed entries', () => {
    expect(mergeCartBundleDetails(JSON.stringify([entry('active'), entry('stale')]), new Set(['active']), entry('pending'))).toEqual([entry('active'), entry('pending')]);
  });
  it('measures complete UTF-8 JSON including overhead and rejects overflow', () => {
    expect(() => mergeCartBundleDetails(null, new Set(), entry('pending', 'é'.repeat(5000)))).toThrow('BUNDLE_CART_CAPACITY_EXCEEDED');
    expect(mergeCartBundleDetails(null, new Set(), entry('pending', 'a'.repeat(9800)))).toHaveLength(1);
  });
  it('rejects malformed data instead of silently dropping authorization', () => {
    expect(() => mergeCartBundleDetails('{', new Set(), entry('pending'))).toThrow('BUNDLE_CART_CONFLICT');
  });
  it('paginates active groups and verifies native write and readback', async () => {
    const old = JSON.stringify([entry('active'), entry('stale')]);
    const expected = JSON.stringify([entry('active'), entry('pending')]);
    const request = jest.fn().mockResolvedValueOnce(page(old, [], true, 'next')).mockResolvedValueOnce(page(old, ['active_1']))
      .mockResolvedValueOnce({ cartMetafieldsSet: { metafields: [{ key: 'bundle_details', value: expected }], userErrors: [] } }).mockResolvedValueOnce(page(expected, ['active_1']));
    await syncCartBundleDetails(request, 'cart', entry('pending'), 1);
    expect(request.mock.calls[1][1]).toEqual({ cartId: 'cart', cursor: 'next' });
    expect(request.mock.calls[2][1].metafields[0].value).toBe(expected);
  });
  it('does not write when retained active data overflows', async () => {
    const request = jest.fn().mockResolvedValue(page(JSON.stringify([entry('active', 'a'.repeat(9900))]), ['active']));
    await expect(syncCartBundleDetails(request, 'cart', entry('pending'), 1)).rejects.toThrow('BUNDLE_CART_CAPACITY_EXCEEDED');
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('detects a concurrent overwrite without retrying mutation', async () => {
    const expected = JSON.stringify([entry('pending')]);
    const request = jest.fn().mockResolvedValueOnce(page(null, []))
      .mockResolvedValueOnce({ cartMetafieldsSet: { metafields: [{ key: 'bundle_details', value: expected }], userErrors: [] } }).mockResolvedValueOnce(page('[]', []));
    await expect(syncCartBundleDetails(request, 'cart', entry('pending'), 1)).rejects.toThrow('BUNDLE_CART_CONFLICT');
    expect(request).toHaveBeenCalledTimes(3);
  });
});

it('rejects eleven pending lines before reading or writing Shopify', async () => {
  const request = jest.fn();
  await expect(syncCartBundleDetails(request, 'cart', entry('pending'), 11)).rejects.toThrow('BUNDLE_CART_LINE_LIMIT_EXCEEDED');
  expect(request).not.toHaveBeenCalled();
});
it('counts native components across pages without counting ordinary cart lines', async () => {
  const request = jest.fn().mockResolvedValueOnce(page(null, [], true, 'next'))
    .mockResolvedValueOnce({ cart: { id: 'cart', metafields: [], lines: { nodes: [
      { offer: null }, { offer: { value: 'existing' }, lineComponents: Array.from({ length: 8 }, () => ({ offer: null })) },
    ], pageInfo: { hasNextPage: false, endCursor: null } } } });
  await expect(syncCartBundleDetails(request, 'cart', entry('pending'), 3)).rejects.toThrow('BUNDLE_CART_LINE_LIMIT_EXCEEDED');
  expect(request).toHaveBeenCalledTimes(2);
});
it('requires a valid pending line count', async () => {
  for (const count of [undefined, 0, -1, 1.5]) {
    await expect(syncCartBundleDetails(jest.fn(), 'cart', entry('pending'), count as any)).rejects.toThrow('BUNDLE_CART_LINE_LIMIT_EXCEEDED');
  }
});

it('accepts exactly ten bundle lines with ordinary lines present', async () => {
  const old = JSON.stringify([entry('active')]);
  const expected = JSON.stringify([entry('active'), entry('pending')]);
  const existing = page(old, Array(9).fill('active'));
  existing.cart.lines.nodes.push({ offer: null } as any);
  const request = jest.fn().mockResolvedValueOnce(existing)
    .mockResolvedValueOnce({ cartMetafieldsSet: { metafields: [{ key: 'bundle_details', value: expected }], userErrors: [] } })
    .mockResolvedValueOnce(page(expected, ['active']));
  await expect(syncCartBundleDetails(request, 'cart', entry('pending'), 1)).resolves.toBeUndefined();
  expect(request).toHaveBeenCalledTimes(3);
});

it('accepts exactly 10000 UTF-8 bytes and rejects one additional byte', () => {
  const pending = entry('boundary', 'signed');
  pending.displayProperties.Items = 'é🎁"\\\n';
  const overhead = Buffer.byteLength(JSON.stringify([pending]), 'utf8');
  pending.displayProperties.Items += 'a'.repeat(10000 - overhead);
  expect(Buffer.byteLength(JSON.stringify([pending]), 'utf8')).toBe(10000);
  expect(mergeCartBundleDetails(null, new Set(), pending)).toEqual([pending]);
  pending.displayProperties.Items += 'a';
  expect(() => mergeCartBundleDetails(null, new Set(), pending)).toThrow('BUNDLE_CART_CAPACITY_EXCEEDED');
});
