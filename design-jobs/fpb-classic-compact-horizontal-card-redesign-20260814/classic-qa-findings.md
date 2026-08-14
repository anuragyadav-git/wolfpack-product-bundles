---
schema_version: 1
id: fpb-classic-card-redesign-qa-findings
title: FPB Classic Card Redesign QA Findings
type: visual-qa-findings
status: complete
summary: Records the verified Classic card geometry, interaction, responsive, and frozen-Standard regression evidence.
last_audited: 2026-08-14
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - bundle-widgets
source_paths:
  - app/assets/widgets/full-page-css/templates/classic/desktop-products.css
  - app/assets/widgets/full-page-css/templates/classic/mobile.css
  - extensions/bundle-builder/assets/bundle-widget-full-page-classic.css
related_docs:
  - design-jobs/fpb-classic-compact-horizontal-card-redesign-20260814/implementation-handoff.md
  - docs/competitor-analysis/fpb-classic-agentic-parity/SPEC.md
tags:
  - fpb
  - classic
  - visual-qa
keywords:
  - Classic cards
  - responsive grid
  - live asset refresh
---

# FPB Classic Card Redesign QA Findings

## Result

The CL-A Framed Classic source slice is implemented and the restarted SIT preview now serves its rebuilt generated CSS. Direct Chrome DevTools MCP verification passed at all five target widths, including interaction geometry and frozen-Standard desktop/mobile smoke checks. Accessibility and performance findings are recorded as scoped shared-owner waivers because this slice cannot modify the frozen shared renderer, summary, theme, or loading runtime.

Raw screenshots remain outside the repository at `/private/tmp/fpb-classic-compact-horizontal-card-redesign-20260814/qa/`.

## Authoritative live generated-CSS evidence

After the user restarted the SIT dev server, Cache Storage was cleared and the storefront was reloaded with cache bypass. Classic stylesheet request 11177 returned HTTP 200 and contained the rebuilt frame, title clamp, and focus declarations. No temporary QA style remained active.

| Viewport | Grid tracks | Card heights | Control containment | Page overflow |
|---|---|---|---|---|
| 1440x900 | 4 equal columns | 363.016px across the first row | Passed | None |
| 1280x800 | 4 equal columns | 337.578px across the first row | Passed | None |
| 768x1024 | 2 equal columns | 283.797px across the first two rows | Passed | None |
| 390x844 | 2 equal columns | 274px across the first two rows | Passed | None |
| 360x800 | 2 equal columns | 274px across the first two rows | Passed | None |

- Default cards use a one-pixel token-owned frame, two-line reserved title track, and aligned price/action row.
- Hover produced zero card geometry delta at 1440x900.
- Add-to-selected and quantity one-to-two transitions produced zero outer-card height delta at 360x800.
- Add, remove, and increase controls remained 44px and fully inside the card.
- Keyboard focus on the card root now renders a two-pixel token-owned outline with a two-pixel offset at desktop and mobile container widths.
- The desktop summary and mobile summary tray remained structurally present and visually unchanged in the captured default and selected states.
- Current console output contains no new app-owned error. Current widget, configuration, language, controls, and product requests returned HTTP 200.

## Fixture limitations

The active Wolfpack bundle exposes four default-variant, regular-price products. It does not expose sale, grouped variant, unavailable, disabled, or timeline states. The previously documented rich storefront route still renders cached Standard data, but its Admin configure route returns 404, so it cannot be safely transitioned through the required UI. No product-data or backend shortcut was used.

## Shared-owner findings

Lighthouse accessibility scored 88 on desktop and 95 on mobile. Findings belong to frozen owners: shared product-card semantics and accessible naming, shared desktop-summary contrast, and theme list markup. They are recorded as `WAIVER-CL-A11Y-SHARED` for separate remediation.

The desktop performance trace measured LCP 7034ms and CLS 0.6949 during delayed shared widget hydration. Chrome identified no direct layout-shift root cause. Shared loading/runtime is outside Classic preset CSS and is recorded as `WAIVER-CL-PERF-SHARED`.

Frozen Standard was selected through the Admin UI, cache-bypassed, and smoke-tested at desktop and mobile. It loaded only Standard CSS, retained three desktop columns and one mobile column, and showed no overflow. The fixture was restored to Classic and reverified.
