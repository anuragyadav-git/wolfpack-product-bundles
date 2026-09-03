---
schema_version: 1
id: bundlex-public-website-audit
title: Bundlex Public Website and Demo Audit
type: competitor-analysis
status: verified
summary: Records reusable interaction lessons and non-copying boundaries from the Bundlex public website and demo.
last_audited: 2026-09-03
owners:
  - product
  - engineering
domains:
  - website
  - storefront
systems:
  - marketing-site
  - interactive-demo
source_paths:
  - apps/OnlyBundles-website/
related_docs:
  - internal docs/Architecture/Public Website.md
  - docs/competitor-analysis/21-bundlex-urgency-swatches-tier-badges.md
tags:
  - competitor-research
keywords:
  - Bundlex
  - demo configurator
---

# Bundlex Public Website and Demo Audit

## Evidence reviewed

The 2026-09-03 desktop audit covered `bundlex.io`, `bundlex.io/demo`, its pricing
page, feature navigation, and an individual mix-and-match feature page. Existing
390x844 evidence in the repository supplied the mobile reference because the
current Chrome host did not complete an actual window resize; implementation QA
must therefore capture a fresh real 390x844 pass.

## Strong interaction patterns

- The demo establishes control-to-preview causality immediately. Offer, layout,
  and palette choices visibly change one stable preview rather than opening
  separate examples.
- Progressive disclosure keeps the first decision small before exposing detailed
  content, badge, urgency, and localization controls.
- Scenario presets make several related capabilities understandable without
  requiring visitors to configure every field manually.
- Product cards, tier selection, gifts, and layout changes can be exercised
  directly, so the page demonstrates behavior rather than relying only on claims.

## Boundaries that must not be copied

- Do not reuse the lavender/pink gradient identity, floating serum-card
  composition, section wording, testimonial presentation, or "everything in one
  widget" positioning.
- Bundlex's single-product offer taxonomy does not represent Only Bundles' two
  storefront surfaces or guided multi-step model.
- Its free-pricing position and public social proof are not Only Bundles claims.
- Several observed toggle/tab controls did not expose reliable selected state.
  Only Bundles controls must use semantic buttons, radios, or tabs with state
  announced to assistive technology.
- Query-driven sharing is a generic interaction pattern; parameter names and
  state semantics must describe Only Bundles rather than mirror competitor code.

## Only Bundles direction

The public story begins with Full-page versus Product-page bundles. The demo then
lets a visitor choose one of the four compatible templates, explore guided,
mix-and-match, merchandising, and campaign scenarios, and shop a fictional
North & Pine preview. Deep green, sage, cream, and coral replace competitor
colors. Discounts, gifts, add-ons, selling plans, scheduling, country targeting,
and analytics appear only where confirmed by current application evidence.

The demo is intentionally a static simulator rather than a copy of the
production widget. It must never call a merchant store, create a cart, imply a
real inventory state, or reset a fake countdown.
