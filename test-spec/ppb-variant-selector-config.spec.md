# Test Spec: PPB Variant Selector Configuration
**Spec ID:** ppb-variant-selector-config  **Created:** 2026-08-30

## Purpose

Define the canonical category-level selector mode, explicit color mapping, and
color-swatch tooltip persistence/runtime contract before storefront rendering.

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

## Acceptance Criteria

- [x] All listed test cases pass
- [x] `displayVariantsAsSwatches` is removed from the canonical category contract
- [x] Prisma schema and migration use direct fields with sensible defaults
- [x] No legacy read or migration shim is introduced
