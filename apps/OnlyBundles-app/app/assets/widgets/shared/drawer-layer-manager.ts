export function shouldDismissDrawerSwipe({
  distanceY = 0,
  distanceX = 0,
  velocityY = 0,
}: any = {}) {
  const verticalDistance = Number(distanceY);
  const horizontalDistance = Math.abs(Number(distanceX));
  const downwardVelocity = Number(velocityY);

  if (!Number.isFinite(verticalDistance) || verticalDistance <= 0) return false;
  if (horizontalDistance > verticalDistance) return false;
  return verticalDistance >= 96 || downwardVelocity >= 0.6;
}

export function bindDrawerSwipeDismissal({
  handle,
  canDismiss = () => true,
  requestClose,
  now = () => globalThis.performance?.now?.() || Date.now(),
}: any = {}) {
  if (!handle?.addEventListener || typeof requestClose !== 'function') {
    return () => {};
  }

  let gesture: any = null;

  const onPointerDown = (event: any) => {
    if (canDismiss() === false) return;
    gesture = {
      pointerId: event.pointerId,
      startX: Number(event.clientX) || 0,
      startY: Number(event.clientY) || 0,
      startedAt: now(),
    };
    try {
      handle.setPointerCapture?.(event.pointerId);
    } catch (_error) {
      // Pointer capture is optional; the release event still resolves the gesture.
    }
  };

  const finishGesture = (event: any) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;

    const elapsed = Math.max(1, now() - gesture.startedAt);
    const distanceX = (Number(event.clientX) || 0) - gesture.startX;
    const distanceY = (Number(event.clientY) || 0) - gesture.startY;
    const shouldDismiss = canDismiss() !== false && shouldDismissDrawerSwipe({
      distanceY,
      distanceX,
      velocityY: distanceY / elapsed,
    });

    try {
      handle.releasePointerCapture?.(gesture.pointerId);
    } catch (_error) {
      // The pointer may already have been released by the browser.
    }
    gesture = null;

    if (!shouldDismiss) return;
    event.preventDefault?.();
    requestClose('swipe');
  };

  const cancelGesture = (event: any) => {
    if (gesture && (event?.pointerId === undefined || event.pointerId === gesture.pointerId)) {
      try {
        handle.releasePointerCapture?.(gesture.pointerId);
      } catch (_error) {
        // The pointer may already have been released by the browser.
      }
      gesture = null;
    }
  };

  handle.addEventListener('pointerdown', onPointerDown);
  handle.addEventListener('pointerup', finishGesture);
  handle.addEventListener('pointercancel', cancelGesture);

  return () => {
    handle.removeEventListener?.('pointerdown', onPointerDown);
    handle.removeEventListener?.('pointerup', finishGesture);
    handle.removeEventListener?.('pointercancel', cancelGesture);
    gesture = null;
  };
}

export class DrawerLayerManager {
  documentRef: any;
  layers: any[];
  previousRootOverflow: string;
  previousRootScrollbarGutter: string;
  previousBodyOverflow: string;

  constructor(documentRef: any = globalThis.document) {
    this.documentRef = documentRef;
    this.layers = [];
    this.previousRootOverflow = '';
    this.previousRootScrollbarGutter = '';
    this.previousBodyOverflow = '';
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  open({ id, requestClose, trigger = null }: any) {
    const layer: any = { id, requestClose, trigger };
    if (this.layers.length === 0) {
      const root = this.documentRef?.documentElement;
      const body = this.documentRef?.body;
      this.previousRootOverflow = root?.style?.overflow || '';
      this.previousRootScrollbarGutter = root?.style?.scrollbarGutter || '';
      this.previousBodyOverflow = body?.style?.overflow || '';
      if (root?.style) {
        root.style.scrollbarGutter = 'stable';
        root.style.overflow = 'hidden';
      }
      if (body?.style) body.style.overflow = 'hidden';
      this.documentRef?.addEventListener?.('keydown', this.handleKeyDown);
    }
    this.layers.push(layer);
    return layer;
  }

  close(layer: any, { restoreFocus = false }: any = {}) {
    const index = this.layers.lastIndexOf(layer);
    if (index < 0) return;
    this.layers.splice(index, 1);

    if (restoreFocus && layer.trigger?.isConnected !== false) {
      layer.trigger?.focus?.({ preventScroll: true });
    }

    if (this.layers.length > 0) return;
    const root = this.documentRef?.documentElement;
    const body = this.documentRef?.body;
    if (root?.style) {
      root.style.overflow = this.previousRootOverflow;
      root.style.scrollbarGutter = this.previousRootScrollbarGutter;
    }
    if (body?.style) body.style.overflow = this.previousBodyOverflow;
    this.documentRef?.removeEventListener?.('keydown', this.handleKeyDown);
  }

  isTopmost(layer: any) {
    return this.layers[this.layers.length - 1] === layer;
  }

  handleKeyDown(event: any) {
    if (event?.key !== 'Escape') return;
    const layer = this.layers[this.layers.length - 1];
    if (!layer || typeof layer.requestClose !== 'function') return;
    event.preventDefault?.();
    layer.requestClose('escape');
  }
}

export const drawerLayerManager = new DrawerLayerManager();
