---
schema_version: 1
id: offer-country-targeting
title: Shopify Country Offer Targeting
type: test-spec
status: active
summary: Defines country-based offer eligibility using Shopify localization context without unstable market identifiers or protected customer data.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - offers
  - storefront
systems:
  - offer-policy
  - theme-app-extension
  - cart-transform
source_paths:
  - prisma/schema.prisma
  - app/lib/offer-country-targeting.ts
  - app/routes/app/shared/CountryTargetingSection.tsx
  - extensions/bundle-builder/blocks/bundle-app-embed.liquid
related_docs:
  - docs/competitor-analysis/20-bogos-personalization-analytics-offer-operations.md
  - docs/competitor-analysis/22-bogos-bundlex-wolfpack-feasibility.md
tags:
  - tdd
  - localization
  - eligibility
keywords:
  - country code
  - localization country
  - Shopify Markets
---

# Test Spec: Shopify Country Offer Targeting

**Spec ID:** offer-country-targeting  **Created:** 2026-09-01

## Purpose

Target offers by Shopify's current ISO country context. Do not persist or
compare market IDs or handles, request `read_markets`, infer IP geography, or
introduce protected customer-data access.

## Test Cases

### CountryTargetingPersistence

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | New policy defaults | No country configuration | Disabled include mode with no country codes | Migration changes no existing offer visibility |
| 2 | Disabled configured rule | Saved codes with targeting off | Codes and mode remain configured but inert | Matches existing disabled-configuration behavior |
| 3 | Include countries | `ca`, `US`, repeated values | Canonical unique uppercase ISO codes | Country order has no eligibility meaning |
| 4 | Exclude countries | Valid ISO codes and exclude mode | Direct typed fields | No JSON policy blob |
| 5 | Invalid country | Missing or non-two-letter value while enabled | Field validation issue | Fail before persistence |
| 6 | Omitted form fields | Older or unrelated action | No country mutation | Does not overwrite settings outside this save surface |

### ShopifyRuntimeContext

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Storefront context | `localization.country.iso_code` | Only current two-letter code reaches the widget | Shopify owns localization |
| 2 | Unknown country | Missing Shopify country context | Include rule fails closed; exclude rule remains eligible | Explicit deterministic behavior |
| 3 | Checkout enforcement | Signed rule plus Function localization country | Direct cart bypass cannot receive the configured bundle transformation/discount | Browser result is not trusted |
| 4 | Query budget | Cart Transform input | Calculated complexity remains at most 30 | Consolidate an existing line envelope before adding a leaf |
| 5 | Function binary budget | Shopify CLI optimized Cart Transform WASM | Less than 256,000 bytes | Conservative threshold; measure the post-optimizer artifact, not raw Cargo output |
| 6 | Signed rule encoding | Normalized include, exclude, or disabled rule | Compact `countryRule` string consumed by both Functions | Avoid a second nested Rust JSON deserializer |

## Acceptance Criteria

- [x] Prisma migration defines direct country-targeting fields with inert defaults.
- [x] Admin persistence normalizes and validates ISO country codes.
- [x] FPB and PPB read Shopify Liquid localization after a hard reload.
- [x] Cart Transform independently enforces country targeting within complexity 30.
- [x] No market identifier, IP service, new Shopify scope, or customer record is used.
