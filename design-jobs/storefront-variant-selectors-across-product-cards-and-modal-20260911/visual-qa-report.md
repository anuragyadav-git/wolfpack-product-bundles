---
schema_version: 1
id: storefront-variant-selectors-visual-qa
title: Storefront Variant Selectors Visual QA Report
type: design-job-qa-report
status: active
summary: Records semantic visual review of FPB cards with adjacent no-variant and two-dimensional selector products.
last_audited: 2026-09-14
owners:
  - Aditya Awasthi
domains:
  - visual-testing
systems:
  - only-bundles-storefront
source_paths:
  - apps/OnlyBundles-app/app/assets/widgets/full-page-css/shared/responsive-layout.css
related_docs:
  - design-jobs/storefront-variant-selectors-across-product-cards-and-modal-20260911/browser-test-report.md
  - internal docs/Architecture/Product Card Layout Contract.md
tags:
  - fpb
  - visual-qa
keywords:
  - mixed-card-row
  - two-dimensional-variants
---

# Visual QA Report

Artifact job ID: storefront-variant-selectors-across-product-cards-and-modal-20260911
Artifact revision: 4
Artifact status: complete

## Semantic review

| Region | Reference | Actual | Difference | Severity | Measured evidence | Canonical owner | Required fix |
|---|---|---|---|---|---|---|---|
| Standard mixed row | Same-size cards with stable internal tracks | Equal 543.34px desktop cards and equal 513.16px mobile cards | None after remediation | ACCEPTED | Zero card and page overflow; Size and Color both start at x 53.19 on mobile | Shared FPB responsive layout | None |
| Classic mixed row | Same-size cards with stable internal tracks | Equal 545.77px desktop cards and equal 524.16px mobile cards | None after remediation | ACCEPTED | Size and Color both start at x 30.19 on mobile; zero overflow | Shared FPB responsive layout | None |
| Compact mixed row | Same-size cards with stable internal tracks | Equal 548.11px desktop cards and equal 576.95px mobile cards | None after remediation | ACCEPTED | Size and Color both start at x 204.50 on the second mobile card; zero overflow | Shared FPB responsive layout | None |
| Horizontal mixed row | Side-by-side media and content with selectors using the full content column | Equal 326.23px desktop cards and equal 313.75px mobile cards | None after remediation | ACCEPTED | Size and Color both start at x 131.38 on mobile; zero overflow | Shared FPB responsive layout | None |
| Two-dimensional controls | One visual Size dimension plus compact secondary Color control | Seven Size pills wrap intrinsically; labeled Color select occupies the remaining row without clipping | None | ACCEPTED | 44px control targets; all values directly reachable | Shared variant selector | None |
| No-variant neighbor | Empty selector space must not pull media/title/price/action out of alignment | Empty stable selector region absorbs the row difference while the card height matches its two-dimensional neighbor | None | ACCEPTED | Equal card heights in all eight executed template/viewport combinations | Shared product card and FPB responsive layout | None |
| Selector reading order | Configured selectors must precede price and action in matching semantic and visual order | Every template reports selector before price before action in the DOM; price and action render below the selector region | None | ACCEPTED | Direct DOM position and geometry reads across desktop and mobile | Shared product-card renderer | None |
| Variant update | Exact variant must change media and amount without resizing the card | Navy image and `$30.00` render while Horizontal retains stable geometry | None | ACCEPTED | Direct interaction and post-action geometry read | Existing delegated variant owner | None |
| Sticky mobile footer | Selector content must not cover or displace footer actions | Footer remains reachable below both Horizontal cards at 390px | None | ACCEPTED | Viewport screenshot and zero document overflow | Existing FPB mobile summary owner | None |
| Mobile viewport | Required real Chrome window must exercise the 390px breakpoint | All four templates ran at `innerWidth: 390` without emulation | None | ACCEPTED | Measured 390px width; browser chrome yielded 787px to 831px inner heights | Chrome host/window | None |

## Remediation completed

- Added shared content-driven grid tracks so media, identity, price, selector, and action keep stable origins when sibling cards have different variant complexity.
- Gave Classic and Compact dividers explicit ownership instead of allowing an implicit grid row to shift card content.
- Defined explicit price/action columns and made selector rows span the full content width, eliminating the narrow implicit selector column.
- Made selector, price, and action ownership canonical in both DOM and visual order: selector first, price second, action third.
- Aligned every mobile option group to the selector region's inline edge, so Color starts exactly where Size starts.
- Kept no-variant selector space present but visually empty so adjacent cards remain equal without moving their internal content.
- Retained each template's card anatomy and responsive rules; no absolute positioning, fixed card height, `!important`, runtime style injection, or hidden option rail was introduced.

## Baseline and comparison status

Direct semantic and measured geometry review passes for the executed FPB cases at desktop and a real 390px Chrome width. No persisted PNG diff is claimed because investigation screenshots were intentionally kept out of the repository. Broader PPB and modal coverage remains in the active design job.

## Resolved minimum-desktop remediation

| Region | Reference | Actual | Difference | Severity | Measured evidence | Canonical owner | Required fix |
|---|---|---|---|---|---|---|---|
| PPB Vertical Slots picker at 1280×800 | Product cards and Add to Cart actions are fully visible on initial open above the normal-flow footer | Equal 428.28px cards end at y=692.28 and both CTAs end at y=679.28 before the y=696 body/footer boundary | None after remediation | ACCEPTED | Cards retain a 3.72px boundary gap; CTAs retain 16.72px; zero overflow | Shared PPB bottom-sheet header/body/footer layout | None |

The genuine 500×844 narrow-window rerun also passed: equal 473.47px cards, fully visible 44px actions, zero overflow, and stable `M / Navy` selection with the expected Navy image and `$30.00` amount. Exact 390px PPB evidence remains constrained by the host Chrome minimum width and is not claimed.
