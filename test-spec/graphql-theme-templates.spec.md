---
schema_version: 1
id: graphql-theme-templates
title: GraphQL Theme Templates
type: test-spec
status: active
summary: Verifies that product templates are discovered through a server-filtered Shopify GraphQL theme-files query.
last_audited: 2026-08-29
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/services/bundles/bundle-configure-handlers.server.ts
  - tests/unit/services/theme-templates.test.ts
related_docs: []
tags:
  - tdd
  - themes
keywords:
  - product templates
  - theme files
---

# Test Spec: GraphQL Theme Templates
**Spec ID:** graphql-theme-templates  **Created:** 2026-08-18

## Purpose
Verify that `handleGetThemeTemplates` queries the published theme and its template files exclusively using the GraphQL Admin API (`Theme.files`), without using raw REST calls or direct session access tokens.

## Test Cases
### GetThemeTemplatesSuite
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Main theme with JSON and Liquid product templates | GraphQL returns matching `files.nodes` containing `templates/product.json`, `templates/product.bundle.json`, and `templates/product.custom.liquid` | Returns JSON with `success: true`, product templates sorted (`product` recommended first), `themeId`, `themeName` | Correctly maps product templates |
| 2 | Published theme contains more than 250 unrelated files | Query is inspected after GraphQL returns matching product templates | Theme files are requested with wildcard filters for only JSON and Liquid product templates | Prevents unrelated assets from crowding product templates out of the result |
| 3 | No published theme found | GraphQL returns empty `themes.nodes` | Returns JSON with `success: false`, `error: "No published theme found"` | Error handling |
| 4 | GraphQL call throws error | GraphQL rejects with Error | Returns JSON with `success: false`, status 500 | Error handling |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] The theme file query uses Shopify's server-side wildcard filename filtering
- [ ] No REST API calls or `session.accessToken` direct reads are performed
