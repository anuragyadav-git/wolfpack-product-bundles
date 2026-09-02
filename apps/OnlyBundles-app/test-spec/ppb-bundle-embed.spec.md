---
schema_version: 1
id: ppb-bundle-embed-test-spec
title: PPB Bundle Embed Test Spec
type: test-spec
status: implemented
summary: Behavioral coverage for PPB bundle embed configuration, eligibility, routing, placement, and preselection.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - storefront
systems:
  - ppb-bundle-embed
source_paths:
  - app/lib/ppb-bundle-embed.ts
  - app/services/ppb-bundle-embed.server.ts
  - app/routes/api/api.ppb-embed[.]json.tsx
  - app/storefront/ppb-bundle-embed.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
keywords:
  - product-page-bundle-embed
---

# Test Spec: PPB Bundle Embed
**Spec ID:** ppb-bundle-embed  **Created:** 2026-08-20

## Purpose

Verify the canonical Product Page Bundle embed configuration, signed storefront
eligibility resolution, lazy product-page mounting, and browsed-product
preselection without changing the parent-product widget path or native product
purchase controls.

## Test Cases

### PpbBundleEmbedConfig
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Missing configuration | `null` | Disabled canonical defaults | No legacy fallback |
| 2 | Partial configuration | Saved canonical fields | Normalized five-array display contract | Invalid values fail closed |
| 3 | Localized copy | Exact locale, language locale, base copy | Exact, then language, then base | Stored under `multiLangText` |
| 4 | Mode transition | New target mode | Both product and collection targets clear | Mirrors live behavior |
| 5 | Enabled validation | Blank title or empty specific target | Field-level issue | Disabled configuration is valid |

### PpbBundleEmbedEligibility
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | All bundle products | Paid enabled step product or collection | First eligible PPB | Gifts and disabled steps excluded |
| 2 | Specific products | Numeric ID, GID, or handle | Match only the selected product | Product-level targeting |
| 3 | Specific collections | Repeated current collection IDs | Match only selected collections | Empty target fails closed |
| 4 | Multiple matches | Different creation times and IDs | `createdAt ASC`, then `id ASC` | One embed only |
| 5 | Status and enablement | Draft, disabled, FPB | Excluded | Active and unlisted only |

### PpbBundleEmbedRoute
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Invalid signature/context | Unsigned or missing product/locale | Rejected or 400 | No database query |
| 2 | Signed shop | Valid app-proxy request | Shop-scoped PPB query | Includes runtime relations |
| 3 | Cache revalidation | Matching `If-None-Match` | 304 | Private 30-second cache |
| 4 | Internal failure | Database error | 500 and no-store | No bundle data leak |

### PpbBundleEmbedRuntime
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Automatic placement | No custom anchor | Mount before primary visible Add to Cart | Native form remains intact |
| 2 | Custom placement | Visible custom anchor | Custom anchor wins | First visible anchor only |
| 3 | Section reload | Same product context | Reconcile without duplicate fetch/widget | Cached response reused |
| 4 | Preselection | Matching available current variant | Quantity one in matching step | Never overwrites restored state |
| 5 | Parent-product path | Existing direct PPB container | Embed runtime no-ops | Existing behavior preserved |

### PpbBundleEmbedAdmin
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Disabled configuration | Master switch off | Saved fields remain visible and inert | Matches live EB |
| 2 | Custom placement | Master switch off | Place Block remains available | Placement anchor is configured independently |
| 3 | Target transition | New targeting mode | Product and collection selections clear | Prevents mixed targeting state |

## Acceptance Criteria
- [x] All listed test cases pass
- [x] Storefront assets load only after an eligible embed resolves
- [ ] Native price, dynamic checkout, and ordinary product form remain untouched
- [ ] Parent-product PPB and Bundle Widget behavior regressions pass
