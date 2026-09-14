---
schema_version: 1
id: storefront-design-director-accessibility-template
title: Accessibility Checklist Template
type: design-job-template
status: active
summary: Tracks semantic, keyboard, focus, announcement, contrast-risk, error, and motion requirements.
last_audited: 2026-08-03
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

Artifact job ID: storefront-variant-selectors-across-product-cards-and-modal-20260911
Artifact revision: 2
Artifact status: complete

- [x] The approved design contract requires native dropdown semantics with visible labels and disabled unavailable options.
- [ ] Every non-dropdown option dimension is one named radio group with one radio per value.
- [ ] Accessible names use canonical Shopify option/value labels and include unavailable status where applicable.
- [ ] Checked, expanded, disabled, invalid, and busy states are exposed only when applicable; no fabricated selector busy state.
- [ ] Keyboard-only users can enter each group, traverse values, choose a variant, change quantity, Add, and close overlays in logical source order.
- [ ] Focus-visible treatment is visible against every card/modal surface and is not clipped at selector or card edges.
- [ ] Rerender after selection preserves or restores focus to the chosen control; overlay close restores the exact trigger.
- [ ] Selected and unavailable states are not color-only. Color/image modes keep a persistent selected-value label.
- [ ] Variant changes announce the selected value without duplicating every downstream price/inventory announcement.
- [ ] Existing stock, hydration, and Add errors remain associated with their canonical feedback owner.
- [ ] Shopify swatch images are decorative within an already named control; missing media produces a neutral labeled control, not broken or fabricated alternative text.
- [ ] Product and option-derived IDs and radio-group names are unique across repeated cards, steps, categories, and modal copies.
- [ ] Controls retain at least a 44px hit target at narrow widths and 200% zoom.
- [ ] Long labels and at least twelve values remain operable without horizontal selector scrolling or hidden choices.
- [ ] FPB modal, PPB picker, and FPB selector drawer preserve dialog name, initial focus, containment, close control, Escape, backdrop policy, scroll lock, and focus return.
- [ ] Mutually exclusive responsive replacements never leave duplicate interactive controls in the accessibility tree.
- [ ] Tooltips supplement rather than replace labels and work on focus; touch users retain persistent selected text.
- [ ] Reduced-motion mode removes nonessential transitions without removing state feedback.
- [ ] Automated Lighthouse/accessibility findings are manually triaged against fresh accessibility-tree snapshots and keyboard evidence.

## Known risks, browser evidence, and validation status

- Current risk: FPB's existing button presentation and overflow panel do not yet provide the approved all-values intrinsic matrix or confirmed radio semantics.
- Current risk: PPB color tooltip positioning uses runtime measurements and must be verified at card edges, high zoom, and coarse-pointer widths without exposing it as the only label.
- Current risk: rerendering card markup may replace a focused input; implementation must explicitly preserve focus identity.
- Current risk: duplicate product cards or simultaneous card/modal instances can collide if DOM IDs/group names are not scoped by surface and product instance.
- Current risk: the multi-variant fixture does not currently persist, so none of these selector semantics are yet proven live.
- Required browser evidence: accessibility-tree names/roles/states, keyboard-only completion, focus screenshots, modal/drawer focus return, 200% zoom, reduced motion, and Lighthouse accessibility audit for representative FPB and PPB surfaces.
- Validation status: The semantic design requirement is verified; implementation-dependent checkboxes remain intentionally unchecked until post-implementation Chrome evidence exists.
