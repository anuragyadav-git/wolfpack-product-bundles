const APP_EMBED_MARKER_SELECTOR = '[data-wpb-app-embed]';

export function findOwnedAppEmbedMarker(
  currentScript: Element | null = document.currentScript,
  root: ParentNode = document,
): HTMLElement | null {
  const adjacentMarker = currentScript?.previousElementSibling;
  if (adjacentMarker?.matches(APP_EMBED_MARKER_SELECTOR)) {
    return adjacentMarker as HTMLElement;
  }

  const markers = root.querySelectorAll<HTMLElement>(APP_EMBED_MARKER_SELECTOR);
  const onlyMarker = markers.length === 1 ? markers[0] ?? null : null;
  return onlyMarker?.matches?.(APP_EMBED_MARKER_SELECTOR) ? onlyMarker : null;
}
