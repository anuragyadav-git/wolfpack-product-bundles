---
schema_version: 1
id: fpb-public-bundle-number
title: FPB Public Bundle Number Test Spec
type: test-spec
status: active
summary: Verifies that FPB storefront URLs use the onlybundles app-proxy root and per-shop serial numbers while internal bundle IDs remain private runtime identifiers.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - storefront
systems:
  - fpb-app-proxy
source_paths:
  - app/lib/fpb-storefront-url.ts
  - app/services/bundles/fpb-public-number.server.ts
  - app/services/bundles/metafield-sync/operations/bundle-product.server.ts
  - app/routes/root/wpb.$bundleId.tsx
related_docs:
  - internal docs/Architecture/FPB Host Evaluation.md
tags:
  - fpb
  - public-url
keywords:
  - public-number
  - app-proxy
---

# Test Spec: FPB Public Bundle Number

**Spec ID:** fpb-public-bundle-number  **Created:** 2026-08-13

## Purpose

Keep internal bundle IDs out of FPB storefront URLs by assigning each shop a monotonic public number and resolving the signed `/apps/onlybundles` app-proxy route through that number.

## Test Cases

### PublicNumberAllocation

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Create an FPB | Shop counter at 0 | Counter increments and bundle receives public number 1 | Allocation and create share one transaction |
| 2 | Create a PPB | Product-page bundle data | No FPB counter allocation and public number remains null | PPB URLs remain product handles |

### FpbStorefrontUrl

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Build an FPB URL | Shop plus public number 1 | URL is rooted at `/apps/onlybundles/wpb/1` | Internal CUID is not accepted as the public path |
| 2 | Parse a proxy path number | Positive integer text | Positive integer | Zero, negative, fractional, and opaque IDs are rejected |

### FpbProxyResolution

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Load signed public FPB URL | Shop plus `/wpb/1` | Query uses shop and public number 1 | Returned widget config still contains the internal bundle ID |
| 2 | Preview a draft FPB | Internal ID plus public number 1 | URL uses `/wpb/1`; token remains bound to internal ID | Prevents public numbering from weakening authorization |

### FpbParentMetafield

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Sync an FPB parent product | Bundle with public number 12 | `bundle_ui_config.publicNumber` is 12 | Lets the app embed build the public redirect without exposing the internal ID |

## Acceptance Criteria

- [ ] Existing FPBs receive deterministic per-shop public numbers.
- [ ] New and cloned FPBs receive an atomically reserved number.
- [ ] All FPB public and preview URLs use the number.
- [ ] Storefront proxy requests use `/apps/onlybundles`.
- [ ] Proxy lookup rejects opaque internal IDs and resolves by shop plus public number.
- [ ] Preview tokens and widget configuration continue using internal bundle IDs.
- [ ] PPB product URLs remain unchanged.
- [ ] All listed test cases pass.
