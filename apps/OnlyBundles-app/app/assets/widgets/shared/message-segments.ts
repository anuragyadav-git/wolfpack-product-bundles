export type MessageSegment = {
  kind: 'text' | 'condition' | 'discount';
  value: string;
};

const PLACEHOLDER_PATTERN = /\{\{([^{}]+)\}\}|\{([^{}]+)\}/g;

function appendSegment(segments: MessageSegment[], segment: MessageSegment) {
  if (!segment.value) return;
  const previous = segments.at(-1);
  if (previous?.kind === segment.kind && segment.kind === 'text') {
    previous.value += segment.value;
    return;
  }
  segments.push(segment);
}

export function formatMessageSegments(
  template: unknown,
  variables: Record<string, unknown> = {},
): MessageSegment[] {
  const source = String(template ?? '');
  const segments: MessageSegment[] = [];
  let cursor = 0;

  source.replace(PLACEHOLDER_PATTERN, (match, doubleKey, singleKey, offset) => {
    appendSegment(segments, { kind: 'text', value: source.slice(cursor, offset) });
    const key = String(doubleKey ?? singleKey ?? '').trim();
    if (!Object.prototype.hasOwnProperty.call(variables, key)) {
      appendSegment(segments, { kind: 'text', value: match });
    } else {
      const kind = key === 'conditionText'
        ? 'condition'
        : key === 'discountText'
          ? 'discount'
          : 'text';
      appendSegment(segments, { kind, value: String(variables[key] ?? '') });
    }
    cursor = offset + match.length;
    return match;
  });

  appendSegment(segments, { kind: 'text', value: source.slice(cursor) });
  return segments;
}

export function createMessageFragment(
  segments: MessageSegment[],
  runtimeDocument: Document = document,
): DocumentFragment {
  const fragment = runtimeDocument.createDocumentFragment();
  segments.forEach((segment) => {
    if (segment.kind === 'text') {
      fragment.append(runtimeDocument.createTextNode(segment.value));
      return;
    }
    const span = runtimeDocument.createElement('span');
    span.dataset.messageSegment = segment.kind;
    span.className = segment.kind === 'condition'
      ? 'bundle-conditions-text'
      : 'bundle-discount-text';
    span.textContent = segment.value;
    fragment.append(span);
  });
  return fragment;
}
