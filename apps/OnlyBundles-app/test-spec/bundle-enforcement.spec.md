---
schema_version: 1
id: bundle-enforcement-test-spec
title: Bundle Enforcement Test Spec
type: test-spec
status: in-progress
summary: Verify country enforcement and scheduled authorization before quantity consolidation.
last_audited: 2026-09-15
owners: [engineering]
domains: [development]
systems: [only-bundles, shopify]
source_paths: [apps/OnlyBundles-app/extensions/bundle-cart-transform-rs/src/expand.rs, apps/OnlyBundles-app/app/routes/api/api.cart-transform-runtime-token.tsx]
related_docs: [internal docs/Shopify Integration/Offer Country Targeting.md]
tags: [testing, cart-transform]
keywords: [country, schedule, authorization]
---

# Test Spec: Bundle Enforcement
**Spec ID:** bundle-enforcement **Created:** 2026-09-14

## Purpose
Close enforcement gaps before changing the quantity storage contract. Server token eligibility is not proof of checkout expiry.

## Test Cases
### Parent country enforcement
| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Restricted parent | Include/exclude rules and Shopify country | Only eligible parent expands | Same country contract as MERGE |
| 2 | Unrestricted parent | Explicit empty country rule | Existing price/composition retained | No legacy reader |
| 3 | Missing or invalid policy | Absent, wrong type or invalid rule | No operation | Fail closed |
| 4 | Display unavailable | Valid policy, absent component pricing | Authorized expansion retained | Display is independent |
| 5 | Invalid optional pricing | Valid policy with malformed discount fields | Composition retained without discount | Independent parsing |
| 6 | Writer propagation | FPB/PPB with include/exclude/disabled policy | Parent pricing metadata contains canonical country rule | Normal save/sync writer |

### Runtime token issuance
| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 7 | Future/expired/invalid schedule | Direct token request | Rejected before Admin calls or signing | FPB and PPB |
| 8 | Boundary | Start exactly now / end exactly now | Start allowed, end rejected | Existing canonical schedule helper |
| 9 | Recurrence | Inside/outside weekly window | Only active window issues token | No priority arbitration |

### Scheduled checkout implementation
| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 10 | Native scheduled discount | Existing cart crossing expiry | Native price recalculation, no expired saving | Shopify-hosted QA required |
| 11 | Pricing handoff | Tampered/replayed result | Reject mismatched authorization | Must prove Function contract first |
| 12 | Combined features | Pricing methods, gifts, addons, subscriptions | No duplicate discounts; native combination rules | Preserve billing-cycle terms |
| 13 | Sync lifecycle | Capacity exhausted / API error / readback mismatch | No false synchronization success | No live writes in unit tests |

### Canonical composition synchronization
| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 14 | Missing variant | Complete Admin nodes response with null | Persist removal before canonical bundle reload | Preserve quantities on surviving references |
| 15 | Uncertain lookup | Access error, incomplete response, wrong node identity | No persistence or publication; bundle failure | Storefront invisibility is not deletion |
| 16 | Persistence failure | Database update rejects | No publication or false success | Other shops continue |

### Additional policy boundaries
| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 17 | Normal save/sync config | Saved FPB/PPB policy and subscription | Complete policy reaches parent writer | Decision marker alone is insufficient |
| 18 | Unavailable bundle | Draft, paused, archived, absent status | No runtime token or Admin lookup | Active/unlisted semantics |
| 19 | Policy revision | Schedule changes versus priority/countdown changes | Schedule revokes previous PPB revision; presentation does not | Canonical Date/string normalization |
| 20 | Recurrence calendar | Weekly/monthly, missing month day, leap day, termination | Only configured occurrences authorize savings | Function tests; hosted DST QA outstanding |

### Publication and native owner lifecycle
| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 21 | Concurrent policy save | Shopify compareDigest from prior read | Atomic metafieldsSet rejects a stale digest | No blind retry that overwrites another save |
| 22 | Invalid publication response | GraphQL error, missing/partial result, changed values | Sync fails without reporting success | JSON formatting differences are accepted |
| 23 | Invalid policy inventory | Malformed JSON, missing policy field/digest, oversized UTF-8 map | No replacement publication | Other bundles remain intact |
| 24 | Native owner setup | One-time dates, subscription cycle ownership, configured title | Native create/update followed by readback | Lifecycle service exists; normal save/sync integration covered |
| 25 | Owner reconciliation | Existing owner, duplicate/obsolete role, another bundle | Reuse own owner and remove only obsolete own resources | No title-based matching |
| 26 | Native API failures | Capacity error, transport/GraphQL error, incomplete readback | No successful lifecycle result | Shopify owns automatic discount capacity |
| 27 | Recurring timezone | Saved timezone differs from Shopify shop timezone | Reject before owner mutation | No separate checkout clock |
| 28 | DST rollback | Both copies of a local hour and rollback before start | Eligibility follows wall clock and next actual transition | Temporal provides timezone transitions |
| 29 | DST forward jump | Partly or entirely skipped local window | Open at clock entry or skip; do not extend run count | Real schedule helper tests |
| 30 | Scheduled parent owner | Standard mode or recurring subscription owner | No parent discount | Scheduled Function policy record test |
| 31 | Parent prerequisite mutation | Failed, incomplete, or requiresComponents=false result | No metafield publication | Shopify must confirm the exact parent variant |

### Cart storage and authorization boundaries
| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 32 | Whole cart capacity | Active plus pending entries, multibyte text | Reject above 10,000 UTF-8 bytes before write/add | All shared writers |
| 33 | Native pagination | Multiple pages, component and parent offer IDs | Retain active entries and prune stale entries | No fixed first-page truncation |
| 34 | Concurrent cart edits | Changing page snapshot or readback; native Web Locks missing | Conflict/no add; serialize same-origin write plus add | No cross-device atomicity claim |
| 35 | Bundle deletion | Current policy and native scheduled owners | Revoke policy and remove only owned discounts before deletion | compareDigest retained |
| 36 | Live product membership | Uncached selected variant, spoofed browser product ID | Verify exact variant/product through Admin nodes | Errors and incomplete reads fail |
| 37 | Checkout child authorization | Stale outer revision or unpublished policy | Do not issue child token | Native parent identity verified |
| 38 | Add-on ceiling | Ordinary component or discount above saved maximum | Reject unauthorized savings | Exact tier threshold is not claimed |
| 39 | Presentation-only changes | Priority, copy, product image, stale countdown deadline | Stable authorization; countdown only for one-time schedule | No checkout priority arbitration |
| 40 | Signed pricing receipt | Real transformed token with altered identity, quantity, price or signature | Native scheduled Function only discounts exact current match | Preserve outer token fields |
| 41 | Native EXPAND quantities | Parent quantity three | Component quantity one; Shopify multiplies by parent quantity | Avoid multiplying twice |
| 42 | Native JSON input | Policy map and owner settings as jsonValue | Native SDK reads current record/settings; no string fallback | All Function policy readers |
| 43 | Cryptographic interoperability | Node crypto signatures, short and long HMAC keys | RustCrypto accepts exact canonical signatures | No hand-rolled SHA |
| 44 | Removed private output | MERGE/EXPAND and configured cart messaging | Native prices/allocations and supported metadata remain | Third-party assessment in architecture note |
| 45 | Full Function resources | Multi-bundle and static per-line authorization carts | Record WASM/input/output/instructions against platform budgets | Native runner success alone is insufficient |

| 46 | Pending line bound | Missing, fractional, nonpositive or eleven pending lines | Reject before Shopify reads/writes | All storefront callers supply count |
| 47 | Whole-cart line bound | Native children across pages plus pending lines | Reject eleven; accept ten; ordinary lines excluded | Components, gifts and add-ons share allowance |
| 48 | Native bypass enforcement | Eleven bundle lines or add-ons without offer marker | Transform errors before authorization; ten accepted | Native blockOnFailure blocks cart operation |
| 49 | Discount work bound | Ten versus eleven signed lines | Ten can discount; eleven produces no operations | Standard and scheduled owners |
| 50 | Tight native resource case | Ten production-length static scheduled add-ons | 3,375,040 instructions below 11 million after removing repeated verification | Does not certify arbitrary token sizes |

| 51 | Shared Rust compile boundaries | Standard and scheduled release binaries, plus Cart Transform signing | No dead-code warnings; existing signature, checkout-code and scheduled eligibility tests pass | No lint suppression; preserve owner behavior |

| 52 | Production-length authorization resources | Ten distinct static scheduled add-ons, full IDs and 64-character revision | Native runner instructions at or below 11 million and exact ten discounted targets | Short identifier fixtures alone are insufficient |

| 53 | Scheduled owner re-sync | Shopify returns existing metafield IDs | Update by namespace/key only; no conflicting ID plus app-namespace alias | Reproduced on hosted SIT preview |

| 54 | Complete mixed-cart inputs | Wide static policy, near-limit published policy map, 200 and 250 cart lines | Native input, output and instructions fit the applicable Shopify limits | Complete queried payloads, including ordinary merchandise |
| 55 | Transform output boundary | Ten groups, 190 ordinary lines and exactly 10,000 cart-metafield bytes | Ten merge operations; 17,274 output bytes and 10,229,431 instructions | Preserve output/instruction headroom checks |
| 56 | Exact UTF-8 boundary | JSON escapes and multibyte characters at 10,000 and 10,001 bytes | Accept exact boundary; reject one byte over | Serialized UTF-8, not string length |

## Acceptance Criteria
- [x] Country and current-policy publication/issuance behavior passes.
- [x] Native scheduled owners and signed pricing handoff are implemented.
- [x] Quantity consolidation and whole-metafield UTF-8 guard are implemented.
- [x] Third-party consumption assessment records native contracts and EXPAND limitations.
- [x] Approved tested selection limit is enforced in storefront preflight, token issuance and native Functions.
- [x] Representative complete payload resource fixtures pass, including large static authorizations and mixed 200/250-line carts.
- [ ] Final release binary and hosted resource envelope are certified.
- [ ] Shopify-hosted expiry, recurrence, subscriptions and integration QA passes before release.
