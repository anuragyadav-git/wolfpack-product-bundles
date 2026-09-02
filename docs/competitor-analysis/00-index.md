---
schema_version: 1
id: eb-competitor-analysis-index
title: Competitor Analysis Index
type: index
status: current
summary: Indexes live competitor research, implementation-facing evidence, feasibility analysis, parity matrices, and storefront verification records.
last_audited: 2026-08-30
owners:
  - engineering
domains:
  - competitive-research
systems:
  - eb-reference
  - bogos
  - bundlex
source_paths:
  - docs/competitor-analysis/
related_docs:
  - internal docs/EB Implementation Reference.md
  - internal docs/EB Settings Design Reference.md
tags:
  - competitor-analysis
  - evidence
keywords:
  - easy-bundles
  - bogos
  - bundlex
  - parity
---

# Competitor Analysis Index

**App:** EB | Easy Bundle Builder (by Skai Lama / GiftKart)
**Initial analysis date:** 2026-04-24
**Method:** Live crawl and follow-up audits through Chrome DevTools MCP

---

## Document Index

| File | Coverage |
|------|----------|
| [01-dashboard.md](01-dashboard.md) | Dashboard home, readiness score, navigation structure |
| [02-bundle-creation-flow.md](02-bundle-creation-flow.md) | Full bundle creation wizard (AI, templates, layouts, product selection) |
| [03-bundle-editor.md](03-bundle-editor.md) | Bundle editor — all 8 sidebar panels in detail |
| [04-settings-design.md](04-settings-design.md) | Design Control Panel (colors, typography, corners, images, expert controls) |
| [05-settings-language.md](05-settings-language.md) | Language Configurations (multilanguage, all text label overrides) |
| [06-settings-controls.md](06-settings-controls.md) | Additional Configurations (checkout, CSS, cart messaging, font) |
| [07-analytics.md](07-analytics.md) | Analytics page — metrics, filters, export |
| [08-pricing.md](08-pricing.md) | Pricing tiers and positioning strategy |
| [09-integrations.md](09-integrations.md) | Integrations hub — supported third-party apps |
| [10-success-suite.md](10-success-suite.md) | Your Success Suite — cross-app bundle offering |
| [11-support.md](11-support.md) | Support page — channels, FAQs, onboarding resources |
| [12-strategic-observations.md](12-strategic-observations.md) | Cross-cutting competitive insights and opportunities for Wolfpack |
| [13-wolfpack-gap-analysis-phases.md](13-wolfpack-gap-analysis-phases.md) | **Wolfpack vs EB critical gap analysis — phased implementation roadmap** |
| [14-eb-addon-upsell-analysis.md](14-eb-addon-upsell-analysis.md) | **Full end-to-end crawl: Add-Ons, Theme Extension Banner, Readiness Score, all sidebar sections** |
| [15-single-embed-template-architecture.md](15-single-embed-template-architecture.md) | **How EB-style multi-type, multi-template storefront architecture can work through a single embed/runtime surface** |
| [16-eb-full-data-flow-investigation.md](16-eb-full-data-flow-investigation.md) | **Primary evidence record — live FPB/PPB Admin + storefront capture (9 phases, all gaps resolved). Distilled reference: `internal docs/EB Implementation Reference.md`** |
| [17-eb-complete-configure-e2e-audit.md](17-eb-complete-configure-e2e-audit.md) | **Fresh configure-page E2E audit for FPB and PPB: controls, dependencies, help links, save payloads, storefront effects, and template mappings** |
| [18-category-rules-research.md](18-category-rules-research.md) | Category-rules Admin and storefront evidence |
| [18-eb-settings-integrations-replication-evidence.md](18-eb-settings-integrations-replication-evidence.md) | Settings and integrations replication evidence |
| [19-pdp-widget-placement-parity.md](19-pdp-widget-placement-parity.md) | Historical PDP placement interpretation and its documented supersession |
| [20-bogos-personalization-analytics-offer-operations.md](20-bogos-personalization-analytics-offer-operations.md) | BOGOS personalization, analytics, offer priority, scheduling, and bulk operations evidence |
| [21-bundlex-urgency-swatches-tier-badges.md](21-bundlex-urgency-swatches-tier-badges.md) | Bundlex urgency, swatch-tooltip, sticky-cart, and tier-badge evidence |
| [22-bogos-bundlex-wolfpack-feasibility.md](22-bogos-bundlex-wolfpack-feasibility.md) | Wolfpack adoption feasibility, implementation order, and Shopify constraints |
| [fpb-standard-agentic-parity/SPEC.md](fpb-standard-agentic-parity/SPEC.md) | **Repeatable FPB Standard storefront parity loop: feature matrix, deterministic pairwise run set, stress cases, evidence contract, and verification workflow** |
| [fpb-classic-agentic-parity/SPEC.md](fpb-classic-agentic-parity/SPEC.md) | Repeatable FPB Classic parity plan and evidence contract |
| [fpb-compact-horizontal-agentic-parity/SPEC.md](fpb-compact-horizontal-agentic-parity/SPEC.md) | Combined Compact and Horizontal parity plan and evidence contract |
| [ppb-product-grid-agentic-parity/SPEC.md](ppb-product-grid-agentic-parity/SPEC.md) | PPB Product Grid parity plan and evidence catalog |
| [ppb-product-list-agentic-parity/SPEC.md](ppb-product-list-agentic-parity/SPEC.md) | PPB Product List parity plan and evidence catalog |
| [ppb-horizontal-slots-agentic-parity/SPEC.md](ppb-horizontal-slots-agentic-parity/SPEC.md) | PPB Horizontal Slots parity plan and evidence catalog |
| [ppb-vertical-slots-agentic-parity/SPEC.md](ppb-vertical-slots-agentic-parity/SPEC.md) | PPB Vertical Slots parity plan and evidence catalog |
| [ppb-product-drawer-parity/MATRIX.md](ppb-product-drawer-parity/MATRIX.md) | Cross-template PPB product drawer parity matrix |

## Evidence Notes

Some captures referenced by these documents live outside the repository or were intentionally not committed. Each evidence document defines its own capture location and non-assumption rules. Use `internal docs/EB Implementation Reference.md` for distilled implementation contracts; use this directory when raw evidence or point-in-time parity history is required.

## Key Competitive Highlights

- **AI bundle creation** from a single natural-language prompt
- **Gamified readiness score** (35/100) guides setup completion
- **4 layout types** across full-page and product-page placements
- **Tiered discount engine** with condition-based rules
- **Expert Color Controls** — 20+ individual element color overrides
- **35+ language support** with per-field text override (paid feature)
- **Cross-app "Success Suite"** bundles 5 Skai Lama apps at a discount
- **Intercom live chat** proactively initiated by support agent
- Free plan up to $500/month bundle revenue — zero upfront risk
