---
schema_version: 1
id: ppb-bundle-picker-modal-redesign-browser-report
title: PPB Bundle Picker Modal Browser Test Report
type: browser-test-report
status: draft
summary: Records revision-8 exact EB Vertical filled-row evidence and the missing persisted Vertical SIT fixture blocking full formal Chrome QA.
last_audited: 2026-08-21
owners:
  - Aditya Awasthi
domains:
  - storefront-qa
systems:
  - ppb-product-page-widget
source_paths:
  - app/assets/widgets/product-page
related_docs:
  - design-jobs/ppb-bundle-picker-modal-redesign-20260821/qa/preflight.json
tags:
  - ppb
  - chrome
keywords:
  - horizontal-slots
  - vertical-slots
---

# Browser Test Report

Artifact job ID: ppb-bundle-picker-modal-redesign-20260821
Artifact revision: 8
Artifact status: draft

## Revision 8 exact EB Vertical filled-row result

Direct Chrome re-audited the live EB Vertical filled row at desktop and mobile, then verified the served WPB `14.1.2` implementation after clearing Cache Storage and performing cache-ignored hard reloads. With the real Vertical container contract applied, WPB measured 358 by 64 pixels at 390 by 844, with a 50 by 50 image, 16px/700 natural title, inline 20 by 22 remove control, content-driven height, and zero horizontal overflow. The two-pixel outer-width difference from EB's 360-pixel row is the host theme gutter; internal offsets match the EB row. A long-title stress pass grew the row to 94 pixels and kept the complete name visible with no overflow.

The persisted SIT fixture remains configured as Horizontal Slots. Its hard-reloaded regression retained the Horizontal grid card, bounded tile, and independent removal behavior at desktop and mobile. Product Grid also retained equal-height two-column mobile cards and zero horizontal overflow. The Vertical source behavior is covered by the focused behavior test, but a transient DOM contract switch is not accepted as persisted end-to-end evidence. Formal Vertical execution therefore remains blocked until a valid persisted Vertical Slots fixture is available; no Admin or production fixture was mutated.

Current automated gates pass: 2171 repository tests, repository typecheck, scoped ESLint with zero errors, widget build, CSS minification and asset-size checks, generated JavaScript syntax checks, Graphify rebuild, design-job validation, handoff validation, and `git diff --check`.

## Revision 6 preflight result

Implementation returned with the filled-slot cap, complete accessible product name, overlaid cross badge, full-width quantity control, and exact-trigger focus remediation. Direct Chrome confirmed the slot geometry at all five required viewports, the 44 by 44 cross target, no title collision, zero horizontal overflow, served widget version 14.0.0, one remove-all mutation, and same-index empty-slot focus recovery.

Formal execution is blocked. After the final JavaScript and CSS rebuild, repeated cache-ignored reloads returned HTTP 500 from the SIT bundle, controls, language, and upsell app-proxy endpoints, preventing the widget from initializing. Direct Chrome also returned inline PNG evidence but denied new persistent screenshot writes under its current workspace-root policy. No server restart, deploy, or fixture mutation was attempted.

The latest local gates are 48 PPB suites and 263 tests passed, widget build passed at product-page 242441 B, CSS minification passed, scoped ESLint has zero errors, generated JavaScript syntax checks passed, Graphify rebuilt, and `git diff --check` passed. Repository-wide typecheck still fails on the branch's existing strictness backlog.

## Revision 5 predecessor note

Implementation has not returned. Required direct Chrome coverage is the complete Horizontal/Vertical five-viewport matrix with a long selected title, visible localized 44px outlined Remove action, one removal mutation, same-index focus recovery, no replacement opening, and zero overflow. Revision-4 evidence below remains predecessor evidence only.

## Environment

- Direct Chrome DevTools, authenticated default profile, no isolated context or substitute automation.
- Fixture: `https://agent-5sfidg3m.myshopify.com/products/ppb-mobile-modal-qa-2026-08-20` with deterministic tab-local response adapters for non-mutating state coverage.
- Served widget: `14.0.0`.
- Cache Storage was cleared when available; every accepted pass used a cache-ignored hard reload.
- No development server, deployment, Admin fixture, or production fixture was started, restarted, or mutated.

## Responsive matrix

| Template | 1440x900 | 1280x800 | 768x1024 | 390x844 | 360x800 | Result |
|---|---|---|---|---|---|---|
| Horizontal Slots | 5 columns | 4 columns | 2 columns | 2 columns | 2 columns | pass |
| Vertical Slots | 5 columns | 4 columns | 2 columns | 2 columns | 2 columns | pass |
| Product List | regression pass | regression pass | regression pass | regression pass | regression pass | pass |
| Product Grid | regression pass | regression pass | regression pass | regression pass | regression pass | pass |

Horizontal and Vertical used an exact 85dvh picker at every viewport. Header and footer remained fixed, the catalog alone scrolled, sparse desktop rows preserved intended track widths, and every pass had zero horizontal overflow. Screenshots are stored under `qa/screenshots/`.

## Interaction and state results

- Quantity Validation disabled: selection replaced Add with inline quantity controls.
- Validation enabled below maximum: increment remained operable without exceeding the configured maximum.
- Maximum one and maximum greater than one: controls transitioned to localized `Added xN`; one activation removed the full selected quantity.
- Quantity and Add share an equal footprint: 204x44 at 1440x900 and 143x44 at 390x844.
- Footer summary sizing passed at all five required viewports: 148.75x29 at 1440/1280/768, 130.56x32 at 390, and 122.45x32 at 360. Long count and price stress grew the pill to 189.19, 168.20, and 157.33 pixels respectively while remaining inside the footer with zero page overflow.
- Grouped variants: a native selector rendered on desktop and mobile; its mobile visual label was hidden while its accessible name remained. Variant selection updated identity, price, image, and availability without adding.
- Product details: only the image opened the sheet. Title and card background did nothing, while Add remained independent.
- Details Add and Update committed one selection to the originating slot; replacement did not duplicate; cancellation preserved variant and quantity.
- Stacked sheets: Escape, backdrop, and mobile swipe dismissed only the topmost sheet. Focus returned to the exact trigger, only the top layer trapped focus, and scroll lock remained until the last sheet closed.
- Invalid Done remained operable and produced a localized, body-owned, dismissible alert without covering the footer.
- Empty, restored, close/reopen, open-ended capacity, exact replacement, and failed-loading Retry states passed.
- Product List and Product Grid retained their existing quantity-card behavior.

## Accessibility, performance, console, and network

- Lighthouse desktop: Accessibility 95, Best Practices 100, SEO 100. Lighthouse mobile: Accessibility 93, Best Practices 100, SEO 100. Remaining findings are theme-owned heading order, a theme sticky cart control without a name, and Lighthouse's aggregate agent tree audit; no PPB-owned failure remains. Reports are stored under `qa/lighthouse/`.
- Trusted direct-Chrome picker opening: CLS 0.00 and INP 37 ms. The opacity-only card entrance removed the earlier synthetic trace shift.
- Final close-button retest produced no PPB-owned console warning. Remaining messages are the theme favicon 404 and Shopify/theme preload notices.
- All PPB widget assets and data endpoints completed successfully; the only failed request was `/favicon.ico` with 404.

## Automated release gates

- Focused and complete PPB/Product Page regression: 57 suites, 341 tests passed.
- Widget build: full-page 332653 B (88290 B gzip), product-page 241439 B (67541 B gzip), SDK 25005 B, embed 21336 B.
- CSS minification passed; `bundle-widget.css` is 92.7 KB and all generated CSS remains under Shopify's 100 KB limit.
- Generated JavaScript syntax checks, scoped ESLint, Graphify rebuild, and `git diff --check` passed.
- Repository-wide `npm run typecheck` remains non-green because the dirty branch has a broad pre-existing strictness backlog across unrelated storefront SDK, Admin, and test files. No scoped PPB regression or new ESLint error was found; this external repository baseline is not represented as a product QA pass or silently waived.

## Outcome

All revision-4 PPB design, behavior, responsive, accessibility, and direct-Chrome remediation gates passed. Formal final approval remains an explicit user gate.
