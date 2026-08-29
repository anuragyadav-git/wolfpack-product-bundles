import createDOMPurify from 'dompurify';

export type RichHtmlProfile = 'product-description' | 'review-badge';

const PRODUCT_DESCRIPTION_TAGS = [
  'a', 'b', 'blockquote', 'br', 'code', 'del', 'div', 'em', 'figcaption',
  'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li',
  'ol', 'p', 'pre', 's', 'small', 'span', 'strong', 'sub', 'sup', 'table',
  'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul',
];

const REVIEW_BADGE_TAGS = ['a', 'b', 'br', 'div', 'em', 'i', 'img', 'p', 'small', 'span', 'strong'];

const PROFILE_ATTRIBUTES: Record<RichHtmlProfile, string[]> = {
  'product-description': [
    'alt', 'aria-label', 'class', 'colspan', 'height', 'href', 'loading', 'rel',
    'rowspan', 'src', 'target', 'title', 'width',
  ],
  'review-badge': [
    'alt', 'aria-label', 'class', 'height', 'href', 'loading', 'rel', 'src',
    'target', 'title', 'width',
  ],
};

export function sanitizeRichHtmlFragment(
  source: unknown,
  profile: RichHtmlProfile,
  runtimeWindow: Window = window,
): DocumentFragment {
  const purifier = createDOMPurify(runtimeWindow as any);
  const allowedTags = profile === 'product-description'
    ? PRODUCT_DESCRIPTION_TAGS
    : REVIEW_BADGE_TAGS;

  return purifier.sanitize(String(source ?? ''), {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: PROFILE_ATTRIBUTES[profile],
    ALLOW_DATA_ATTR: profile === 'review-badge',
    ALLOW_ARIA_ATTR: true,
    FORBID_ATTR: ['style'],
    FORBID_TAGS: [
      'embed', 'form', 'iframe', 'input', 'link', 'meta', 'object', 'script',
      'select', 'style', 'svg', 'textarea', 'video',
    ],
    RETURN_DOM_FRAGMENT: true,
  }) as unknown as DocumentFragment;
}
