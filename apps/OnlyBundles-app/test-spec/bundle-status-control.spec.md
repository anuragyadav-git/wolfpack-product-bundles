# Test Spec: Bundle Status Control
**Spec ID:** bundle-status-control  **Created:** 2026-09-11

## Purpose

Keep the shared FPB and PPB bundle-status control semantically labelled without
repeating the same visible label above the selector.

## Test Cases

### BundleStatusControl

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Shared status control renders | Any canonical bundle status | One visible Polaris heading identifies the section and the select retains an assistive-only label | No styling or placement assertions |
| 2 | FPB and PPB wrappers render | Route-specific status-card props | Both wrappers expose the same single-heading, assistive-label contract | Preserves route-owned change handlers |

## Acceptance Criteria

- [x] The status selector has exactly one visible Bundle Status label.
- [x] The native select remains labelled for assistive technology.
- [x] FPB and PPB use the same shared status-label contract.
- [x] Status values and change handling remain unchanged.
