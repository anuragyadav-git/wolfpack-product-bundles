const APP_EMBED_MARKER_SELECTOR = '[data-wpb-app-embed]';

type AppEmbedOwnership =
  | {
      status: 'owned';
      marker: HTMLElement;
      proxyRoots: string[];
    }
  | {
      status: 'missing' | 'conflict';
      marker: null;
      proxyRoots: string[];
    };

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

export function resolveAppEmbedOwnership(
  currentScript: Element | null = document.currentScript,
  root: ParentNode = document,
): AppEmbedOwnership {
  const markers = Array.from(
    root.querySelectorAll<HTMLElement>(APP_EMBED_MARKER_SELECTOR),
  );
  const proxyRoots = Array.from(
    new Set(
      markers
        .map((marker) => marker.dataset.storefrontProxyRoot?.trim() ?? '')
        .filter(Boolean),
    ),
  );

  if (markers.length > 1) {
    return { status: 'conflict', marker: null, proxyRoots };
  }

  const marker = findOwnedAppEmbedMarker(currentScript, root);
  if (!marker) {
    return { status: 'missing', marker: null, proxyRoots };
  }

  return { status: 'owned', marker, proxyRoots };
}
