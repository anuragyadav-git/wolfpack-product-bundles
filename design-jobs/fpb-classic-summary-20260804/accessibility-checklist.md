---
schema_version: 1
id: fpb-classic-summary-accessibility-checklist
title: FPB Classic Summary Accessibility Checklist
type: design-contract
status: complete
summary: Records accessibility requirements and later browser-validation gates for the Calm Review Panel.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - accessibility
systems:
  - storefront-design-director
source_paths:
  - design-jobs/fpb-classic-summary-20260804/interaction-contract.md
  - design-jobs/fpb-classic-summary-20260804/state-matrix.md
related_docs:
  - .agents/skills/storefront-design-director/references/interaction-and-accessibility.md
tags:
  - fpb
  - classic
  - accessibility
keywords:
  - accessibility
  - focus
---

# Accessibility Checklist

Artifact job ID: fpb-classic-summary-20260804
Artifact revision: 1
Artifact status: complete

Legend: checked means the requirement is defined in the approved design contract. It does not claim implementation QA has passed.

- [x] Correct semantics and accessible names are required for Clear, remove, disclosure, tier, navigation, confirmation, and submit controls.
- [x] Selected, current, expanded, pressed, disabled, invalid, and busy state exposure is specified.
- [x] Keyboard-only completion follows DOM task order with native Enter/Space behavior.
- [x] Focus-visible must contrast against all surfaces, remain unclipped, and return from Clear confirmation.
- [x] Selection, completion, disabled, tier, and error states have non-color communication.
- [x] Dynamic totals, tiers, selections, and errors use concise, deduplicated announcements.
- [x] Product images retain meaningful selected-product alternatives; decorative placeholders/icons use empty alternatives.
- [x] Disclosure target, status associations, and any error relationships require stable unique IDs.
- [x] 200% zoom, 320px width, long content, wide currency, and long lists remain operable.
- [x] Reduced motion is explicitly defined without suppressing state feedback.
- [x] Automated accessibility findings require manual triage before final approval.

## Known risks, browser evidence, and validation status

- Current live Wolfpack evidence exposes product Add, Clear, remove, primary action, and mobile disclosure as buttons. The mobile disclosure already reports expanded state.
- Current target EB evidence does not expose product add, Clear, or completion actions as buttons in its accessibility snapshot. Direction A explicitly rejects that semantic behavior.
- Implementation risks: duplicate sidebar/tray exposure at 1024px, clipped focus inside scroll regions, lost focus after removing the final visible row, inaccessible disabled reasons, noisy live announcements, and CTA overlap with safe areas or virtual keyboards.
- Browser validation required: fresh accessibility trees at desktop and mobile; keyboard-only add/review/remove/clear/submit; focus return from confirmation; 200% zoom; reduced motion; automated Lighthouse accessibility audit; manual contrast and target-size review.
- Validation status: design requirements complete; implementation evidence not started and cannot pass until implementation is returned.
