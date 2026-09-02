---
schema_version: 1
id: offer-policy-csv-export-resource
title: Offer Policy CSV Export Resource
type: test-spec
status: active
summary: Defines the authenticated resource-route contract for downloading offer-policy CSV data without saving an embedded Admin document as a CSV file.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - offers
systems:
  - offer-policy
  - embedded-admin
source_paths:
  - app/routes/app/app.offer-operations.export.tsx
  - app/lib/offer-policy-csv-download.client.ts
related_docs:
  - internal docs/Shopify Integration/Embedded Admin Resource Authentication.md
tags:
  - csv
  - resource-route
keywords:
  - content type
  - app bridge fetch
---

# Test Spec: Offer Policy CSV Export Resource

**Spec ID:** offer-policy-csv-export-resource  **Created:** 2026-09-01

## Purpose

Ensure the embedded Offer operations page downloads CSV bytes from a dedicated,
Shopify-authenticated Remix resource route and never saves an HTML document or
authentication response with a `.csv` filename.

## Test Cases

### OfferPolicyCsvExportResource

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Authenticated export | Resource-route GET for an installed shop | `text/csv` response with the version 2 attachment filename | Uses `authenticate.admin(request)` |
| 2 | Shop isolation | Authenticated session shop | Export service receives only that shop domain | No client-supplied shop identifier |

### OfferPolicyCsvDownloadClient

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Valid CSV response | Successful `text/csv` response | Blob downloads as `offer-policies-v2.csv` | App Bridge intercepts standard fetch |
| 2 | HTML document response | Successful `text/html` response | Download is rejected before creating an object URL | Prevents the reported defect |
| 3 | Failed response | Non-success HTTP status | Download is rejected | Existing behavior remains |

## Acceptance Criteria

- [x] CSV export is owned by a dedicated authenticated resource route.
- [x] The rendered Offer operations loader never serves file bytes.
- [x] The download helper rejects successful non-CSV responses.
- [x] The downloaded filename is `offer-policies-v2.csv`.
- [x] Focused tests, lint, build, and authenticated SIT Chrome QA pass.
