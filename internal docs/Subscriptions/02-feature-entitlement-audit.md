---
schema_version: 1
id: feature-entitlement-audit
title: Feature Entitlement Audit
type: product-audit
status: authoritative
summary: Records the approved Free and Growth boundary for every monetized Only Bundles surface.
last_audited: 2026-08-28
owners:
  - product
  - engineering
domains:
  - subscriptions
systems:
  - admin
  - storefront
source_paths:
  - app/lib/subscriptions/entitlements.ts
  - app/lib/bundle-config/template-selection.ts
  - app/routes/app/app.attribution.tsx
related_docs:
  - internal docs/Subscriptions/03-entitlement-decision-matrix.csv
  - internal docs/Subscriptions/05-pricing-decision-record.md
tags:
  - entitlements
  - product
keywords:
  - Free
  - Growth
---

# Feature Entitlement Audit

## Approved monetized capabilities

| Capability | Free | Growth | Rationale |
|---|---|---|---|
| Public bundles | One Active or Unlisted bundle across FPB/PPB | Unlimited | Scale gate; one complete Free outcome remains possible |
| Enabled steps/categories | Two for FPB and PPB | Unlimited | Scale gate shared by both builders |
| FPB templates | Standard | All four | Premium visual choice |
| PPB templates | Product List | All four | Premium visual choice |
| Settings Design | Five brand colors and primary/secondary/body typography | All controls | Basic brand fit remains Free |
| Analytics | Fixed 30-day aggregate views, orders, revenue, conversion | Full existing workspace | Advanced measurement is a Growth value surface |
| Support | Standard | Priority | Service-level differentiation |

Advanced Design consists of discount-feedback colors, corners, images/GIFs, and expert/component colors. Custom CSS, scripts, and selector controls remain Free because only the advanced Design page is gated.

## Explicitly Free

Drafts and safe preview, FPB and PPB, product/variant/category selection, quantity logic, all discount methods and tiers, progress, free gifts, add-ons, upsells, default included products, customer selling plans, translations, copy, integrations, custom code, cart/checkout correctness, and standard support remain Free.

## Non-monetizable obligations

Security, authentication, authorization, HMAC/signature validation, data protection, accessibility, keyboard/focus support, mobile responsiveness, inventory/product compatibility, cart and checkout correctness, performance, theme compatibility, uninstall cleanup, compliance, and bug fixes cannot become entitlement checks.

## Draft/public policy

- Drafts are unlimited and may save Growth-required bundle configuration.
- Signed previews may render Draft configuration without writing public storefront state.
- A Free public bundle cannot save a Growth-only change unless it is demoted to Draft in the same action.
- Advanced global Design changes can be previewed locally on Free but cannot be persisted.
- Tracking data continues for both plans; only query/detail access is gated so a later upgrade retains historical value.
