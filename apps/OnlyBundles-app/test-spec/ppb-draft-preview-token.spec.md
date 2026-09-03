# Test Spec: PPB Draft Preview Token
**Spec ID:** ppb-draft-preview-token  **Created:** 2026-08-10

## Purpose
Allow authenticated merchants to preview draft Product Page Bundles without exposing draft configuration to public storefront requests.

## Test Cases
### BundlePreviewToken
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Valid token | Matching shop, bundle, secret, and unexpired token | Accepted | Shared by FPB and PPB |
| 2 | Invalid token | Tampered, expired, cross-shop, or cross-bundle token | Rejected | No compatibility aliases |

### PrepareStorefrontPreview
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | PPB preview preparation | Authenticated PPB configure request | Direct sync plus bound preview token | Token is not persisted |

### BundleConfigApi
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Public bundle | Active or unlisted bundle | Configuration returned with public cache headers | Existing storefront behavior |
| 2 | Unsigned draft | Draft bundle without token | `404` | Public drafts remain hidden |
| 3 | Authorized draft | Draft bundle with matching token | Configuration returned with `private, no-store` | Fifteen-minute authorization |
| 4 | Invalid draft token | Draft bundle with mismatched token | `404` | Shop and bundle binding enforced |
| 5 | Archived bundle | Archived bundle with valid token | `404` | Preview never revives archived state |

### ProductPageWidget
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Draft preview URL | Product URL contains `wpb_preview` | Config request forwards only `wpb_preview` | Shopify preview parameters remain on page URL |
| 2 | Public product URL | No `wpb_preview` query | Config request contains no preview token | No public behavior change |
| 3 | Hydrated bundle selection | Config lifecycle selects fetched bundle | Data manager, template manager, and category expansion use their direct module imports | Prevents bundled runtime `ReferenceError` |
| 4 | Authorized draft selection | Signed API returned the explicitly requested draft PPB | Data manager selects the bundle | Server authorization remains the security boundary |

## Acceptance Criteria
- [ ] PPB Admin preview opens with a short-lived signed token.
- [ ] Product Page widget forwards the token to the signed app-proxy config request.
- [ ] Valid draft preview initializes while unsigned and invalid draft requests remain `404`.
- [ ] Authorized draft responses are never publicly cached.
- [ ] FPB preview behavior remains valid through the shared token module.
- [ ] Focused tests, lint, widget build, and live Chrome desktop/mobile verification pass.
