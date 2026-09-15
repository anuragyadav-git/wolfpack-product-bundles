# Test Spec: Cart Internal Properties Cleanup
**Spec ID:** cart-internal-properties-cleanup  **Created:** 2026-09-15

## Purpose
Prevent internal leading-underscore cart line item properties (e.g. `_bundle_name`, `_is_bundle_parent`, `_wolfpack_bundle_runtime`) from leaking as raw buyer-facing text on legacy themes (such as Kingdom 3.7.1) that lack standard Shopify leading-underscore property suppression checks.

## Test Cases
### cleanupInternalCartProperties
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Raw text nodes in legacy theme content | DOM with text node starting with `_bundle_name:` followed by `<br>` | Text node and `<br>` are removed; other content remains intact | Kingdom 3.7.1 dumps properties directly in `<div class="content">` |
| 2 | Multiple internal properties in sequence | DOM with multiple `_` properties separated by `<br>` | All `_` property text nodes and `<br>` elements are removed | Suppresses `_is_bundle_parent`, `_wolfpack_bundle_runtime`, etc. |
| 3 | Property inside wrapper element | `<li class="product-details__item">_bundle_name: 3-Pack</li>` | Wrapper element is removed from DOM | Handles themes using list/paragraph property wrappers |
| 4 | Non-internal public property preserved | DOM with text node `Color: Blue` or `Engraving: Hello` | Public property text node and elements are preserved | Must not remove legitimate merchant line item properties |

## Acceptance Criteria
- [ ] Focused unit tests pass
- [ ] Storefront assets build without errors
- [ ] Linter passes on modified files
