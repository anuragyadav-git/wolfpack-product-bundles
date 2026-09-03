---
schema_version: 1
id: fpb-product-page-upsell-widget-test-spec
title: FPB Product Page Upsell Widget Test Spec
type: test-spec
status: verified-local
summary: Covers save normalization, signed offer selection, shared rendering, placement, and exact-variant handoff.
last_audited: 2026-08-13
owners:
  - Aditya Awasthi
domains:
  - storefront
systems:
  - fpb-upsell
source_paths:
  - app/lib/fpb-upsell-config.server.ts
  - app/services/fpb-upsells.server.ts
  - app/storefront/fpb-product-page-upsell.ts
related_docs:
  - design-jobs/fpb-product-page-upsell-shared-runtime-20260813/implementation-handoff.md
tags:
  - tdd
keywords:
  - upsell
  - handoff
---

# Test Spec: FPB Product-Page Upsell Widget
**Spec ID:** fpb-product-page-upsell-widget  **Created:** 2026-08-13

## Purpose

Prove the server boundary, signed eligible-offer contract, shared renderer state, and exact one-shot variant handoff without styling or placement-source assertions.

## Test Cases

### SaveNormalization
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Valid Button | CTA and all-products target | canonical direct fields and config | title optional |
| 2 | Valid Block | title, optional description/image | canonical config | CTA required |
| 3 | Specific target | both branches in client JSON | only active branch persists | fail closed if empty |
| 4 | Localization | exact and language keys | compact locale map persists | no invented copy |
| 5 | Invalid enabled config | missing CTA/title/targets | validation error | no DB write |

### AdminTargetPickers
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Product picker selection renders | selected product resource | selected product remains visible without a render crash | resource identity comes from the visibility model |
| 2 | Collection picker selection renders | selected collection resource | selected collection remains visible without a render crash | resource identity comes from the visibility model |

### EligibleOffers
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Signature/shop gate | unsigned or foreign shop | no offers | route test |
| 2 | Status/type gate | draft, archived, PPB, missing public number | excluded | active/unlisted FPB only |
| 3 | Target modes | explicit product, paid-step collection, specific targets | matching offers | gifts excluded |
| 4 | Multiple matches | duplicate rows and public numbers | ordered, deduplicated DTOs | minimal shape |
| 5 | Locale | exact, language-only, missing | exact then language then base | no fabricated text |

### StorefrontRuntime
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Empty/error | no offers or fetch rejection | no shell | shared runtime |
| 2 | Modes/multiple | Button and Block DTOs | all semantic CTAs render | deterministic order |
| 3 | Placement | custom/default/duplicate init | one winning anchor | post-deploy Chrome QA; no placement unit test |
| 4 | Variant change | variant source changes before click | latest variant stored | click-time capture |
| 5 | Busy/back-forward | click then pageshow | CTA state restored | one navigation |
| 6 | App-embed endpoint | Shopify wraps extension snippets in diagnostic comments | emitted endpoint remains a valid relative app-proxy URL | Liquid/Theme Check and Chrome verification |
| 7 | Section replacement | initialized product section is replaced | cached eligible offers mount into the replacement section without another request | Shopify section lifecycle |

### DestinationHandoff
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Valid exact variant | enabled paid step and available variant | quantity one merged | first step by position |
| 2 | Invalid payload | stale, wrong bundle, unknown/unavailable variant | consumed without selection | no fallback variant |
| 3 | Duplicate default | existing selection | unchanged quantity | no doubling |
| 4 | Delayed collection | variant arrives after hydration | selected when step loads | active step unchanged |
| 5 | Summary refresh | successful selection | desktop and mobile renderers called | shared state |

## Acceptance Criteria

- [x] All listed automated behavior tests pass.
- [x] No CSS, class-name, source-grep, or visual-placement unit tests are added.
- [x] Generated widget assets and syntax checks pass.
- [ ] Post-deploy Chrome QA covers visual placement and responsive behavior.
