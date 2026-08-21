---
schema_version: 1
id: storefront-design-director-responsive-contract-template
title: Responsive Contract Template
type: design-job-template
status: active
summary: Defines region-level layout transformations, overflow, and safe-area behavior across required widths.
last_audited: 2026-08-21
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

Artifact job ID: ppb-bundle-picker-modal-redesign-20260821
Artifact revision: 6
Artifact status: complete

## Required viewports and container widths

| ID | Width | Height | Placement width | Purpose | Required states |
|---|---|---|---|---|---|
| wide-desktop | 1440 | 900 | viewport | Five-column picker | loaded, grouped-variant, maximum-reached, details-update |
| desktop | 1280 | 800 | viewport | Four-column picker | loaded, quantity-below-maximum, validation-error, details-add |
| tablet | 768 | 1024 | viewport | Two-column transition | loaded, grouped-variant, topmost-details |
| mobile | 390 | 844 | viewport | Primary mobile | loaded, selected, validation-error |
| narrow-mobile | 360 | 800 | viewport | Narrow stress | loaded, long content |

## Region transformations

| Region | Range | Size | Layout | Order | Visibility or replacement | Scroll | Sticky or fixed | Text and image | Controls and spacing | Safe area | Overflow |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Picker sheet | all | 85dvh | flex column | header/catalog/footer | none | hidden outer | fixed bottom | content-driven | full width | bottom inset in footer | none |
| Header | 1024+ | intrinsic | stacked rail/categories | first | desktop close and full rail | none | flex-none | labels wrap/clip safely | existing controls | n/a | horizontal tab scrolling allowed |
| Header | 0-1023 | intrinsic | compact | first | current title and mobile close | none | flex-none | title wraps up to two lines | 44px close target | n/a | none |
| Catalog | 1440+ | remaining | five intrinsic tracks | second | sparse rows retain track width and align to start | vertical | flex-auto | media contained; titles stable | fluid gutters/gaps | n/a | no page overflow or stretched sparse cards |
| Catalog | 1024-1439 | remaining | four intrinsic tracks | second | sparse rows retain track width and align to start | vertical | flex-auto | media contained; titles stable | fluid gutters/gaps | n/a | no page overflow or stretched sparse cards |
| Catalog | 0-1023 | remaining | two minmax tracks | second | none | vertical | flex-auto | media contained; long titles wrap | fluid gutters/gap | n/a | no page overflow |
| Native selector | 769+ | card width | label then select | before action | visual `Select variant` label | none | normal flow | option text truncates safely | native control target | n/a | no card overflow |
| Native selector | 0-768 | card width | select | before action | label visually hidden but accessible | none | normal flow | option text truncates safely | native control target | n/a | no card overflow |
| Footer | 1024+ | 300px x content | centered actions | third | none | none | flex-none | summary truncates safely | existing targets | bottom inset | no catalog overlap |
| Footer | 0-1023 | 270px x content | centered actions | third | none | none | flex-none | summary truncates safely | existing targets | bottom inset | no catalog overlap |
| Footer summary | all | intrinsic, capped to footer minus 24px | icon/count, divider, prices | above action | none | none | absolute within footer | one-line content grows naturally | fluid gaps and padding | inherited | contained with zero page overflow |
| Filled slot | all | responsive maximum block size using the existing Horizontal tile and Vertical row geometry owners | media, identity, overlaid cross badge | selected-slot flow | same semantic tree at every width | none | fixed within slot flow | title wraps normally and visually clamps only when it reaches the cap; complete name remains accessible | compact badge with 44px target overlays the top end corner | n/a | no badge/title collision, slot overflow, or page overflow |
| Details sheet | all | full width, max 88dvh | one constrained content column | above picker | close/handle remain reachable | internal vertical only | fixed bottom, higher layer | gallery contains media; description wraps | native selector, quantity, Add/Update | top and bottom insets | no horizontal overflow or page scroll chaining |
| Magnifier | pointer/keyboard | intrinsic badge | image overlay | image | reveal on hover/focus-visible | n/a | image-owned | does not obscure product | image remains sole trigger | n/a | clipped to media |
| Magnifier | touch/coarse | intrinsic badge | image overlay | image | subtle persistent badge | n/a | image-owned | does not obscure product | image remains sole trigger | n/a | clipped to media |

## Critical boundaries

Record one pixel below, at, and one pixel above.

Validate 767/768/769 for selector-label treatment and two-column retention, plus 1023/1024/1025 and 1439/1440/1441 for compact header and four/five-column transformations. Columns remain content-driven through `minmax()`/intrinsic sizing rather than copied product-card pixels.

## Orientation, high zoom, and opposite-viewport non-regression

At 200% zoom the active sheet's internal scroller remains reachable and picker footer controls remain unobscured. Landscape uses the same 85dvh picker and 88dvh details ceilings. Product List and Product Grid are explicit non-regression templates. The user-provided responsive decisions cover the required viewport matrix; no screenshot-unobserved design choice remains open.
