---
schema_version: 1
id: configure-info-banner-dismissal
title: Configure Information Banner Dismissal
type: test-spec
status: active
summary: Verifies that informational banners in the shared FPB and PPB Configure flows can be dismissed by merchants.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/components/UnlistedBundleBanner.tsx
  - app/routes/app/shared/OfferOperationsSection.tsx
  - app/routes/app/shared/CountryTargetingSection.tsx
  - app/routes/app/_shared/bundle-configure/DiscountPricingTipBanner.tsx
  - app/routes/app/_shared/bundle-configure/DefaultProductDiscountTipBanner.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - tdd
  - admin
  - banner
keywords:
  - fpb
  - ppb
  - dismissible
---

# Test Spec: Configure Information Banner Dismissal

**Spec ID:** configure-info-banner-dismissal  **Created:** 2026-09-01

## Purpose

Allow merchants to close informational banners in both Configure flows while
leaving warning and critical banner behavior unchanged.

## Test Cases

### SharedConfigureInfoBanners

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Parent product status scan | Status is loading | Information banner exposes the native dismiss action | Shared by FPB and PPB headers |
| 2 | Shopify offer ownership guidance | Bundle Visibility is active | Information banner exposes the native dismiss action | Shared by FPB and PPB visibility sections |
| 3 | Recurrence timezone guidance | Recurring offer schedule selected | Information banner exposes the native dismiss action | Conditional shared banner |
| 4 | Shopify country guidance | Country targeting section is active | Information banner exposes the native dismiss action | Shared by FPB and PPB visibility sections |
| 5 | Discount guidance | Discount or default-product tip is visible | Existing session-persistent dismiss action remains available | Already shared by FPB and PPB |

## Acceptance Criteria

- [x] Every `tone="info"` banner rendered in FPB or PPB Configure is dismissible.
- [x] The implementation uses the native Polaris `s-banner` dismissal behavior.
- [x] Warning and critical banners are unchanged.
