import { withBundleCartLock } from '../../../app/lib/bundle-cart-lock';

describe('native cart lock', () => {
  it('holds the shared exclusive lock until the entire addition finishes', async () => {
    const events: string[] = [];
    const request = jest.fn(async (_name, _options, operation) => {
      events.push('locked'); await operation(); events.push('released');
    });
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { locks: { request } } });
    await withBundleCartLock(async () => { events.push('write'); await Promise.resolve(); events.push('add'); });
    expect(events).toEqual(['locked', 'write', 'add', 'released']);
    expect(request).toHaveBeenCalledWith('only-bundles-cart', { mode: 'exclusive' }, expect.any(Function));
  });
  it('fails before mutation when native coordination is unavailable', async () => {
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} });
    const add = jest.fn();
    await expect(withBundleCartLock(add)).rejects.toThrow('BUNDLE_CART_LOCK_UNAVAILABLE');
    expect(add).not.toHaveBeenCalled();
  });
});
