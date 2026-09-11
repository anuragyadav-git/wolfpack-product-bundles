---
schema_version: 1
id: polaris-app-home-web-components
title: Polaris App Home Web Components Reference
type: reference
status: authoritative
summary: Canonical source for Polaris web component usage and durable design decisions in the Wolfpack admin UI, with Shopify App Home web components as the source of truth.
last_audited: 2026-09-11
owners:
  - engineering
domains:
  - shopify
systems:
  - admin-ui
source_paths:
  - internal docs/Shopify Integration/Polaris Web Components Reference.md
  - app/routes/app/app.attribution/AttributionDateRangeControls.tsx
  - app/routes/app/app.attribution/AttributionDashboard.tsx
  - app/routes/app/app.attribution/OfferAnalyticsCard.tsx
  - app/routes/app/app.attribution/AttributionRouteShell.tsx
  - app/routes/app/app.settings/SettingsLandingShell.tsx
  - app/routes/app/app.bundles.create/BundleTypeSelectionCard.tsx
  - app/routes/app/_shared/bundle-configure/CommonConfigureShell.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ImagesGifsPanel.tsx
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
- Give each interaction exactly one action owner. When an entire tile or row is
  selectable, make the surface an `s-clickable` and keep its descendants
  non-interactive. Do not nest an `s-button`, link, or second clickable inside
  it. Use an `s-button` instead when only the compact command should activate.
- Use component props from the official App Home reference as canonical for rendering behavior.
- For status/feedback, treat `tone`, `color`, and `variant` values from the reference as authoritative and map them directly to components instead of inventing alternative visual tokens.
- Use `commandFor` with `s-popover`, `s-menu`, and `s-modal` so Shopify owns
  opening, dismissal, focus, and keyboard behavior. Do not add document-level
  outside-click listeners for these overlays. Interactive filter or preset
  pills use `s-clickable-chip`; route state continues to own only the selected
  value and resulting navigation or mutation.

## Admin UI design philosophy and durable decisions

This file is the single authority for cross-Admin visual composition decisions.
Record new durable Admin UI design principles here rather than scattering them
across feature notes. Feature architecture documents may link to this reference
and document feature-specific exceptions, but must not establish a conflicting
global pattern.

Admin surfaces should communicate hierarchy through consistent alignment before
adding decoration. For any card or content-group header with an icon:

- Keep the icon and title inline in the same row.
- Put the description in the title's content column, immediately below the
  title, so both begin at the same inline position.
- Put a contextual badge or compact action in a trailing `auto` grid column on
  that header row.
- Compose the pattern with an outer two-column `s-grid` and a nested two-column
  `s-grid` (`auto minmax(0, 1fr)`) containing the icon plus a block `s-stack` for
  title and description. The explicit inner grid prevents the copy column from
  wrapping below the icon at narrow widths. Do not make icon, copy, and trailing
  context three independent columns of the outer grid.
- Use an `s-heading` when the title establishes a semantic section boundary;
  use strong `s-text` only for a subordinate card label beneath an existing
  section boundary.

An icon used as a centered illustration, empty-state graphic, status indicator,
or control affordance is not a header icon and does not need to follow this
composition. The distinction is semantic: if the icon visually introduces the
adjacent title, it is part of the header row.

When a card heading and its only form control use the same label, keep the
Polaris `s-heading` as the single visible section label and set the control's
`labelAccessibilityVisibility="exclusive"`. The control retains its
programmatic label without repeating the same copy for merchants. FPB and PPB
Bundle Status share this contract.

## Layout and structure ownership

Use the smallest documented Polaris layout primitive that owns the required
behavior:

| Component | Wolfpack ownership rule |
|---|---|
| `s-page` | Own the ordinary route page structure and width. Use `inlineSize="large"` for data-rich pages; retain a custom workspace shell only when the route has a demonstrated structure that `s-page` cannot express. |
| `s-section` | Group semantically related content. Give it a heading when the group needs a navigable section boundary; do not nest sections more than two or three levels. |
| `s-box` | Apply native padding, border, background, size, or accessibility properties to one container. It is not a substitute for a multi-item layout. |
| `s-stack` | Arrange a simple one-dimensional block or inline group with native gap, alignment, wrapping, and distribution. |
| `s-grid` and `s-grid-item` | Own rows, columns, matrices, and documented responsive tracks. Use `s-grid-item` only when a child needs explicit placement or spanning. |
| `s-query-container` | Establish component-width responsive containment. Give the container a descriptive name when multiple containers can coexist, and put responsive Polaris prop values on descendants. Do not add a query container when page viewport media queries are sufficient. |
| `s-divider` | Provide visual separation without inventing a semantic section. Use `s-section` instead when content forms a meaningful group. |

Polaris layout components receive only properties documented by Shopify. Do not
push a CSS-module `className` through an `as any` spread. When app-specific CSS
is still required, a normal HTML wrapper owns that isolated gap and the nested
Polaris component retains its native responsibility. In particular,
`s-query-container` is the sole owner of its `containerName`; do not duplicate
that name with a CSS `container-name` declaration on a wrapper. Shopify's
responsive `@container` syntax belongs on supported Polaris component props;
do not write app CSS `@container` rules against `s-query-container`. Use an
ordinary viewport media query when custom CSS must respond to the embedded app
width.

The shared configure canvas is a documented complex-grid exception. On desktop,
its sticky sidebar and supplemental placement content form one rail beside the
main editor; on mobile, the supplemental content moves after the editor while
the navigation stays before it. A single `s-grid` cannot preserve both grouping
and responsive reading order without duplicating content, so
`CommonConfigureShell` keeps its scoped HTML grid/flex wrappers inside one named
`s-query-container`. Its fields, actions, feedback, and ordinary content groups
continue to use Polaris components.

For any sticky Admin rail, put the route's bottom safe area on the rail's actual
sticky containing layout, not on an ancestor outside that containing block.
Otherwise, expanding content near the end of the page changes the sticky bottom
constraint and makes the rail appear to jump even though its top alignment did
not change. Keep the safe area content-neutral and reuse the route's existing
spacing rather than adding a disclosure-specific offset or scroll correction.

Official layout references:

- `https://shopify.dev/docs/api/app-home/latest/web-components/layout-and-structure/page`
- `https://shopify.dev/docs/api/app-home/latest/web-components/layout-and-structure/section`
- `https://shopify.dev/docs/api/app-home/latest/web-components/layout-and-structure/box`
- `https://shopify.dev/docs/api/app-home/latest/web-components/layout-and-structure/stack`
- `https://shopify.dev/docs/api/app-home/latest/web-components/layout-and-structure/grid`
- `https://shopify.dev/docs/api/app-home/latest/web-components/layout-and-structure/grid-item`
- `https://shopify.dev/docs/api/app-home/latest/web-components/layout-and-structure/query-container`
- `https://shopify.dev/docs/api/app-home/latest/web-components/layout-and-structure/divider`

## Alert decision rules

- Put validation errors inline beside the field or control that can resolve them.
- Use a contextual `s-banner` for task or system failures that merchants must notice or act on. Supply a concise `heading`, a supported `tone`, merchant-safe body copy, and a recovery action when one is available.
- Treat an error as transient only when it belongs to one discrete attempt, leaves no invalid or broken state behind, and a fresh retry starts cleanly. These retryable picker, launch, export, backfill, toggle, or similar operation failures can use a concise App Bridge error toast.
- Treat save failures, unresolved validation, missing configuration, missing placement, and broken embedded surfaces as persistent. Keep them inline or in a contextual banner until dismissed or resolved.
- Give every banner block spacing above or below with a Polaris `s-box` wrapper so it does not touch adjacent content.
- Make informational banners dismissible. Prefer ordinary `s-box`, `s-paragraph`, spinner, or status content when the message is static guidance or a loading state.
- Keep success and transient error toasts concise and merchant-safe. Success messages should remain three words or fewer.
- Use success banners only when confirmation is delayed, must persist, or includes a next action.

## Clickable tile rendering gotcha

For image-backed clickable tiles, group the image and body under one Polaris
layout child, such as an `s-stack`. Agent-store verification on 2026-09-10
showed that supplying the image and body as direct sibling children caused the
body content to disappear even though the clickable remained in the
accessibility tree. The grouped structure rendered both content regions and
retained one accessible action owner.

Official UX guidance:

- `https://shopify.dev/docs/apps/design/user-experience/alerts`
- `https://shopify.dev/docs/api/app-home/web-components/feedback/banner`

## Relevant app-home example reminders

- In banner-like status surfaces, keep component primitives in `s-banner`/`s-badge`/`s-icon`/`s-button` forms unless the App Home documentation explicitly permits custom HTML alternatives.
- Use the documented tone and style tokens (critical/info/success, subdued/strong, etc.) as the first-class control surface for merchant-facing emphasis.
