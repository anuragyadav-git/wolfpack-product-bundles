---
schema_version: 1
id: fpb-floating-promo-badge-help
title: FPB Floating Promo Badge Help
type: test-spec
status: active
summary: Verifies that FPB configuration explains the storefront floating promo badge with native visual help.
last_audited: 2026-09-11
owners:
  - engineering
domains:
  - admin-ui
  - storefront
systems:
  - bundle-configure
  - widget-runtime
source_paths:
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ImagesGifsPanel.tsx
  - app/routes/app/_shared/bundle-configure/ConfigureHelpPopover.tsx
  - app/constants/help-tooltips.ts
  - app/assets/widgets/full-page/methods/tier-floating-runtime-methods.ts
  - app/assets/widgets/full-page-css/base/floating-badge-sidebar-progress.css
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - tdd
  - fpb
  - visual-help
keywords:
  - floatingPromoBadge
  - s-popover
  - storefront-depiction
---

# Test Spec: FPB Floating Promo Badge Help

**Spec ID:** fpb-floating-promo-badge-help  **Created:** 2026-09-11

## Purpose

Help merchants understand the FPB floating promo badge before enabling it by
showing an accurate storefront depiction through Shopify's native contextual
help pattern.

## Test Cases

### FloatingPromoBadgeHelp

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | View Floating Promo Badge configuration | Open FPB Images & GIFs | An accessible info action is available beside the feature title | Does not alter draft state |
| 2 | Open visual help | Activate the info action | A Polaris popover shows localized explanatory copy and the canonical storefront depiction | Shopify owns focus, dismissal, and positioning |
| 3 | Revisit the help surface | Render the shared help catalog | The visual asset has a durable optimized source and localized alternative text | No hardcoded fallback copy |
| 4 | View the badge on desktop | Load an enabled FPB at a desktop viewport | The badge retains its bottom-left floating placement without affecting bundle layout | Verify after a cache-bypassing reload |
| 5 | View the badge above the mobile dock | Load an enabled FPB at a mobile viewport | The badge clears the complete sticky summary dock with a consistent gap | Includes safe-area padding |
| 6 | Resize across the summary breakpoint | Resize between desktop and mobile presentation modes | The badge follows the visible summary presentation without a reload | CSS consumes the existing summary-mode state |
| 7 | Dismiss the badge | Activate the badge dismiss control | The badge is removed and its session dismissal is saved | No custom overlay lifecycle |

## Acceptance Criteria

- [x] The FPB Floating Promo Badge header exposes one native info action.
- [x] Activating it opens an `s-popover` rather than a modal or custom overlay.
- [x] The popover depicts the actual bottom-left storefront badge, including merchant text and the dismiss control.
- [x] Opening or closing help does not mark the configure route dirty.
- [ ] The mobile badge never overlaps the visible summary dock.
- [ ] The desktop badge keeps its established bottom-left placement.
- [x] Responsive placement is owned by CSS and the existing summary-mode state.
- [ ] Focused tests, typecheck, modified-file ESLint, build, diff check, Graphify, and Agent-store Chrome QA pass.
