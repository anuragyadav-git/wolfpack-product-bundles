# Test Spec: GraphQL Theme Templates
**Spec ID:** graphql-theme-templates  **Created:** 2026-08-18

## Purpose
Verify that `handleGetThemeTemplates` queries the published theme and its template files exclusively using the GraphQL Admin API (`Theme.files`), without using raw REST calls or direct session access tokens.

## Test Cases
### GetThemeTemplatesSuite
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Main theme with JSON and Liquid product templates | GraphQL returns theme with `files.nodes` containing `templates/product.json`, `templates/product.bundle.json`, `templates/product.custom.liquid`, `templates/collection.json` | Returns JSON with `success: true`, only product templates filtered and sorted (`product` recommended first), `themeId`, `themeName` | Correctly filters out non-product templates |
| 2 | No published theme found | GraphQL returns empty `themes.nodes` | Returns JSON with `success: false`, `error: "No published theme found"` | Error handling |
| 3 | GraphQL call throws error | GraphQL rejects with Error | Returns JSON with `success: false`, status 500 | Error handling |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] No REST API calls or `session.accessToken` direct reads are performed
