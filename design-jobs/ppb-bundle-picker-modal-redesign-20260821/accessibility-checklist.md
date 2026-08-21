---
schema_version: 1
id: storefront-design-director-accessibility-template
title: Accessibility Checklist Template
type: design-job-template
status: active
summary: Tracks semantic, keyboard, focus, announcement, contrast-risk, error, and motion requirements.
last_audited: 2026-08-21
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

Artifact job ID: ppb-bundle-picker-modal-redesign-20260821
Artifact revision: 6
Artifact status: complete

- [x] Correct semantics and accessible-name contract defined.
- [x] Existing selected, current, disabled, invalid, and busy state exposure preserved.
- [x] Keyboard-only completion and Tab containment defined.
- [x] Focus-visible, clipping, and restoration requirements defined.
- [x] State and errors remain non-color-only.
- [x] Existing selection and error announcements are preserved.
- [x] Existing product-image alternative-text policy is preserved.
- [x] Dynamic title ID is unique per mounted picker.
- [x] High zoom and long content remain operable through catalog-only scrolling.
- [x] Reduced motion is defined.
- [x] Product image is the only details trigger; title and card background are non-interactive.
- [x] Native grouped-variant selector has a visible desktop label and a visually hidden mobile label with the same accessible name.
- [x] Add, quantity, maximum-reached remove-all, and details Add/Update have product-specific accessible names.
- [x] Filled-slot names wrap and may visually clamp only at the approved maximum height; the complete name remains programmatically available and visible in product details.
- [x] The overlaid cross badge is a native button with a compact visual treatment, at least a 44px target, visible focus, and a localized product-specific accessible name.
- [x] Picker and product details each have unique labels and only the topmost sheet traps focus.
- [x] Escape, backdrop, close, and swipe dismiss exactly one layer and preserve shared scroll-lock lifetime.
- [x] Magnifier discovery is available on hover, focus-visible, and touch without becoming a separate focus target.
- [ ] Automated findings manually triaged in post-build Chrome QA.

## Known risks, browser evidence, and validation status

Risks are stacked-sheet Escape/backdrop/swipe ownership, hidden labels or breakpoint controls entering the wrong accessibility state, rerendered exact-trigger identity, native-selector option availability, and footer overlap. Automated behavior tests must cover containment, no-mutation variant changes, one-mutation Add/Update, remove-all, and restoration; direct Chrome keyboard/accessibility-tree review remains required after build. Contract status: complete; browser validation pending.
