---
schema_version: 1
id: storefront-template-release-2026-08-10
title: Storefront Template Design System Release QA
type: qa-report
status: approved
summary: Records desktop and mobile runtime evidence for the eight FPB and PPB storefront templates and their canonical interactive states.
last_audited: 2026-08-10
owners:
  - engineering
domains:
  - storefront
systems:
  - bundle-template-design-system
source_paths:
  - design-system/00-inventory/state-registry.yaml
  - app/assets/bundle-widget-full-page.ts
  - app/assets/bundle-widget-product-page.ts
related_docs:
  - design-system/08-qa/release-matrix.md
  - design-system/08-qa/accessibility-matrix.md
tags:
  - qa
  - fpb
  - ppb
keywords:
  - storefront templates
  - responsive matrix
  - widget version 6.0.9
---

# Storefront Template Design System Release QA

## Release Identity

- **Environment:** SIT, `agent-5sfidg3m.myshopify.com`
- **Final widget version:** `6.0.9`
- **Base FPB skeleton batch:** `ad4ee572`
- **Approver:** Codex live QA
- **Timestamp:** `2026-08-10T16:48:00+05:30`
- **Screenshots:** Required loading, empty, selected, drawer, and responsive states were inspected live in Chrome. They were not committed, per repository policy.

## Exact Final Assets

### FPB

- JavaScript: `https://cdn.shopify.com/extensions/019fec98-da04-7ad4-8f45-5674ff2a77ef/dev-651fc2c9-e89c-4d4d-a0f6-a39abbc3e95f/assets/bundle-app-embed.js`
- JavaScript: `https://cdn.shopify.com/extensions/019fec98-da04-7ad4-8f45-5674ff2a77ef/dev-651fc2c9-e89c-4d4d-a0f6-a39abbc3e95f/assets/bundle-widget-full-page-bundled.js`
- CSS: `https://cdn.shopify.com/extensions/019fec98-da04-7ad4-8f45-5674ff2a77ef/dev-651fc2c9-e89c-4d4d-a0f6-a39abbc3e95f/assets/bundle-widget-bootstrap.css`
- CSS: `https://cdn.shopify.com/extensions/019fec98-da04-7ad4-8f45-5674ff2a77ef/dev-651fc2c9-e89c-4d4d-a0f6-a39abbc3e95f/assets/bundle-widget-full-page.css`
- CSS: `https://cdn.shopify.com/extensions/019fec98-da04-7ad4-8f45-5674ff2a77ef/dev-651fc2c9-e89c-4d4d-a0f6-a39abbc3e95f/assets/bundle-widget-full-page-mobile-summary.css`
- CSS, final Compact fixture: `https://cdn.shopify.com/extensions/019fec98-da04-7ad4-8f45-5674ff2a77ef/dev-651fc2c9-e89c-4d4d-a0f6-a39abbc3e95f/assets/bundle-widget-full-page-compact.css`

### PPB

- JavaScript: `https://cdn.shopify.com/extensions/019fec98-da04-7ad4-8f45-5674ff2a77ef/dev-651fc2c9-e89c-4d4d-a0f6-a39abbc3e95f/assets/bundle-widget-product-page-bundled.js`
- JavaScript: `https://cdn.shopify.com/extensions/019fec98-da04-7ad4-8f45-5674ff2a77ef/dev-651fc2c9-e89c-4d4d-a0f6-a39abbc3e95f/assets/bundle-app-embed.js`
- CSS: `https://cdn.shopify.com/extensions/019fec98-da04-7ad4-8f45-5674ff2a77ef/dev-651fc2c9-e89c-4d4d-a0f6-a39abbc3e95f/assets/bundle-widget.css`
- CSS, final Vertical Slots fixture: `https://cdn.shopify.com/extensions/019fec98-da04-7ad4-8f45-5674ff2a77ef/dev-651fc2c9-e89c-4d4d-a0f6-a39abbc3e95f/assets/bundle-widget-product-page-modal.css`

## Template Matrix

| Template ID | Fixture | States exercised | Desktop | Mobile | Console / network | Result |
|---|---|---|---|---|---|---|
| `fpb-standard` | FPB matrix and stress fixtures | empty, selection, quantity, summary, progress, discount, validation | `1440x900` | `390x844` | No runtime errors in final pass | Approved |
| `fpb-classic` | FPB matrix and stress fixtures | empty, selection, quantity, summary, progress, discount, validation | `1440x900` | `390x844` | No runtime errors in matrix pass | Approved |
| `fpb-compact` | `cmse8sp170000v0ytaqqzsvtw` | loading, empty, selection, quantity, summary, progress, discount, validation | `1440x900` | `390x844` | No runtime errors; no horizontal overflow | Approved |
| `fpb-horizontal` | FPB matrix and stress fixtures | empty, selection, quantity, summary, progress, discount, validation | `1440x900` | `390x844` | No runtime errors in matrix pass | Approved |
| `ppb-product-list` | `cmsn92il60000v01nm6adcjx5` | empty, selected, quantity, footer, validation | `1440x900` | `390x844` | No runtime errors in matrix pass | Approved |
| `ppb-product-grid` | `cmsn92il60000v01nm6adcjx5` | empty, selected, quantity, footer, validation | `1440x900` | `390x844` | No runtime errors in matrix pass | Approved |
| `ppb-horizontal-slots` | `cmsn92il60000v01nm6adcjx5` | empty slots, drawer, selected slot, remove, footer | `1440x900` | `390x844` | No runtime errors in matrix pass | Approved |
| `ppb-vertical-slots` | `cmsn92il60000v01nm6adcjx5` | empty slots, drawer, selected slot, remove, footer, recoverable error | `1440x900` | `390x844` | Fresh 6.0.8 preview initialized with no console errors or overflow | Approved |

Template-specific matrix evidence was captured before the final `6.0.9` patch bump. The final bump changes the shared FPB bootstrap lifecycle and generated version banners. Compact FPB was rerun across both viewports because it exercises the changed shared FPB boundary; Vertical Slots PPB was refreshed after the shared bundle regeneration to prove the unchanged PPB bundle still initializes.

## State Registry Evidence

| State ID | Direct evidence | Result |
|---|---|---|
| `fpb-summary-mode` | Desktop sidebar and mobile summary tray reflected selected quantity, savings, total, and CTA state. | Approved |
| `fpb-selection-flow` | Product add, quantity increase/decrease, and remove actions updated cards and summary. Controls met the 44px target. | Approved |
| `fpb-skeleton-loading` | Cache-cleared refresh showed four responsive card placeholders plus summary geometry before readiness on desktop and mobile. The skeleton moved into the widget root with `aria-busy="true"`, the generic bootstrap spinner was absent, and the skeleton was removed with `aria-busy="false"` after `data-initialized="true"`. | Approved |
| `fpb-validation-messaging` | Empty submission displayed `Please select products before adding to cart`. | Approved |
| `fpb-discount-messaging` | Selection updated the active tier and displayed the next-tier message and applied percentage. | Approved |
| `fpb-mobile-slot-rendering` | Mobile product cards, quantity controls, selected products, and summary tray rendered without horizontal overflow. | Approved |
| `fpb-sidebar-progress` | Desktop summary displayed current and next tiers, progress, slots, total, and enabled/disabled CTA transitions. | Approved |
| `ppb-template-selection` | Admin selection produced fresh Product List, Product Grid, Horizontal Slots, and Vertical Slots previews. | Approved |
| `ppb-inpage-vs-modal-mode` | Product List/Grid rendered in-page; Horizontal/Vertical Slots opened the product drawer. | Approved |
| `ppb-slot-orientation` | Horizontal and vertical slot shells rendered their distinct empty and filled row geometry on both viewports. | Approved |
| `ppb-selection-drawer-state` | Drawer opened as a dialog, locked body scroll, exposed products, committed selection, restored scroll, and filled the slot. | Approved |
| `ppb-footer-messaging` | Empty, selected, total, count, and CTA states updated after selection and removal. | Approved |
| `ppb-error-feedback` | A request-level product hydration failure displayed a recoverable error message and `Retry` action while preserving dialog structure. | Approved |

## Accessibility Assertions

- Selected PPB cards synchronized `aria-label` and `aria-pressed` state.
- PPB drawers exposed `role="dialog"`, a named close control, focus entry, and body-scroll locking.
- Product actions, quantity controls, remove controls, and primary CTAs met the 44px interaction target in measured states.
- The FPB bootstrap skeleton uses `aria-hidden="true"`; the widget root exposes `aria-busy="true"` during loading and clears it after initialization.
- Desktop and mobile final states had no horizontal document overflow.

## Interaction and Failure Coverage

- Added, incremented, decremented, and removed products.
- Opened and closed modal selection drawers.
- Committed modal selections with the primary action.
- Exercised optional PPB step behavior without forcing a selection.
- Exercised empty-submit validation and discount-tier transitions.
- Exercised request-level PPB product-loading failure and recovery affordance.
- Cleared Cache Storage before final FPB and PPB refreshes; no server restart was used.

## Automated Evidence

- `tests/unit/routes/fpb-proxy-page.test.ts`: proxy marker, skeleton cardinality, escaping, status, signature, and preview authorization.
- `tests/unit/assets/fpb-bootstrap-skeleton-handoff.test.ts`: required skeleton transfer, fail-fast missing-markup behavior, and render-boundary cleanup.
- Focused final result: 11 tests passed.
- Full repository run: 1,919 tests passed across unit, integration, and end-to-end suites with zero failures.
- `npm run build:widgets`: passed for full-page, product-page, SDK, and app embed bundles.
- `npm run minify:assets css`: passed all Shopify asset-size limits.
- Modified-file ESLint: zero errors.
