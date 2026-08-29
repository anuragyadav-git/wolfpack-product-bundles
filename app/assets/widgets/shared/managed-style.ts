const MANAGED_STYLE_ATTRIBUTE = 'data-wpb-managed-style';

function normalizeStyleKey(key: unknown) {
  return String(key ?? '').trim().replace(/[^a-zA-Z0-9_-]/g, '-');
}

export function replaceManagedStyle(
  runtimeDocument: Document,
  key: unknown,
  css: unknown,
): HTMLStyleElement | null {
  const normalizedKey = normalizeStyleKey(key);
  if (!normalizedKey) return null;

  const existing = typeof runtimeDocument.querySelectorAll === 'function'
    ? Array.from(
      runtimeDocument.querySelectorAll<HTMLStyleElement>(`style[${MANAGED_STYLE_ATTRIBUTE}]`),
    ).find((style) => style.dataset.wpbManagedStyle === normalizedKey) ?? null
    : runtimeDocument.querySelector<HTMLStyleElement>(
      `style[${MANAGED_STYLE_ATTRIBUTE}="${normalizedKey}"]`,
    );
  const source = String(css ?? '').trim();

  if (!source) {
    existing?.remove();
    return null;
  }

  const style = existing ?? runtimeDocument.createElement('style');
  style.dataset.wpbManagedStyle = normalizedKey;
  style.textContent = source;
  if (!existing) runtimeDocument.head.appendChild(style);
  return style;
}
