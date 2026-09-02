# Test Spec: Specific-Link Eligibility
**Spec ID:** specific-link-eligibility  **Created:** 2026-08-31

## Purpose

Define secure campaign-link token generation, digest verification, revocation/expiry
decisions, destination construction, Admin operations, and storefront gating for
bundle-owned offer policies.

## Test Cases

### SpecificLinkOfferToken

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Generate token | Deterministic or default random token | One opaque URL-safe credential and one-way hash | No identifier/secret split or signing layer |
| 2 | Default entropy | No injected token | 256-bit URL-safe token | Raw token exists only in generated Admin response |
| 3 | Destination with existing query | URL containing query and fragment | `wpb_offer` added without losing either | No manual string concatenation |

### SpecificLinkEligibilityDecision

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | No enabled policy | Missing or disabled policy | Eligible, `not_required` | Existing bundles remain public |
| 2 | Missing token | Enabled policy and no token | Rejected, `token_missing` | Safe reason only |
| 3 | Matching token | Enabled policy and active condition | Eligible, `matched` | Includes policy ID and rule version |
| 4 | Wrong token | Invalid digest | Rejected, `token_invalid` | Constant-time digest comparison; no private condition data returned |
| 5 | Revoked token | Condition has `revokedAt` | Rejected, `token_revoked` | Revocation is immediate |
| 6 | Expired token | `expiresAt` at or before now | Rejected, `token_expired` | Boundary is exclusive |
| 7 | Missing condition | Enabled policy without link condition | Rejected, `condition_missing` | Invalid persisted state fails closed |

### RuntimeAndAdminIntegration

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | App-proxy decision | Authenticated proxy shop, bundle, token | No-store eligibility response | Raw token never logged or returned |
| 2 | FPB page/API gate | Enabled link policy | Missing/invalid token is hidden; valid token renders | Preview authorization remains separate |
| 3 | PPB runtime gate | Static PPB config requires link | Widget waits for proxy decision before rendering | Existing static transport remains primary |
| 4 | Generate/regenerate | Admin-owned bundle | Policy/condition upserted and copyable destination returned | Rule version increments |
| 5 | Revoke | Existing link condition | `revokedAt` persisted | Repeated revoke is safe |
| 6 | Save master switch | Configure SaveBar | Policy enabled state persists atomically | Both FPB and PPB |
| 7 | Decision analytics | Enabled policy decision | Privacy-safe internal event | No token, URL, or identifier metadata |

## Acceptance Criteria

- [x] Token and decision unit tests pass
- [x] App-proxy and FPB route tests pass
- [ ] Admin generate, revoke, and SaveBar persistence tests pass
- [ ] PPB/FPB runtime behavior tests pass
- [ ] Admin persistence and desktop/mobile storefront Chrome QA pass
- [x] No raw token, full URL, customer identity, or condition details enter analytics
