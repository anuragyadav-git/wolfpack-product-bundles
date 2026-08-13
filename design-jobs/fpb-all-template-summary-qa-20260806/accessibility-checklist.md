---
schema_version: 1
id: storefront-design-director-accessibility-template
title: Accessibility Checklist Template
type: design-job-template
status: complete
summary: Defines the accessibility acceptance checklist and separates completed contract coverage from browser evidence still required after implementation.
last_audited: 2026-08-05
owners:
  - Aditya Awasthi
domains:
  - accessibility
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/accessibility-checklist.md
related_docs:
  - .agents/skills/storefront-design-director/references/interaction-and-accessibility.md
tags:
  - template
keywords:
  - accessibility
  - focus
---

# Accessibility Checklist

Artifact job ID: fpb-all-template-summary-qa-20260806
Artifact revision: 3
Artifact status: approved

## Contract coverage

- [x] Native semantic controls and configured/localized accessible-name sources defined for disclosure, clear, remove, box selection, back, next, cart, and confirmation.
- [x] Selected, expanded, disabled, invalid, and busy state exposure defined.
- [x] Keyboard activation and logical task order defined for every summary control.
- [x] Focus-visible, removal fallback, dialog restoration, and responsive-replacement focus behavior defined.
- [x] Selection, qualification, error, and availability meaning cannot rely on color alone.
- [x] A coalesced summary status owner is defined for meaningful count, total, tier, and error changes.
- [x] Filled images use selected-product identity; decorative empty-slot icons use empty alternative text.
- [x] IDs/relationships must be unique per widget instance and stable across tray toggles.
- [x] 320px, 200% zoom, long localization, large currency, and internal overflow requirements defined.
- [x] Reduced-motion behavior defined for tray, caret, progress, pulse, skeleton, and confirmation.
- [x] The sticky mobile tray is explicitly non-modal; the clear confirmation has full dialog semantics.

## Post-implementation evidence required

- [ ] Fresh accessibility-tree snapshots for desktop sidebar and mobile tray collapsed/expanded in every preset.
- [ ] Keyboard-only completion: expand, review, remove/blocked remove, clear/cancel, box switch, Back, Next, and Add to Cart.
- [ ] Focus remains visible and unclipped in desktop overflow, mobile overflow, 320px, tablet portrait, and 200% zoom.
- [ ] Collapsed review is inert, `aria-hidden`, and absent from sequential focus; desktop/mobile replacements are mutually exclusive.
- [ ] Disclosure `aria-expanded` and review visibility stay synchronized during rapid toggle and resize.
- [ ] Clear confirmation has dialog name/description, least-destructive initial focus, contained Tab order, Escape, and focus restoration.
- [ ] Busy/duplicate-submit and failure-recovery paths expose state and preserve selections.
- [ ] Live announcements are useful and non-duplicative for selection, total, tier, offer pulse, and error changes.
- [ ] Automated desktop and mobile accessibility scans have no untriaged serious/critical findings.
- [ ] Contrast is measured for text, controls, focus, disabled state, progress, success, and error across configured merchant colors.
- [ ] Reduced-motion run reaches identical final states without decorative animation or delayed content access.

## Known risks, browser evidence, and validation status

- Current risk: mobile disclosure has `aria-expanded` and inert synchronization, but collapse while focus is inside needs explicit focus recovery proof.
- Current risk: per-template CSS overlaps common mobile tray geometry and may clip focus or create contradictory hidden/visible states at 768/1024 boundaries.
- Current risk: disabled-action behavior differs by preset; implementation must preserve recoverable feedback while exposing a consistent semantic state.
- Current risk: transient additional-offer text is currently visual timer state and needs one concise accessible announcement without changing disclosure identity.
- Current risk: responsive renderer rebuilds summary DOM; implementation must prove no duplicate listeners, repeated pulse, or lost focus/state.
- Validation status: contract complete; all browser and automated evidence remains pending until implementation returns.


Successor provenance: inherited unchanged from `fpb-all-template-summary-20260804` revision 2. The successor changes only the fresh browser-evidence coverage and any remediation directly found by that execution.
