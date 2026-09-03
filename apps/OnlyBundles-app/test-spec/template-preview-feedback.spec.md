---
schema_version: 1
id: template-preview-feedback
title: Template Preview Feedback
type: test-spec
status: active
summary: Verifies the shared post-preview confirmation modal and bundle-specific Crisp support draft.
last_audited: 2026-08-25
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
  - support-chat
source_paths:
  - app/components/bundle-configure/TemplatePreviewFeedbackModal.tsx
  - app/lib/support-chat.client.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureActionController.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbPreviewReadinessHandlers.ts
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - preview
  - merchant-feedback
keywords:
  - preview bundle
  - Crisp draft
---

# Test Spec: Template Preview Feedback

**Spec ID:** template-preview-feedback  **Created:** 2026-08-25

## Purpose

Preserve storefront preview navigation while asking the merchant whether the opened bundle was visible and providing bundle-specific support.

## Test Cases

### TemplatePreviewFeedback

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Preview opens successfully | Final storefront preview URL | Select Template closes and the feedback modal opens | FPB and PPB share the modal |
| 2 | Merchant confirms visibility | Visible tile activated | Feedback modal closes | No additional action |
| 3 | Merchant needs help | Issue tile activated | Crisp opens and automatically sends `Having issues seeing the bundle on storefront: <Bundle link>` using the final preview URL | Uses the explicit send-message helper |
| 4 | Preview fails | No preview URL | Feedback modal does not open | Existing failure feedback remains |

## Acceptance Criteria

- [x] Existing Preview bundle navigation still opens a new tab.
- [x] The feedback modal opens only after a successful preview.
- [x] Both feedback choices use Polaris clickable tiles.
- [x] The support message is automatically sent with the approved copy and exact final preview URL.
