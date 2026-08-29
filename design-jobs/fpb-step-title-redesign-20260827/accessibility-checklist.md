---
schema_version: 1
id: fpb-ppb-step-title-accessibility-checklist
title: FPB and PPB Step Title Accessibility Checklist
type: design-checklist
status: complete
summary: Tracks semantic heading, navigation naming, wrapping, focus preservation, and preview accessibility requirements for Step Title.
last_audited: 2026-08-27
owners:
  - Aditya Awasthi
domains:
  - accessibility
systems:
  - storefront-design-director
source_paths:
  - design-jobs/fpb-step-title-redesign-20260827/interaction-contract.md
  - design-jobs/fpb-step-title-redesign-20260827/responsive-contract.md
related_docs:
  - .agents/skills/storefront-design-director/references/interaction-and-accessibility.md
tags:
  - fpb
  - ppb
  - step-title
keywords:
  - accessibility
  - focus
  - heading-order
---

# Accessibility Checklist

Artifact job ID: fpb-step-title-redesign-20260827
Artifact revision: 2
Artifact status: complete

- [x] Contract requires a contextual heading for non-empty Step Title and no empty heading node.
- [x] Navigation and dialog accessible names use Step Name, not long Step Title content.
- [x] Existing selected, current, expanded, disabled, invalid, and busy state owners remain unchanged.
- [x] Heading introduces no focus stop; existing keyboard order and focus-visible treatment remain unchanged.
- [x] PPB dialog label, focus trap, Escape, close, and focus return remain unchanged.
- [x] No status is conveyed by the heading color or ornament.
- [x] No new live announcement is introduced for user-initiated step changes.
- [x] Image alternative text is not applicable; title has no media.
- [x] No new IDs are required; existing dialog ID remains unique.
- [x] Contract requires long-content and 200% zoom reflow without clipping or horizontal scrolling.
- [x] Direction A introduces no motion.
- [ ] Fresh accessibility-tree and keyboard evidence pending implementation.

## Known risks, browser evidence, and validation status

- Risk: the host theme's document outline may already contain multiple heading levels. The widget uses a contextual `h2` consistently beneath the bundle/page `h1`; Chrome accessibility snapshots must confirm the resulting outline in FPB, PPB, and the isolated preview.
- Risk: a dynamically replaced PPB body heading must not steal focus or become the dialog label.
- Validation status: contract complete; post-implementation Chrome validation pending.
