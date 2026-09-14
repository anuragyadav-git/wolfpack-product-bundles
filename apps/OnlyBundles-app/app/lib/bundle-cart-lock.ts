/** One native lock covers metafield read/write and cart add across tabs on this origin. */
export async function withBundleCartLock<T>(operation: () => Promise<T>): Promise<T> {
  if (typeof navigator === 'undefined' || !navigator.locks) throw new Error('BUNDLE_CART_LOCK_UNAVAILABLE');
  return navigator.locks.request('only-bundles-cart', { mode: 'exclusive' }, operation);
}
