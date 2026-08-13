---
schema_version: 1
id: storefront-design-director-wolfpack-pilot-prompt
title: Storefront Design Director Wolfpack Pilot Run
type: prompt-pack
status: active
summary: Defines a controlled Wolfpack pilot workflow for exercising the storefront design director skill.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - storefront-design-director-prompt-pack/05-wolfpack-pilot-run-prompt.md
related_docs:
  - storefront-design-director-prompt-pack/README.md
tags:
  - prompt
  - pilot
keywords:
  - storefront-design-director
  - wolfpack
---

# Prompt 5 — Wolfpack pilot run

Use this prompt to test the completed skill on one real, bounded Wolfpack component without allowing the design-director to modify production code.

---

Invoke:

```text
$storefront-design-director
```

Start a new design job for:

```text
Product: Wolfpack Product Bundles
Family: FPB
Template: Classic
Component slice: Desktop summary sidebar plus its mobile summary tray/footer counterpart
Mode: Existing component redesign and implementation handoff
```

## Pilot objective

Validate that the skill can guide a complete design-to-Codex workflow for a stateful, responsive storefront component and later validate the implementation through Chrome DevTools MCP.

## Known architectural risk to verify, not assume

The current implementation may distribute presentation ownership across:

- runtime-injected styles from JavaScript
- a shared full-page stylesheet
- a template/preset-specific stylesheet
- shared rendering and business-state code

Inspect the current repository and produce an evidence-based ownership map. Do not hard-code paths from old documentation, and do not modify production code.

## Required pilot states

### Desktop sidebar
- empty
- one selected product
- partially filled
- minimum reached
- between discount tiers
- discount tier reached
- final tier reached
- discounted total
- long product title
- product with variant
- quantity greater than one
- long list and scroll
- loading/skeleton
- CTA disabled
- CTA enabled
- remove product
- clear all

### Mobile tray/footer
- collapsed empty
- collapsed partial
- collapsed complete
- expanded empty
- expanded partial
- expanded complete
- expanded long list
- safe-area inset
- narrow width
- wide mobile
- CTA disabled
- CTA enabled
- backdrop or close behavior where applicable

## Required viewport matrix

```text
320 × 720
360 × 800
390 × 844
414 × 896
768 × 1024
1024 × 768
1280 × 800
1440 × 900
1536 × 960
```

The skill may reduce captures after proving equivalence, but it must test transformation boundaries and preserve a documented rationale.

## Required design concerns

- sidebar relationship to product grid
- sticky behavior
- fixed height versus content growth
- selected-product row anatomy
- product image fit
- product title truncation
- variant and quantity treatment
- progress copy and track
- one-tier and multiple-tier behavior
- total hierarchy
- original/final price
- CTA hierarchy
- empty/skeleton treatment
- long-list scroll
- mobile expanded/collapsed transitions
- body padding so fixed tray does not cover content
- safe-area inset
- focus-visible
- keyboard operation
- accessible expand/collapse state
- remove/clear accessibility
- no color-only state
- no horizontal overflow
- merchant-configurable colors and tokens
- no unexpected change to other templates

## First-turn behavior

Do not dump the entire questionnaire.

The first response must:

1. create a design job ID
2. show the status block
3. state the interpreted scope
4. list the smallest useful first screenshot batch
5. give exact capture dimensions and instructions
6. ask no more than three questions
7. recommend whether to begin with desktop or mobile and explain why
8. create the initial design-job artifacts

## Screenshot request order

Start with:

1. current Classic desktop at 1440 × 900
2. target/inspiration desktop at comparable width
3. current Classic mobile at 390 × 844

Do not request every state immediately.

After receiving references:

- classify and validate them
- identify what is observable and what remains unknown
- create the visual audit
- generate controlled design directions
- obtain explicit approval
- expand the approved direction into the complete state and responsive contract
- build the handoff package
- validate the handoff
- stop before production implementation

## Post-implementation phase

When implementation is available, resume the same job and run Chrome QA.

The Chrome QA must include:

- exact viewports
- semantic interactions
- in-page geometry and overflow assertions
- accessibility-tree snapshots
- keyboard testing
- console inspection
- network inspection
- element and contextual screenshots
- approved baseline comparison
- diff artifacts
- sibling-template non-regression
- Lighthouse accessibility/best-practices checks
- performance trace if layout, image loading, CSS injection, or interaction work changed
- measured remediation list
- full rerun before approval

## Pilot success criteria

The pilot succeeds only if:

- job state survives across turns
- the user is guided incrementally
- screenshot quality problems are caught
- all relevant states are specified
- desktop/mobile transformation is explicit
- repository ownership is mapped
- handoff is implementable
- production code remains unchanged
- Chrome QA cannot falsely pass
- test artifacts are saved
- final approval requires objective evidence
- sibling templates are protected

At the end of the design phase, produce a pilot retrospective identifying gaps in the skill and patch the skill before declaring the pilot successful.

Begin the pilot now.

---
