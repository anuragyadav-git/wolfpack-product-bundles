---
schema_version: 1
id: storefront-design-director-interaction-accessibility
title: Interaction and Accessibility Contract
type: skill-reference
status: active
summary: Defines semantic, keyboard, focus, announcement, motion, and recovery requirements for storefront interactions.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - accessibility
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/interaction-and-accessibility.md
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/accessibility-checklist.md
tags:
  - accessibility
keywords:
  - keyboard
  - focus
  - aria
---

# Interaction and Accessibility

For each interactive element define semantic element, accessible name source, current or selected state, disabled behavior, keyboard activation, pointer behavior, focus-visible treatment, target size, busy state, error association, and state announcement.

- Use native controls where semantics fit.
- Do not communicate selection, error, or availability by color alone.
- Preserve logical task-order focus after visual reordering.
- Make focus visible against every surface and state.
- Expose selected, current, expanded, pressed, disabled, invalid, and busy state.
- Keep disabled reasons perceivable when recovery is needed.
- Use native Enter and Space behavior.
- Ensure quantity controls have unique names and enforce limits without duplicate updates.
- Announce meaningful total, selection, tier, and error changes without excessive chatter.
- Respect reduced motion.

For modals define trigger, initial focus, containment, close button, Escape, backdrop, scroll lock, focus return, nested selection, and error focus.

For responsive replacements define shared state owner, mutually exclusive exposure, focus movement, expanded relationship, safe area, virtual keyboard behavior, and CTA non-overlap.

Validate with fresh accessibility-tree snapshots, keyboard-only completion, exposed names and state, automated audit, and manual interaction review.
