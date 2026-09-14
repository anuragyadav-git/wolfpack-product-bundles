---
schema_version: 1
id: storefront-design-director-responsive-contract-template
title: Responsive Contract Template
type: design-job-template
status: active
summary: Defines region-level layout transformations, overflow, and safe-area behavior across required widths.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - responsive-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/responsive-contract.md
related_docs:
  - .agents/skills/storefront-design-director/references/responsive-design-contract.md
tags:
  - template
keywords:
  - breakpoint
  - safe-area
---

# Responsive Contract

Artifact job ID: storefront-variant-selectors-across-product-cards-and-modal-20260911
Artifact revision: 2
Artifact status: complete

Direction A approval covers the content-driven reflow model below. Existing template breakpoints are retained; unobserved exact spacing remains a recommendation until Chrome QA.

## Required viewports and container widths

| ID | Width | Height | Placement width | Purpose | Required states |
|---|---|---|---|---|---|
| VP-320 | 320 | 720 | Record actual widget/card/modal width | Narrow stress and minimum viable access | VS-02 through VS-18, VS-22 |
| VP-360 | 360 | 800 | Record actual | Baseline mobile reflow | VS-02 through VS-19 |
| VP-390 | 390 | 844 | Record actual | Primary mobile acceptance | All applicable states, including sticky/footer non-obstruction |
| VP-414 | 414 | 896 | Record actual | Wide-mobile wrapping | VS-03 through VS-18 |
| VP-768 | 768 | 1024 | Record actual | PPB mobile/desktop boundary and tablet portrait | VS-02 through VS-18 |
| VP-1024 | 1024 | 768 | Record actual | Tablet landscape/small desktop | VS-02 through VS-18 |
| VP-1280 | 1280 | 800 | Record actual | Required desktop acceptance | All applicable desktop states |
| VP-1440 | 1440 | 900 | Record actual | Primary roomy desktop/modal density | VS-02 through VS-18 |
| VP-200Z | Desktop window at 200% zoom | At least 800 | Record actual CSS and capture pixels | High-zoom reflow | VS-10, VS-13 through VS-20 |

For FPB, the `fpb-shell` container is authoritative because the existing templates transform at 799/800px container width. For PPB, record both viewport and app-block/container width because themes can constrain the product-information column independently of the browser.

## Region transformations

| Region | Range | Size | Layout | Order | Visibility or replacement | Scroll | Sticky or fixed | Text and image | Controls and spacing | Safe area | Overflow |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Shared option group | Any width | `min-width: 0`; width equals containing card/details region | Groups stack; each group owns an intrinsic matrix | Shopify option order | Never hidden or mode-substituted | None | None | Labels wrap naturally and remain visible | Controls retain at least 44px target; gaps come from family density tokens | In normal flow | No page/card overflow; no clipping |
| Dropdown | Any width | Full available inline width | One labeled control | Within its option group | Existing FPB drawer replacement only where current policy already selects it | Native option popup is browser-owned | FPB drawer remains existing fixed overlay when applicable | Current value truncation must not remove accessible full value | Full target height; no fixed card-width assumption | Drawer respects existing viewport inset/safe area | Trigger stays contained; native popup exempt from document overflow checks |
| Pill matrix | Wide card/modal | Content-driven intrinsic columns | Short values share rows; long values span more width/full row | Source order | All values visible | None | None | Label may wrap; never ellipsize the only visible value | Normal template density | Normal flow | Wrap only |
| Pill matrix | Narrow card/sheet | Fewer intrinsic columns down to one | Same semantic tree; no scaled desktop version | Source order | All values visible | None | None | Long labels use full row | Mobile density may reduce gaps, not target size | Above existing sticky action safe area | Wrap only |
| Color swatch matrix | Wide | Intrinsic columns sized by target and label needs | Swatch controls plus persistent selected label | Source order | Tooltip optional only when configured | None | Tooltip may overlay without layout reservation | Canonical Shopify color; neutral labeled fallback | Target remains at least 44px | Tooltip clamped to viewport | No rail or clipped tooltip |
| Color swatch matrix | Narrow/coarse pointer | Fewer columns | Same controls | Source order | Hover tooltip is not required; persistent label remains | None | None | Selected label always visible | Same target; no miniaturization | Normal flow | Wrap only |
| Image swatch matrix | Any | Intrinsic columns; media keeps aspect | Same semantic tree | Source order | All values visible; missing media uses labeled neutral control | None | None | Swatch image is decorative; label remains available | Target/media density varies by surface, not semantics | Normal flow | No image distortion or broken-image overflow |
| FPB Standard/Classic card | `fpb-shell >=800px` | Existing card width; selector block width 100% | Selector between identity/price and quantity/Add | Existing card source order | Desktop presentation retained | No selector scroller | Existing bundle footer independent | Initial selector content may raise row height; sibling cards stretch equally | Normal density | Existing footer inset unchanged | Remove fixed selector-row clipping; card remains contained |
| FPB Standard/Classic card | `fpb-shell <=799px` | Existing narrow card width | Intrinsic reflow; existing drawer where policy selects it | Same logical order | No duplicate inline and drawer exposure | Drawer body keeps its existing vertical owner | Existing mobile bundle footer remains independent | Labels and values wrap; drawer identity remains visible | Mobile gap only; 44px targets | Drawer/footer safe areas preserved | No nested horizontal scroll |
| FPB Compact card | Any | Existing compact card width | Fewer intrinsic columns; long values full-row | Selector stays out of image/title/price rows | Existing button capability only | None | Existing footer independent | No font scaling to force fit | Compact gaps, unchanged target | Normal flow | Wrap only |
| FPB Horizontal card | `fpb-shell >=800px` | Use the existing wide details band | Selector block spans available details width | After identity/price, before quantity/Add | Existing desktop control type | None | Existing footer independent | Long values wrap within details band | Normal density | Normal flow | No action-row collision |
| FPB Horizontal card | `fpb-shell <=799px` | Full available card width | Stack below identity | Same source order | Existing inline mobile dropdown behavior retained | None | Existing footer independent | Full selected value remains accessible | Mobile spacing | Footer safe area unchanged | No page overflow |
| FPB details modal | Desktop | Existing information column | Groups stack with roomier intrinsic matrices | After identity/price, before quantity/Add | No replacement | Modal's existing vertical scroll only | Existing dialog | Product media column unchanged | Relaxed modal density | Modal insets preserved | No nested selector scroller |
| FPB details sheet | Narrow | Full sheet content width | Single-column normal flow | Same logical order | Desktop columns collapse through existing modal behavior | Existing sheet vertical scroll only | Existing fixed sheet | Media fits current sheet width; labels wrap | Mobile density; 44px targets | Bottom action remains reachable above safe area | No horizontal overflow |
| PPB Grid card | Any | Existing grid track width | Smallest density; track count follows actual card width | Dedicated selector block | Merchant-selected mode retained | None | Existing sticky CTA independent | Long labels take wider/full rows | Compact gaps, unchanged targets | Normal flow | Wrap; grid page width unchanged |
| PPB List card | Any | Existing details region | Use available details width; do not share price/action row | Dedicated selector block | Merchant-selected mode retained | None | Existing drawer/footer independent | Text wraps independently of action width | Normal density | Normal flow | Remove selector width rules that collide with fixed action column |
| PPB slot picker | `<768px` | Existing sheet/card width | Single-column card details; intrinsic selector | Existing picker order | No nested details modal | Existing picker sheet vertical scroll only | Existing modal sheet | Values wrap; media unchanged | Mobile density | Sheet safe area and close control preserved | No nested selector scroll |
| PPB slot picker | `>=768px` | Existing modal card width | Relaxed intrinsic columns | Existing picker order | No replacement | Existing modal vertical scroll only | Existing modal | Labels and swatches use available card width | Modal density | Dialog inset preserved | No selector overflow |
| Sticky bundle actions | Any | Existing template width | Unchanged | Unchanged | Never replaced by selector content | Existing summary scroll only where already owned | Existing sticky/fixed behavior | Totals/CTA text unchanged | Selector does not consume footer space | Existing environment safe-area inset | Must not cover selector's last row or modal action |

## Critical boundaries

- FPB container transformation: test `fpb-shell` at 799px, 800px, and 801px. The same semantic selector tree remains; only template placement/density and the already-owned drawer/inline policy may change.
- PPB mobile drawer/picker boundary: test viewport at 767px, 768px, and 769px.
- PPB Grid narrow rule: test viewport at 479px, 480px, and 481px because the existing Grid stylesheet has a 480px rule.
- Primary acceptance: actual 390x844 and 1280x800 Chrome windows at 100% zoom. The earlier 580x844 capture is context only and cannot satisfy VP-390.
- Container stress: independently test a card/details container at 320px, 240px, and the narrowest width produced by each live template; do not force browser viewport changes through CSS or JavaScript.

## Orientation, high zoom, and opposite-viewport non-regression

- At portrait and landscape orientations, selectors reflow from actual container width; no orientation-specific duplicate markup is introduced.
- At 200% zoom, apply the same narrow transformation through natural layout. Keyboard focus, labels, selected text, and every available value remain reachable.
- Desktop changes cannot activate mobile drawers or sticky mobile geometry at wide widths. Mobile changes cannot alter the desktop modal columns, card grid count, or sticky sidebar ownership.
- Reduced motion disables nonessential selector, tooltip, drawer, or focus transitions without removing state feedback.
- Browser QA must record actual `innerWidth`, `innerHeight`, device pixel ratio, widget width, card width, selector width, document scroll width, and each modal/sheet content width. A requested resize that Chrome does not achieve is reported, not relabeled.
