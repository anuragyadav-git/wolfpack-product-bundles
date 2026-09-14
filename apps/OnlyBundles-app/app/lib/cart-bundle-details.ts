export const MAX_BUNDLE_CART_LINES = 10;

/** The complete cart metafield is one Shopify Function input, limited to 10,000 UTF-8 bytes. */
export type CartBundleDetailsEntry = {
  key: string;
  displayProperties: Record<string, string>;
  runtimeToken: string;
};

export const CART_BUNDLE_DETAILS_QUERY = `
  query CartBundleDetails($cartId: ID!, $cursor: String) {
    cart(id: $cartId) {
      id
      metafields(identifiers: [{ key: "bundle_details" }]) { key value }
      lines(first: 250, after: $cursor) {
        nodes {
          offer: attribute(key: "_wolfpackProductBundle:OfferId") { value }
          ... on ComponentizableCartLine {
            lineComponents { offer: attribute(key: "_wolfpackProductBundle:OfferId") { value } }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;
export const SET_CART_BUNDLE_DETAILS_MUTATION = `
  mutation SetCartBundleDetails($metafields: [CartMetafieldsSetInput!]!) {
    cartMetafieldsSet(metafields: $metafields) {
      metafields { key value }
      userErrors { field message }
    }
  }
`;

export function mergeCartBundleDetails(existingValue: string | null, activeKeys: Set<string>, pending: CartBundleDetailsEntry): CartBundleDetailsEntry[] {
  let parsed: unknown;
  try { parsed = JSON.parse(existingValue ?? '[]'); } catch { throw new Error('BUNDLE_CART_CONFLICT'); }
  if (!Array.isArray(parsed) || parsed.some(entry => !entry || typeof entry.key !== 'string' || typeof entry.runtimeToken !== 'string')) {
    throw new Error('BUNDLE_CART_CONFLICT');
  }
  const entries = parsed.filter(entry => entry.key !== pending.key && activeKeys.has(entry.key));
  entries.push(pending);
  if (new TextEncoder().encode(JSON.stringify(entries)).byteLength > 10_000) {
    throw new Error('BUNDLE_CART_CAPACITY_EXCEEDED');
  }
  return entries;
}

type StorefrontRequest = (query: string, variables: Record<string, unknown>) => Promise<any>;

/** Shopify owns storage; callers serialize the write and subsequent add with Web Locks. */
export async function syncCartBundleDetails(request: StorefrontRequest, cartId: string, pending: CartBundleDetailsEntry, pendingLineCount: number): Promise<void> {
  if (!Number.isInteger(pendingLineCount) || pendingLineCount < 1 || pendingLineCount > MAX_BUNDLE_CART_LINES) throw new Error('BUNDLE_CART_LINE_LIMIT_EXCEEDED');
  let bundleLineCount = pendingLineCount;
  const activeKeys = new Set<string>();
  const seenCursors = new Set<string>();
  let cursor: string | null = null;
  let existingValue: string | null | undefined;
  do {
    const { cart } = await request(CART_BUNDLE_DETAILS_QUERY, { cartId, cursor });
    if (!cart?.id || !Array.isArray(cart.lines?.nodes) || typeof cart.lines.pageInfo?.hasNextPage !== 'boolean' || !Array.isArray(cart.metafields)) {
      throw new Error('BUNDLE_CART_CONFLICT');
    }
    const value = cart.metafields[0]?.value ?? null;
    if (existingValue !== undefined && value !== existingValue) throw new Error('BUNDLE_CART_CONFLICT');
    existingValue = value;
    for (const line of cart.lines.nodes) {
      const components = line.lineComponents ?? [];
      bundleLineCount += components.length > 0
        ? components.filter((component: any) => line.offer?.value || component.offer?.value).length
        : Number(Boolean(line.offer?.value));
      if (bundleLineCount > MAX_BUNDLE_CART_LINES) throw new Error('BUNDLE_CART_LINE_LIMIT_EXCEEDED');
      for (const candidate of [line, ...(line.lineComponents ?? [])]) {
        const offer = candidate.offer?.value;
        if (typeof offer !== 'string') continue;
        activeKeys.add(offer); // Transformed parent carries the group; component lines append an ordinal.
        activeKeys.add(offer.replace(/_\d+$/, ''));
      }
    }
    cursor = cart.lines.pageInfo.hasNextPage ? cart.lines.pageInfo.endCursor : null;
    if (cart.lines.pageInfo.hasNextPage && (!cursor || seenCursors.has(cursor))) throw new Error('BUNDLE_CART_CONFLICT');
    if (cursor) seenCursors.add(cursor);
  } while (cursor);
  const entries = mergeCartBundleDetails(existingValue ?? null, activeKeys, pending);
  const value = JSON.stringify(entries);
  const { cartMetafieldsSet: result } = await request(SET_CART_BUNDLE_DETAILS_MUTATION, {
    metafields: [{ ownerId: cartId, key: 'bundle_details', type: 'json', value }],
  });
  if (!result || !Array.isArray(result.userErrors) || result.userErrors.length || !matches(result.metafields?.find((field: any) => field.key === 'bundle_details')?.value, entries)) {
    throw new Error('BUNDLE_CART_CONFLICT');
  }
  const { cart } = await request(CART_BUNDLE_DETAILS_QUERY, { cartId, cursor: null });
  if (!matches(cart?.metafields?.[0]?.value, entries)) throw new Error('BUNDLE_CART_CONFLICT');
}

function matches(value: unknown, expected: CartBundleDetailsEntry[]): boolean {
  if (typeof value !== 'string') return false;
  try {
    const actual = JSON.parse(value);
    return Array.isArray(actual) && actual.length === expected.length && expected.every(entry => {
      const saved = actual.find(candidate => candidate?.key === entry.key);
      return saved?.runtimeToken === entry.runtimeToken
        && saved.displayProperties && Object.keys(saved.displayProperties).length === Object.keys(entry.displayProperties).length
        && Object.entries(entry.displayProperties).every(([key, value]) => saved.displayProperties[key] === value);
    });
  } catch { return false; }
}
