---
schema_version: 1
id: bundle-configure-translations
title: Bundle Configure Translations Test Specification
type: test-spec
status: active
summary: Defines behavioral coverage for shared FPB and PPB translation actions from Admin draft state through storefront locale resolution.
last_audited: 2026-08-25
owners:
  - Wolfpack Product Bundles
domains:
  - bundle-configuration
systems:
  - admin-configure
  - storefront-widgets
source_paths:
  - app/components/bundle-configure/MultiLanguageTextModal.tsx
  - app/lib/bundle-configure-loader.server.ts
  - app/lib/bundle-configure-translations.ts
  - app/assets/widgets/shared/localized-bundle-config.ts
  - shopify.app.toml
  - shopify.app.wolfpack-product-bundles-sit.toml
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - translations
  - tdd
keywords:
  - multi-language
  - locale-resolution
---

# Test Spec: Bundle Configure Translations
**Spec ID:** bundle-configure-translations  **Created:** 2026-08-25

## Purpose

Verify that FPB and PPB translation actions use one staged Polaris modal workflow, persist values through their canonical configuration owners, and resolve storefront copy from the active Shopify locale.

## Test Cases

### Translation Draft Helpers

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Empty values are removed | Locale maps containing blank and non-blank fields | Blank fields and empty locale records are pruned | Blank means use base copy |
| 2 | Existing input is not mutated | A locale map passed to the normalizer | A distinct normalized object is returned | Protects route-owned state |

### Storefront Locale Resolution

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Exact locale wins | `fr-CA` with `fr-CA` and `fr` entries | `fr-CA` values overlay base values | Matching is case-insensitive |
| 2 | Base language is used | `fr-CA` with only `fr` | `fr` values overlay base values | Regional fallback |
| 3 | Base configuration is retained | Locale without an override | Base configured copy remains unchanged | No fabricated English fallback |
| 4 | Step and category copy is projected | Localized step/category maps | Runtime step/category names and titles are localized | Shared FPB/PPB path |
| 5 | Pricing display copy is projected | Localized rule, tier, and quantity-option maps | Runtime pricing maps contain localized entries | Existing renderers keep one read path |
| 6 | PPB add-on copy is projected | Localized add-on step and footer values | Add, replace, section, and footer copy is localized | Covers formerly disabled actions |
| 7 | SDK config is projected | SDK config with active Shopify locale | SDK state exposes localized values | Shares the widget projector |
| 8 | FPB Bundle Cart copy reaches the visible summary | Localized `yourBundle` and `reviewBundle` values | Desktop sidebar and mobile summary use the localized title and subtitle | Covers the canonical FPB public route |

### Shared Modal and Configure Wiring

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Published locale is selected | Published locales with one primary locale | Primary locale is initially active | No hardcoded locale catalogue |
| 2 | Apply commits staged changes | Edit a field and choose Apply | Owning route state updates once and SaveBar becomes dirty | No network request from modal |
| 3 | Closing discards staged changes | Edit then Cancel, Escape, or backdrop-close | Owning route state remains unchanged | Polaris modal lifecycle |
| 4 | Feature gate disables action | Disabled parent feature or no locales | Translation action cannot open | Behavioral assertion only |
| 5 | Every configured target maps to one owner | Open each FPB and PPB translation action | Correct fields and existing values appear | Includes pricing, add-ons, embed, and subscriptions |

### Shopify Locale Access

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | App requests locale access | Production and SIT app configurations | Both declare `read_locales` | Required by Shopify `shopLocales` |
| 2 | Published locales load | Shopify returns published and unpublished locales | Loader returns only published locales and keeps the primary marker | Single official source |
| 3 | Shopify returns GraphQL errors | `shopLocales` response contains errors | Loader reports the failure and returns no locales | Prevents silent diagnosis loss |

### Persistence and Runtime Integration

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | FPB save and reload | Translations across every FPB owner | Values round-trip through the save action | Existing JSON columns |
| 2 | PPB save and reload | Translations including add-on and embed fields | Values round-trip through the save action | Adds missing serializer fields |
| 3 | Storefront config sync | Saved translated bundle | Metafield/public config contains each canonical translation map | No duplicate widget owner |

## Acceptance Criteria

- [x] Tests are written before their corresponding implementation.
- [x] All listed behavioral cases pass for FPB and PPB.
- [x] No test asserts CSS, class names, visual placement, or source ordering.
- [x] Focused tests, TypeScript, ESLint, widget builds, and Graphify pass.
- [x] Embedded Admin Chrome verification confirms the Polaris modal lifecycle without a stuck outer overlay.
- [x] A translated storefront rendering is captured from an agent-store fixture that mounts the relevant FPB or PPB surface.

The agent-store Admin round trip confirmed locale loading, modal editing,
canonical save payloads, reloading, and fixture restoration without a deploy.
The canonical FPB app-proxy route `/apps/product-bundles/wpb/2` mounted widget
version `15.0.0` after a cache-cleared hard reload. Direct Chrome verification
captured the translated Bundle Cart subtitle in the desktop summary at
1280x800 and the expanded mobile summary at 390x844, then confirmed the base
copy returned after the temporary translation fixture was restored.
