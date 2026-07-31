---
schema_version: 1
id: polaris-app-home-web-components
title: Polaris App Home Web Components Reference
type: reference
status: authoritative
summary: Canonical source for Polaris web component usage in the Wolfpack admin UI, with the Shopify App Home web components documentation as the source of truth.
last_audited: 2026-07-31
owners:
  - engineering
domains:
  - shopify
systems:
  - admin-ui
source_paths:
  - internal docs/Shopify Integration/Polaris Web Components Reference.md
related_docs:
  - internal docs/Architecture/Diagrams/Admin UI Frontend Architecture.md
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - polaris
  - web-components
  - admin-ui
keywords:
  - polaris
  - app-home
  - web-components
---

# Polaris App Home Web Components

For all Admin UI components built with Polaris web components, use this as the source of truth:

- `https://shopify.dev/docs/api/app-home/web-components`

When implementing or auditing admin-facing UI in this repo, treat that documentation as the official contract source for:

- Supported `s-*` component APIs and attributes
- Tone/color/variant semantics
- Slot placement and icon/action behavior
- Accessibility, status, and feedback patterns

## Rules applied in Wolfpack Product Bundles

- Prefer Polaris web components (`s-*`) for all Admin UI before custom HTML.
- Use component props from the official App Home reference as canonical for rendering behavior.
- For status/feedback, treat `tone`, `color`, and `variant` values from the reference as authoritative and map them directly to components instead of inventing alternative visual tokens.

## Relevant app-home example reminders

- In banner-like status surfaces, keep component primitives in `s-banner`/`s-badge`/`s-icon`/`s-button` forms unless the App Home documentation explicitly permits custom HTML alternatives.
- Use the documented tone and style tokens (critical/info/success, subdued/strong, etc.) as the first-class control surface for merchant-facing emphasis.
