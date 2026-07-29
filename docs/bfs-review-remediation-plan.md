---
schema_version: 1
id: bfs-review-remediation-plan-2026-07-29
title: Built for Shopify Review Remediation Plan
type: implementation-plan
status: active
summary: Decision-complete implementation plan for the July 2026 Built for Shopify review findings.
last_audited: 2026-07-29
owners:
  - engineering
domains:
  - admin
  - onboarding
  - storefront
systems:
  - Shopify Admin
  - App Bridge
  - Theme App Extensions
source_paths:
  - app/routes/app/app.onboarding.tsx
  - app/routes/app/app.dashboard/DashboardPage.tsx
  - app/routes/app/app.settings/SettingsRoute.tsx
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
  - internal docs/Operations/Admin Performance.md
  - internal docs/Shopify Integration/Theme App Extensions.md
tags:
  - built-for-shopify
  - review-remediation
  - polaris
keywords:
  - onboarding
  - app-extensions
  - live-preview
  - contextual-save-bar
---

# Built for Shopify Review Remediation Plan

## Summary

All supplied reviewer references were accessible. The implementation will use Polaris web components and App Bridge as the source of Shopify-owned state.

The Shopify GraphiQL App visible in the recordings is reviewer-store tooling for exploring Admin API data. It is not a Wolfpack dependency. The right-edge timing tab is a Shopify/reviewer performance HUD; its exact metric labels are not visible, so it will not be recreated. Wolfpack will use the existing App Bridge Web Vitals integration and route-local diagnostic mode instead.

## Implementation

1. Redesign onboarding with `s-page`, `s-section`, `s-grid`, `s-clickable`, `s-stack`, `s-heading`, `s-text`, `s-badge`, `s-button`, and `s-icon`. Present selectable Product-page and Full-page choices, remove the custom hero/emoji/pill treatment, and route directly to `/app/bundles/create?bundleType=product_page|full_page`. Validate the query and preselect the create route’s type. Replace the stacked instructional banners with a concise expandable setup guide and quiet support actions.
2. Replace merchant-facing theme status checks with one `shopify.app.extensions()` normalizer covering the app embed, full-page block, product-page block, upsell block, and upsell button. Use explicit loading/error states, refresh before preview, and refresh after returning from Theme Editor. Gate Full-page preview on the app embed and Product-page preview on product block placement. Remove the old status fallback route after consumers migrate.
3. Add a compact homepage Polaris grid with an Active bundles metric and a Storefront setup status surface. The latter prominently shows app-embed status and a disclosure of all five extension statuses, with one contextual Theme Editor action. Keep the existing support cards below it and stack the grid on mobile.
4. Make the outer Settings route the sole landing owner, reuse one card definition, and remove the child landing implementation. Render Language navigation as a desktop sidebar and expandable mobile disclosure backed by one state model. Route every Settings subview transition through `shopify.saveBar.leaveConfirmation()`. Replace guided-tour placement with measured, clamped viewport placement and edge-safe scrolling.
5. Replace static upsell screenshots in FPB and PPB editors with one local `UpsellWidgetLivePreview` driven by unsaved mode, image, title, description, and button text. Keep preview and controls side-by-side on desktop and stacked on mobile. Use Polaris controls for modified Admin fields.
6. Remove adjacent banners from touched surfaces. Status and guidance become cards/sections; retain at most one warning when an action is blocked.

## Contracts and docs

- Add normalized theme-extension and upsell-preview model types; no Prisma or public API migration.
- Create `test-spec/bfs-review-remediation.spec.md` before implementation.
- Update `docs/app-nav-map/APP_NAVIGATION_MAP.md`, the Theme App Extensions architecture note, and Admin Performance documentation.
- Rebuild Graphify after code changes and include impact analysis in the eventual commit/PR.

## Verification

- Add behavior tests for onboarding handoff, extension normalization and preview gates, homepage metric/status data, Settings landing and save-bar behavior, tour placement, and live-preview state updates. Do not test CSS, class names, source order, or visual placement in Jest.
- Run focused Jest, ESLint on modified files, the production build, `git diff --check`, and `npm run graphify:rebuild`.
- In SIT, hard-reload and verify desktop plus 390×844 mobile for every reviewer flow. Use `?wpbWebVitalsDebug=1`, clear samples, and collect repeated route loads. Require local LCP p75 ≤ 2.5s and CLS ≤ 0.1; inspect INP during interactive flows. Remove any temporary cross-origin debug bridge before shipping.
- Preserve unrelated dirty storefront changes. Deployment remains manual.
