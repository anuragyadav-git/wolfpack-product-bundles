import {
  bindDrawerSwipeDismissal,
  DrawerLayerManager,
  shouldDismissDrawerSwipe,
} from '../../../app/assets/widgets/shared/drawer-layer-manager';

describe('PPB drawer layer manager', () => {
  let documentRef: any;

  beforeEach(() => {
    const listeners = new Map<string, Set<(event: any) => void>>();
    documentRef = {
      documentElement: { style: { overflow: 'clip', scrollbarGutter: 'auto' } },
      body: { style: { overflow: 'auto' } },
      addEventListener: (type: string, listener: (event: any) => void) => {
        const handlers = listeners.get(type) || new Set();
        handlers.add(listener);
        listeners.set(type, handlers);
      },
      removeEventListener: (type: string, listener: (event: any) => void) => {
        listeners.get(type)?.delete(listener);
      },
      dispatch: (type: string, event: any) => {
        [...(listeners.get(type) || [])].forEach((listener) => listener(event));
      },
    };
  });

  it('lets only the topmost layer handle Escape and restores scroll after the last close', () => {
    const manager = new DrawerLayerManager(documentRef);
    const pickerClose = jest.fn();
    const variantClose = jest.fn();

    const picker = manager.open({ id: 'picker', requestClose: pickerClose });
    const variant = manager.open({ id: 'variant', requestClose: variantClose });

    expect(documentRef.documentElement.style.overflow).toBe('hidden');
    expect(documentRef.documentElement.style.scrollbarGutter).toBe('stable');
    expect(documentRef.body.style.overflow).toBe('hidden');

    documentRef.dispatch('keydown', { key: 'Escape', preventDefault: jest.fn() });
    expect(variantClose).toHaveBeenCalledTimes(1);
    expect(pickerClose).not.toHaveBeenCalled();

    manager.close(variant);
    expect(documentRef.body.style.overflow).toBe('hidden');
    documentRef.dispatch('keydown', { key: 'Escape', preventDefault: jest.fn() });
    expect(pickerClose).toHaveBeenCalledTimes(1);

    manager.close(picker);
    expect(documentRef.documentElement.style.overflow).toBe('clip');
    expect(documentRef.documentElement.style.scrollbarGutter).toBe('auto');
    expect(documentRef.body.style.overflow).toBe('auto');
  });

  it('restores focus to the exact connected trigger', () => {
    const manager = new DrawerLayerManager(documentRef);
    const trigger = { isConnected: true, focus: jest.fn() };

    const layer = manager.open({ id: 'variant', requestClose: jest.fn(), trigger });
    manager.close(layer, { restoreFocus: true });

    expect(trigger.focus).toHaveBeenCalledWith({ preventScroll: true });
  });
});

describe('shared drawer swipe threshold', () => {
  it('accepts intentional downward motion and rejects horizontal, upward, and short slow motion', () => {
    expect(shouldDismissDrawerSwipe({ distanceY: 100, distanceX: 10, velocityY: 0.2 })).toBe(true);
    expect(shouldDismissDrawerSwipe({ distanceY: 40, distanceX: 5, velocityY: 0.7 })).toBe(true);
    expect(shouldDismissDrawerSwipe({ distanceY: 55, distanceX: 5, velocityY: 0.2 })).toBe(false);
    expect(shouldDismissDrawerSwipe({ distanceY: 100, distanceX: 110, velocityY: 0.8 })).toBe(false);
    expect(shouldDismissDrawerSwipe({ distanceY: -100, distanceX: 0, velocityY: -0.8 })).toBe(false);
  });

  it('dismisses the bound topmost drawer after an intentional downward drag', () => {
    const handle = createPointerTarget();
    handle.setPointerCapture.mockImplementation(() => {
      throw new Error('pointer capture unavailable');
    });
    handle.releasePointerCapture.mockImplementation(() => {
      throw new Error('pointer capture unavailable');
    });
    const surface = { style: {} as Record<string, string> };
    const requestClose = jest.fn();

    bindDrawerSwipeDismissal({
      handle,
      surface,
      canDismiss: () => true,
      requestClose,
      now: (() => {
        let value = 0;
        return () => (value += 100);
      })(),
      settleDuration: 0,
    });

    handle.dispatch('pointerdown', { pointerId: 1, clientX: 10, clientY: 10 });
    handle.dispatch('pointermove', { pointerId: 1, clientX: 14, clientY: 130 });
    handle.dispatch('pointerup', { pointerId: 1, clientX: 14, clientY: 130 });

    expect(requestClose).toHaveBeenCalledTimes(1);
  });

  it('keeps the drawer open for short drags and when another layer owns dismissal', () => {
    const handle = createPointerTarget();
    const surface = { style: {} as Record<string, string> };
    const requestClose = jest.fn();
    let topmost = true;
    let currentTime = 0;

    bindDrawerSwipeDismissal({
      handle,
      surface,
      canDismiss: () => topmost,
      requestClose,
      now: () => (currentTime += 100),
      settleDuration: 0,
    });

    handle.dispatch('pointerdown', { pointerId: 1, clientX: 10, clientY: 10 });
    handle.dispatch('pointerup', { pointerId: 1, clientX: 12, clientY: 45 });
    topmost = false;
    handle.dispatch('pointerdown', { pointerId: 2, clientX: 10, clientY: 10 });
    handle.dispatch('pointerup', { pointerId: 2, clientX: 12, clientY: 150 });

    expect(requestClose).not.toHaveBeenCalled();
  });
});

function createPointerTarget() {
  const listeners = new Map<string, (event: any) => void>();
  return {
    addEventListener(type: string, listener: (event: any) => void) {
      listeners.set(type, listener);
    },
    removeEventListener(type: string) {
      listeners.delete(type);
    },
    setPointerCapture: jest.fn(),
    releasePointerCapture: jest.fn(),
    dispatch(type: string, event: any) {
      listeners.get(type)?.({ preventDefault: jest.fn(), ...event });
    },
  };
}
