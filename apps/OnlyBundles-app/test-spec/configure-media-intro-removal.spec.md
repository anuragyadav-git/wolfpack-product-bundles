---
schema_version: 1
id: configure-media-intro-removal
title: Configure Media Intro Removal Test Spec
type: test-spec
status: active
summary: Verifies that FPB and PPB media sections expose their actionable media controls without a duplicated generic introduction.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ImagesGifsPanel.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbImagesGifsSection.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - tdd
  - media
keywords:
  - media-assets
  - images-gifs
---

# Test Spec: Configure Media Intro Removal
**Spec ID:** configure-media-intro-removal  **Created:** 2026-09-10

## Purpose

Keep both bundle media sections focused on their actionable, feature-specific controls without repeating a generic Media Assets title and description beneath the existing Images & GIFs navigation context.

## Test Cases

### ConfigureMediaIntroRemoval

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Full Page media section opens | `activeSection` is `images_gifs` | Promo banner and other media controls render without the generic Media Assets introduction | User-visible rendering behavior only |
| 2 | Product Page media section opens | `activeSection` is `images_gifs` | Step image and loading animation controls render without the generic Media Assets introduction | User-visible rendering behavior only |

## Acceptance Criteria

- [x] FPB does not render the generic Media Assets introduction.
- [x] PPB does not render the generic Media Assets introduction.
- [x] Existing media upload behavior remains unchanged.
