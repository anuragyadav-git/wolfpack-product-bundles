---
schema_version: 1
id: fpb-ppb-step-title-prototype-decision
title: FPB and PPB Step Title Prototype Decision
type: design-decision
status: complete
summary: Records why a standalone prototype is unnecessary for the approved production-owned Step Title redesign.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - design-jobs/fpb-step-title-redesign-20260827/direction-comparison.md
  - app/routes/root/settings-design-preview-frame/route.tsx
related_docs:
  - design-jobs/fpb-step-title-redesign-20260827/responsive-contract.md
tags:
  - prototype
  - not-applicable
keywords:
  - production-renderer
  - preview-parity
---

# Prototype Decision

Artifact job ID: fpb-step-title-redesign-20260827
Artifact revision: 2
Artifact status: complete

A standalone prototype is not applicable. Direction A changes a non-interactive heading's semantic ownership, typography, spacing, and wrapping. The Settings Design isolated preview already mounts deterministic fixtures through the exact production FPB/PPB controllers and CSS manifests, so that renderer is the authoritative implementation and QA surface.

Creating a parallel prototype would duplicate the component tree and weaken the no-drift requirement. Remaining questions are implementation and browser-verification questions, not interaction or responsive ambiguities.
