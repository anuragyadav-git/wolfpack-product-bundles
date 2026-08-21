---
schema_version: 1
id: settings-controls-runtime-parity
title: "Test Spec: Settings Controls Runtime Parity"
type: test-spec
status: active
summary: Verifies the versioned Settings Controls contract from Admin persistence through storefront consumers.
last_audited: 2026-08-21
owners:
  - wolfpack-product-bundles
domains:
  - settings
systems:
  - admin
  - storefront
source_paths:
  - app/lib/settings-controls-runtime.ts
  - app/lib/admin-configuration-surfaces.ts
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - tdd
  - parity
keywords:
  - settings-controls
---

# Test Spec: Settings Controls Runtime Parity

**Spec ID:** settings-controls-runtime-parity  **Created:** 2026-08-21

## Purpose

Ensure Controls uses stable field keys and one versioned runtime contract for Landing Page, Product Page, shared cart messaging, CSS, scripts, selectors, and supported checkout/cart providers.

## Test Cases

### SettingsControlsRuntime

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Stable-key mapping | Flat Admin values keyed by contract path | Schema version 1 runtime is built without reading labels | Labels remain presentation-only |
| 2 | Shared cart messaging | Bundle items, original price, and discount controls | One shared messaging object includes all supported flags | Used by FPB and PPB |
| 3 | CSS scope separation | Builder, dummy-product, theme, and PPB CSS | Widget CSS contains only its owned scope; theme CSS remains global | Prevents scope leakage |
| 4 | Provider normalization | Every documented provider label or ID | Stable provider ID and callback metadata | Unknown values resolve to Shopify |
| 5 | Product controls | Visible Product Page toggles | Visible values map to runtime behavior | No hidden aliases |
| 6 | Deferred feature exclusion | Controls registry | Advanced video-player settings are absent | Video messaging is a separate feature |

### StorefrontRuntime

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 7 | Controls endpoint | Valid shop and bundle type | Versioned settings and active layout are returned | Database failures are non-2xx |
| 8 | Custom code isolation | Merchant CSS or JS throws | Remaining storefront initialization continues | Never execute merchant code in Admin |
| 9 | Cart transform projection | Messaging enabled | Items, retail, and savings metadata are projected | Paid add-ons remain separate lines |
| 10 | Quoted select labels | Discount-format labels containing quotation marks | Polaris receives selector-safe option values while the displayed and saved labels stay unchanged | Prevents the upgraded select from disappearing |
| 11 | Landing selector contract | EB JavaScript and selectors panel | Only Add to Cart and Buy now selectors are persisted | Button Selectors is a heading, not a field |
| 12 | Collection quick add | Product link or quick-add action for an active bundle parent | Customer is routed to the matching FPB or PPB bundle URL | Controlled independently per layout |
| 13 | Cart integration lifecycle | New configured cart-item markup appears | Merchant integration class is initialized for the new cart state | Mirrors EB re-initialization behavior |
| 14 | PPB page-load script | Product Page bundle initializes twice | Custom page script runs once and never runs after cart add | Page-load and redirect scripts remain separate |
| 15 | PPB card click | Non-interactive product-card surface is clicked | Existing Add action is activated when the toggle is enabled | Form controls and links remain independent |
| 16 | PPB theme refresh | Side-cart or cart-page section IDs and selectors are configured | Matching Shopify section markup is fetched and replaced before the post-add action | Missing configuration remains a safe no-op |
| 17 | FPB image and review integrations | Irrelevant variant images or Judge.me are enabled | Variant media is filtered and each Judge.me badge is fetched from the current widget API by external Shopify product ID | One product request failing does not block cards or successful badges |

## Acceptance Criteria

- [x] Red behavior tests fail before implementation.
- [x] Focused unit, route, widget, and Rust tests pass after implementation.
- [x] Modified raw widget sources pass `node --check` and generated assets are rebuilt.
- [x] Modified files have zero ESLint errors and the knowledge graph is rebuilt.
- [x] Direct Chrome DevTools verification covers Admin save/reload and desktop/mobile storefront behavior.
- [x] Judge.me is installed and configured on Agent; the live current-widget-API request and dynamic badge mount are verified.
