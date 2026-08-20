---
schema_version: 1
id: page-builder-integrations
title: Page Builder Integrations
type: test-spec
status: implemented
summary: Verifies provider-neutral page-builder bundle resolution, storefront mounting, and Admin catalog behavior.
last_audited: 2026-08-21
owners:
  - engineering
domains:
  - integrations
systems:
  - page-builder-embed
source_paths:
  - app/lib/page-builder-embed.ts
  - app/services/page-builder-embed.server.ts
  - app/routes/api/api.page-builder-embed[.]json.tsx
  - app/storefront/page-builder-embed.ts
related_docs:
  - internal docs/Features/Page Builder Integrations Guide.md
tags:
  - tdd
keywords:
  - page-builder-integrations
---

# Test Spec: Page Builder Integrations
**Spec ID:** page-builder-integrations  **Created:** 2026-08-21

## Purpose

Verify the provider-neutral GemPages, PageFly, and Shogun integration contract for eligible Product Page Bundles, direct Product Page Bundles, and direct Full Page Bundles.

## Test Cases

### PageBuilderEmbedRequest
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Direct PPB request | Product-page type, parent-product handle, locale | Normalized PPB request | Internal bundle IDs are not exposed |
| 2 | Direct FPB request | Full-page type, positive public number, locale | Normalized FPB request | Public number stays shop-scoped |
| 3 | Missing or invalid input | Missing locale, handle, or positive public number | Validation failure | No database lookup |

### PageBuilderEmbedResolution
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Resolve direct PPB | Signed shop and generated parent-product handle | Active or Unlisted PPB | Draft and cross-shop bundles excluded |
| 2 | Resolve direct FPB | Signed shop and public number | Active or Unlisted FPB plus loading settings | Existing public-number contract is reused |
| 3 | Unknown bundle | Valid request with no matching bundle | Null embed | No fallback bundle |

### PageBuilderEmbedRoute
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Authorized resolution | Valid signed app-proxy request | Canonical embed union | Private 30-second cache and ETag |
| 2 | ETag revalidation | Matching `If-None-Match` | 304 | No response body |
| 3 | Invalid signature or input | Invalid app-proxy signature or missing required field | 401 or 400 | Database is not queried |
| 4 | Server failure | Resolver error | 500 with null embed | No-store response |

### StorefrontRuntime
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Eligible-product marker | Page-builder marker on a product page | Existing PPB embed owns resolution | Marker acts as custom anchor |
| 2 | Direct marker | Direct PPB or FPB marker | Automatic PPB builder is suppressed | One primary builder per page |
| 3 | Multiple markers | More than one page-builder marker | First valid marker wins | No duplicate widgets or requests |
| 4 | Section reload | Previously resolved marker | Existing request/widget is reused | Idempotent reconciliation |
| 5 | Direct PPB | Preloaded PPB response | Product runtime initializes as embed source | Native product controls remain untouched |
| 6 | Direct FPB | Preloaded FPB response | Full-page runtime uses authoritative app-proxy payload | No second bundle request |

### AdminCatalog
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Page-builder inventory | Integration categories | PageFly, GemPages, and Shogun cards | Source constant owns inventory |
| 2 | Temporary setup destinations | Page-builder cards | `https://wolfpackapps.com` | Dedicated guides are a later docs change |

## Acceptance Criteria
- [x] All listed test cases pass
- [x] Existing PPB parent-product, PPB Bundle Embed, FPB public page, and Bundle Widget tests remain green
- [x] No CSS, class-name, source-order, or visual-placement assertions are added
- [x] Storefront assets are rebuilt at widget version 12.1.1
