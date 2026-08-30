# Test Spec: PPB Variant Selector Configuration
**Spec ID:** ppb-variant-selector-config  **Created:** 2026-08-30

## Purpose

Define the canonical category-level selector mode, explicit color mapping,
Admin editing, storefront rendering, and color-swatch tooltip behavior.

## Test Cases

### VariantSelectorConfiguration

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Missing selector configuration | Empty category configuration | Dropdown mode, tooltip disabled, empty color map | New canonical defaults |
| 2 | Valid color swatch configuration | Color mode, tooltip enabled, strict hex mappings | Values preserved | No inferred colors |
| 3 | Tooltip configured for another mode | Pill mode with tooltip true | Tooltip normalized to false | Tooltip is color-swatch only |
| 4 | Unsupported selector mode | Unknown string | Validation error | No compatibility fallback |
| 5 | Invalid color mapping | Non-hex color value | Validation error | Prevent CSS injection |
| 6 | PPB category persistence | Canonical selector fields | Direct Prisma create fields | Old swatch boolean absent |
| 7 | PPB runtime projection | Saved canonical selector fields | Same storefront contract | Sync and proxy share ownership |
| 8 | Admin selector controls | Category is not individual-variant mode | Polaris selector style control and conditional tooltip/color-map controls | Category-owned draft state |
| 9 | Pill selection | Grouped product with multiple variants | Semantic radio group emits the exact selected variant | 44px targets are visually QA'd, not unit-tested |
| 10 | Color swatch mapping | Explicit mapped and unmapped option values | Only exact six-digit hex mappings receive color | No color-name guessing |
| 11 | Color tooltip | Tooltip enabled in color mode | Hover/focus description and edge-aware placement | Suppressed on coarse/mobile pointers |
| 12 | Image swatch | Variant with image | Semantic radio uses variant image and accessible label | Unavailable values disabled |
| 13 | Delegated storefront selection | Radio swatch change event | Active product variant, price, image, inventory context, and render path update | Add remains separate mutation |
| 14 | Category-filtered rerender after selection | Product has a selected variant that remains in the configured category subset | Rerender preserves that variant's identity, price, image, and inventory context | Prevents swatches from resetting to the first available variant |

## Acceptance Criteria

- [x] All listed test cases pass
- [x] `displayVariantsAsSwatches` is removed from the canonical category contract
- [x] Prisma schema and migration use direct fields with sensible defaults
- [x] No legacy read or migration shim is introduced
- [x] Admin and storefront behavior tests pass
- [ ] Desktop and mobile Chrome QA passes against the served widget asset
