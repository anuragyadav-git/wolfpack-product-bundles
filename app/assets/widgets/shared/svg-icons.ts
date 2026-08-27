const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

function createSvgElement<K extends keyof SVGElementTagNameMap>(
  runtimeDocument: Document,
  name: K,
  attributes: Record<string, string>,
) {
  const element = runtimeDocument.createElementNS(SVG_NAMESPACE, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

export function createCloseIcon(
  runtimeDocument: Document,
  { size = 20, className = '' }: { size?: number; className?: string } = {},
) {
  const svg = createSvgElement(runtimeDocument, 'svg', {
    width: String(size),
    height: String(size),
    viewBox: '0 0 24 24',
    fill: 'none',
    'aria-hidden': 'true',
  });
  if (className) svg.setAttribute('class', className);
  svg.append(createSvgElement(runtimeDocument, 'path', {
    d: 'M18 6L6 18M6 6L18 18',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  }));
  return svg;
}

export function createChevronIcon(runtimeDocument: Document, direction: 'down' | 'up' | 'left' | 'right' = 'down') {
  const paths = {
    down: 'M5 7.5 10 12.5 15 7.5',
    up: 'M5 12.5 10 7.5 15 12.5',
    left: 'M12.5 5 7.5 10 12.5 15',
    right: 'M7.5 5 12.5 10 7.5 15',
  };
  const svg = createSvgElement(runtimeDocument, 'svg', {
    viewBox: '0 0 20 20',
    focusable: 'false',
    'aria-hidden': 'true',
  });
  svg.append(createSvgElement(runtimeDocument, 'path', {
    d: paths[direction],
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.75',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  }));
  return svg;
}

export function createTrashIcon(runtimeDocument: Document, size = 16) {
  const svg = createSvgElement(runtimeDocument, 'svg', {
    viewBox: '0 0 20 20',
    width: String(size),
    height: String(size),
    fill: 'none',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  svg.append(createSvgElement(runtimeDocument, 'path', {
    d: 'M6 2h8a1 1 0 0 1 1 1v1H5V3a1 1 0 0 1 1-1Zm-2 3h12l-1 13H5L4 5Zm4 2v9m4-9v9',
    stroke: 'currentColor',
    'stroke-width': '1.5',
    'stroke-linecap': 'round',
    fill: 'none',
  }));
  return svg;
}

export function createSearchIcon(runtimeDocument: Document, size = 18) {
  const svg = createSvgElement(runtimeDocument, 'svg', {
    viewBox: '0 0 24 24',
    width: String(size),
    height: String(size),
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'aria-hidden': 'true',
  });
  svg.append(
    createSvgElement(runtimeDocument, 'circle', { cx: '11', cy: '11', r: '8' }),
    createSvgElement(runtimeDocument, 'path', { d: 'M21 21l-4.35-4.35' }),
  );
  return svg;
}

export function createPlusIcon(runtimeDocument: Document, size = 28) {
  const svg = createSvgElement(runtimeDocument, 'svg', {
    width: String(size),
    height: String(size),
    viewBox: '0 0 40 40',
    fill: 'none',
    'aria-hidden': 'true',
  });
  svg.append(createSvgElement(runtimeDocument, 'path', {
    d: 'M20.202 3.06152V37.0082M37.1753 20.0348H3.22864',
    stroke: 'currentColor',
    'stroke-width': '5.09199',
    'stroke-linecap': 'square',
    'stroke-linejoin': 'round',
  }));
  return svg;
}

export function createGiftBadgeIcon(runtimeDocument: Document) {
  const svg = createSvgElement(runtimeDocument, 'svg', {
    viewBox: '0 0 24 24',
    fill: '#e53e3e',
    'aria-hidden': 'true',
  });
  svg.append(createSvgElement(runtimeDocument, 'path', {
    d: 'M20 7h-1.586l1.293-1.293a1 1 0 0 0-1.414-1.414L16 6.586V5a1 1 0 0 0-2 0v1.586l-1.293-1.293a1 1 0 0 0-1.414 1.414L12.586 8H11a1 1 0 1 0 0 2h1v2h-2a1 1 0 1 0 0 2h2v7l3-1.5 3 1.5V14h2a1 1 0 1 0 0-2h-2v-2h2a1 1 0 1 0 0-2zm-4 2v2h-2V9h2z',
  }));
  return svg;
}

export function createCartIcon(runtimeDocument: Document) {
  const svg = createSvgElement(runtimeDocument, 'svg', {
    viewBox: '0 0 24 24',
    focusable: 'false',
    'aria-hidden': 'true',
  });
  svg.append(createSvgElement(runtimeDocument, 'path', {
    d: 'M3 4.5h2.5l2.57 11.5H19.5M6.5 7.5h14l-3.5 5.9H7.8M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
    fill: 'currentColor',
  }));
  return svg;
}
