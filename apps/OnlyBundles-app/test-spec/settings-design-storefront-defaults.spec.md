---
schema_version: 1
id: settings-design-storefront-defaults
title: Settings Design Storefront Defaults
type: test-spec
status: active
summary: Verifies shared Admin and storefront color resolution across explicit overrides, Shop Brand pairs, and template defaults.
last_audited: 2026-08-23
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - product-page-bundle-widget
  - settings-design
source_paths:
  - app/routes/api/api.design-settings.$shopDomain.tsx
  - app/lib/shop-brand-colors.ts
  - app/lib/settings-design-runtime.ts
  - app/services/theme-colors.server.ts
related_docs:
  - internal docs/EB Settings Design Reference.md
  - internal docs/Shopify Integration/Storefront API.md
tags:
  - ppb
  - design-settings
  - shop-brand
keywords:
  - G32
  - storefront defaults
  - inheritedColorFieldKeys
---

# Test Spec: Settings Design Storefront Defaults
**Spec ID:** settings-design-storefront-defaults  **Created:** 2026-07-15

## Purpose

Pin the shared Design color resolver and Storefront API Brand query so Admin
previews and storefront widgets use the same explicit override, Shop Brand, and
canonical template-default precedence without stale cache fallback.

## Test Cases

### DesignSettingsApiFallback

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Product Page fallback corner defaults | No persisted design settings row | Product card radius `10`, product image radius `8`, product-card button radius `5` | Matches EB runtime Product Grid `appearanceSettings` captured on 2026-07-15 |
| 2 | Parse first Brand pairs | Multiple primary and secondary groups | First valid background/foreground pair from each list is selected | Ordered Storefront API contract |
| 3 | Reject malformed Brand payload | Missing, empty, or invalid pair values | No Shop Brand colors are returned | Template defaults remain authoritative |
| 4 | Brand query failure | Storefront request fails | Existing cached pair is cleared | Stale colors are not reused |
| 5 | New Design state | No saved Design payload | Every color field begins inherited | Shop Brand resolution is visible immediately |
| 6 | Existing Design state | Saved payload has no inherited-key list | Saved colors remain explicit | Existing merchant choices are preserved |
| 7 | Resolution precedence | Explicit value, Brand pair, template default | First available source wins in that order | Shared pure resolver |
| 8 | Semantic mapping | FPB and PPB runtime output | Primary pair owns actions/active/completed/filled roles; secondary pair owns shells/empty/inactive roles | Foregrounds follow their background pair |
| 9 | Save inheritance | Payload contains inherited keys | Both DesignSettings rows retain the inheritance metadata and resolved runtime | No Prisma migration |
| 10 | Storefront CSS | Cached pair shape and saved inheritance metadata | CSS is generated from the shared resolved runtime | Old flat cache shape is ignored |

## Acceptance Criteria

- [ ] Test fails before the fallback default change.
- [ ] Test passes after implementation.
- [ ] CSS-only deploy is not run; hard reload verifies any storefront behavior change.
