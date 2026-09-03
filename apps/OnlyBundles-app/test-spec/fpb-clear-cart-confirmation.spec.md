---
schema_version: 1
id: fpb-clear-cart-confirmation
title: FPB Clear Cart Confirmation Test Spec
type: test-spec
status: active
summary: Verifies desktop and mobile clear-cart confirmation behavior, including restoration of configured default products.
last_audited: 2026-08-12
owners:
  - Wolfpack Bundles
domains:
  - storefront
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page/methods/clear-cart-confirmation-methods.ts
related_docs:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - fpb
  - clear-cart
  - default-products
keywords:
  - clear cart
  - preselected product
  - reset selections
---

# Test Spec: FPB Clear Cart Confirmation
**Spec ID:** fpb-clear-cart-confirmation  **Created:** 2026-06-12

## Purpose
Verify that the full-page bundle clear-cart action preserves the desktop dialog,
opens a dedicated native confirmation above the expanded mobile summary, and
uses the existing clear/reset behavior only after confirmation.

## Test Cases
### ClearCartConfirmationMethods
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Open confirmation | Widget with selected products and fake DOM | Dialog is appended and marked open without mutating selections | Covers shared desktop/mobile entry point |
| 2 | Cancel confirmation | Open dialog, click cancel | Dialog closes and selections remain unchanged | Dismiss path |
| 3 | Confirm clear with configured defaults | Open dialog, click Clear Cart | Step 1 resets to configured default quantities; other steps clear; current step and transient filters reset; render hook runs | Mirrors the persisted default-products contract |
| 4 | Confirm clear without configured defaults | Open dialog, click Clear Cart | Every step resets to an empty selection map | No fabricated fallback selection |
| 5 | Cancel focus restoration | Open from Clear, click Cancel | Focus returns to the Clear trigger | Preserves keyboard position |
| 6 | Confirm focus recovery | Confirm clear from the mobile tray | Focus moves to the persistent mobile disclosure after rerender | Avoids a stale removed node |
| 7 | Contained Tab order | Focus the final dialog control and press Tab | Focus wraps to the first dialog control | Keeps keyboard focus inside the modal |
| 8 | Expanded mobile confirmation | Clear from an open mobile summary | Native confirmation opens above it, summary becomes inert, and Go Back restores the still-open summary | Mobile uses Clear All and Go Back actions |
| 9 | Mobile Escape | Press Escape while mobile confirmation is open | Confirmation closes as Go Back and the underlying summary remains open | Native default is prevented |

## Acceptance Criteria
- [x] All listed test cases pass
- [x] Desktop sidebar Clear uses the shared confirmation
- [x] Mobile summary Clear uses a native confirmation above the disabled drawer
- [x] Widget source builds and minified assets are refreshed
- [x] Configured default products are restored after confirmation
- [x] Bundles without configured defaults still clear to zero selections
- [x] Cancel restores the trigger and confirm moves focus to a persistent summary control
- [x] Tab order is contained within the confirmation dialog
