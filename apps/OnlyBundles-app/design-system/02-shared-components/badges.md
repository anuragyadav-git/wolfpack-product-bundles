---
schema_version: 1
id: shared-component-badges
title: Shared Component - Badges
type: component-contract
status: active
summary: Shared status/label badge contract for bundle product and summary states.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/shared/components/bundle-banners.js
  - app/assets/widgets/shared/template-design-system.js
related_docs:
  - design-system/01-foundations/color.md
  - design-system/05-copy/placeholder-contract.md
tags:
  - component
  - badge
  - status
keywords:
  - included
  - sold-out
  - new
---

# Badges

## Required Behaviors

- Render status messaging with deterministic text source
- Respect localizable copy where configured
- Handle multiple concurrent statuses without layout instability
- Support loading and disabled visual states

## Contract

- Semantic badge meaning is shared; visual density and placement may vary by template adapter.
