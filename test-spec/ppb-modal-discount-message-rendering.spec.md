---
schema_version: 1
id: ppb-modal-discount-message-rendering
title: "Test Spec: PPB Modal Discount Message Rendering"
type: test-spec
status: active
summary: Verifies that PPB modal discount templates render their trusted variable markup instead of exposing HTML source to shoppers.
last_audited: 2026-08-20
owners:
  - storefront
domains:
  - storefront
systems:
  - product-page-bundle-widget
source_paths:
  - app/assets/widgets/product-page/methods/modal-state-methods.ts
  - app/assets/widgets/product-page/templates/cascade-template.ts
  - tests/unit/assets/ppb-product-page-modal-accessibility.test.ts
  - tests/unit/assets/ppb-cascade-discount-message.test.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - ppb
  - modal
keywords:
  - discount-message
  - html-rendering
---

# Test Spec: PPB Modal Discount Message Rendering
**Spec ID:** ppb-modal-discount-message-rendering  **Created:** 2026-08-20

## Purpose
Ensure localized PPB discount templates render the styled variable spans produced by `TemplateManager` without exposing escaped HTML source in modal or in-page Cascade surfaces.

## Test Cases
### ProductPageModalStateMethods
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Localized progress message contains a substituted condition variable | French rule template and one selected item | Modal message receives rendered span markup containing the localized copy | Markup comes from the shared trusted template renderer |
| 2 | Cascade footer receives a substituted discount message | Message containing a styled variable span | Footer receives rendered span markup instead of escaped source | Shared by Grid and List presets |

## Acceptance Criteria
- [ ] The focused modal behavior test passes.
- [ ] The focused Cascade behavior test passes.
- [ ] The rendered message contains localized copy and a real span element.
- [ ] The shopper-facing output does not contain escaped span source.
