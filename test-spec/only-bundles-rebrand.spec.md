---
schema_version: 1
id: only-bundles-rebrand-test-spec
title: Only Bundles Rebrand Test Spec
type: test-spec
status: active
summary: Defines behavior coverage for the Only Bundles visible rebrand and parent-product tag transition.
last_audited: 2026-08-28
owners:
  - engineering
domains:
  - branding
systems:
  - embedded-admin
  - storefront
  - shopify-extensions
source_paths:
  - app/lib/app-brand.ts
  - app/services/bundles/bundle-parent-product.server.ts
related_docs:
  - internal docs/Architecture/Only Bundles Brand and Compatibility Boundary.md
tags:
  - rebrand
  - tdd
keywords:
  - Only Bundles
  - parent product tags
---

# Test Spec: Only Bundles Rebrand

**Spec ID:** only-bundles-rebrand  **Created:** 2026-08-28

## Purpose

Verify that every newly exposed application identity uses Only Bundles while compatibility-critical runtime identifiers remain unchanged.

## Test Cases

### BrandIdentity

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Canonical application identity | Brand constants | Name and publisher are `Only Bundles` | Palette matches approved concept |
| 2 | Admin locale branding | Every supported locale | Brand-bearing messages contain `Only Bundles` and no `Wolfpack` | Brand name is not translated |
| 3 | Shopify configuration | Production and SIT TOML | Display names are rebranded; handles and client IDs are unchanged | Prevent broken Admin links |
| 4 | Extension identity | Theme, product configuration, and pixel configuration | Merchant-visible names use Only Bundles | Extension UIDs and handles remain stable |
| 5 | Analytics export | Export action date window | Filename begins `only-bundles-analytics-` | CSV data is unchanged |

### ParentProductBrandTags

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Create bundle parent | New FPB or PPB parent | Adds `Only Bundles`, `only-bundles-parent`, and Rebuy tags | No legacy brand tags |
| 2 | Sync existing parent | Existing parent with arbitrary merchant tags | Adds new brand tags and removes only the two legacy brand tags | Merchant and Rebuy tags remain |
| 3 | Shopify rejects tag add | Existing parent | Sync fails with a specific tag-add error | No success is reported |
| 4 | Shopify rejects legacy tag removal | Existing parent | Sync fails with a specific tag-removal error | No success is reported |

## Acceptance Criteria

- [x] All listed test cases pass.
- [x] No test asserts CSS, class names, or element placement.
- [x] Compatibility identifiers remain covered by existing storefront and extension tests.
