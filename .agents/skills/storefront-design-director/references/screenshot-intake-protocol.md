---
schema_version: 1
id: storefront-design-director-screenshot-intake
title: Screenshot Intake Protocol
type: skill-reference
status: active
summary: Classifies, validates, and records screenshot evidence for comparable storefront design work.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/screenshot-intake-protocol.md
related_docs:
  - .agents/skills/storefront-design-director/SKILL.md
tags:
  - screenshots
keywords:
  - viewport
  - provenance
---

# Screenshot Intake Protocol

## Roles

Assign one or more roles to every image: CURRENT, TARGET, INSPIRATION, CONTEXT, STATE, MOBILE, TABLET, DESKTOP, IMPLEMENTATION, APPROVED_BASELINE, or REGRESSION_RESULT.

## Required inventory fields

Record stable ID, original filename, local artifact path, role, component, state, viewport width and height with known or estimated status, browser zoom, pixel dimensions, crop status, surrounding context, provenance, intended use, quality issues, comparable counterparts, permissions or usage notes, and approval status.

Intended use is one of exact match, structural reference, or inspiration. Do not treat inspiration as an exact geometry contract.

## Quality checks

For every image answer:

- Is the whole component visible with enough page context for alignment?
- Is it distorted, scaled, compressed, cropped, or inside a device frame?
- Is browser chrome included?
- Is zoom known to be 100 percent?
- Are counterpart screenshots captured at comparable CSS widths?
- Are fonts, product images, and application hydration complete?
- Is the state identifiable?
- Are overlays, sticky bars, tooltips, and safe areas visible when relevant?
- Is copy legible?
- Is geometry measurable?

Use scripts/inspect_reference_images.py to record file metadata and hashes. Its viewport estimate is not fact. Pixel dimensions can differ from CSS viewport because of DPR, scaling, and capture tooling.

## Capture request

Request exact viewport dimensions, browser zoom at 100 percent, explicit DevTools docking state, stable fixture data, loaded fonts and images, full component with limited context, no device frame, no obscuring cursor, and one state per image unless it is a labeled board.

Use:

~~~text
<job-id>__<role>__<component>__<state>__<width>x<height>__r<revision>.png
~~~

## Comparability decision

If width, state, zoom, crop, or content differs, list what remains safely inferable, what is uncertain, which comparison would mislead, and the smallest corrected capture needed. Block exact geometry approval when the missing data could change the judgment.
