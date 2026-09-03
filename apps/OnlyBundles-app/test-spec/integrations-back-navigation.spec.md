# Test Spec: Integrations Back Navigation
**Spec ID:** integrations-back-navigation  **Created:** 2026-08-13

## Purpose

Verify that the Integrations route owns the app-page back action and delegates it to the shared previous-page navigation behavior.

## Test Cases

### IntegrationsRoute

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Merchant activates the Integrations back action | Integrations route renders and invokes `onBack` | Shared navigation receives the route navigator, Dashboard fallback, and replace fallback option | Browser history remains the primary destination |

## Acceptance Criteria

- [x] Integrations passes an `onBack` action to its page shell.
- [x] The action uses previous history when available and `/app/dashboard` as the fallback.
- [x] All listed test cases pass.
