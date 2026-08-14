# Test Spec: FPB Shared Desktop Summary Line Items
**Spec ID:** fpb-shared-desktop-summary-line-items  **Created:** 2026-08-14

## Purpose

Verify that every supported FPB preset routes ordinary desktop summary line items through the shared row renderer while preserving the separate mobile-summary and product-slot paths.

## Test Cases

### SharedDesktopSummaryRows

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Supported desktop preset without product slots | Standard, Classic, Compact, or Horizontal; desktop; slots disabled | Shared desktop summary rows enabled | All FPB templates share one line-item renderer |
| 2 | Mobile summary sheet | Supported preset; mobile sheet; slots disabled | Shared desktop summary rows disabled | Mobile drawer remains unchanged |
| 3 | Product-slot summary | Supported preset; desktop; slots enabled | Shared desktop summary rows disabled | Existing slot-tile behavior remains unchanged |
| 4 | Unsupported preset | Unknown preset; desktop; slots disabled | Shared desktop summary rows disabled | Fail closed outside the FPB preset registry |

## Acceptance Criteria

- [x] All supported FPB presets use the shared desktop row path when product slots are disabled.
- [x] Mobile summary and product-slot paths remain separate.
- [x] Existing focused summary tests pass.
