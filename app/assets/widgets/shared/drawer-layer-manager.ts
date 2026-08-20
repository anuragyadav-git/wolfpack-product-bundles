export function shouldDismissDrawerSwipe({
  distanceY = 0,
  distanceX = 0,
  velocityY = 0,
} = {}) {
  const verticalDistance = Number(distanceY);
  const horizontalDistance = Math.abs(Number(distanceX));
  const downwardVelocity = Number(velocityY);

  if (!Number.isFinite(verticalDistance) || verticalDistance <= 0) return false;
  if (horizontalDistance > verticalDistance) return false;
  return verticalDistance >= 96 || downwardVelocity >= 0.6;
}

export class DrawerLayerManager {
  constructor(documentRef = globalThis.document) {
    this.documentRef = documentRef;
    this.layers = [];
    this.previousRootOverflow = '';
    this.previousBodyOverflow = '';
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  open({ id, requestClose, trigger = null }) {
    const layer = { id, requestClose, trigger };
    if (this.layers.length === 0) {
      const root = this.documentRef?.documentElement;
      const body = this.documentRef?.body;
      this.previousRootOverflow = root?.style?.overflow || '';
      this.previousBodyOverflow = body?.style?.overflow || '';
      if (root?.style) root.style.overflow = 'hidden';
      if (body?.style) body.style.overflow = 'hidden';
      this.documentRef?.addEventListener?.('keydown', this.handleKeyDown);
    }
    this.layers.push(layer);
    return layer;
  }

  close(layer, { restoreFocus = false } = {}) {
    const index = this.layers.lastIndexOf(layer);
    if (index < 0) return;
    this.layers.splice(index, 1);

    if (restoreFocus && layer.trigger?.isConnected !== false) {
      layer.trigger?.focus?.({ preventScroll: true });
    }

    if (this.layers.length > 0) return;
    const root = this.documentRef?.documentElement;
    const body = this.documentRef?.body;
    if (root?.style) root.style.overflow = this.previousRootOverflow;
    if (body?.style) body.style.overflow = this.previousBodyOverflow;
    this.documentRef?.removeEventListener?.('keydown', this.handleKeyDown);
  }

  isTopmost(layer) {
    return this.layers[this.layers.length - 1] === layer;
  }

  handleKeyDown(event) {
    if (event?.key !== 'Escape') return;
    const layer = this.layers[this.layers.length - 1];
    if (!layer || typeof layer.requestClose !== 'function') return;
    event.preventDefault?.();
    layer.requestClose('escape');
  }
}

export const drawerLayerManager = new DrawerLayerManager();
