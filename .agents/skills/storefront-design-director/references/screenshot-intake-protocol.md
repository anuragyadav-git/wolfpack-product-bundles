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

Treat an inventory as a set of comparison cohorts, not as one all-or-nothing image set. Group exact-comparison candidates by intended use, component/state, CSS viewport or known capture size, zoom, crop, and fixture content. Run `inspect_reference_images.py` separately for each exact-comparison cohort when the inventory intentionally contains desktop, mobile, context, or inspiration images with different dimensions. A valid mobile contextual reference must not make a same-size desktop current/target pair incomparable, and a valid desktop pair must not be used as a false mobile target.

When Chrome DevTools MCP rejects a requested screenshot `filePath`, first check whether the same tool result still returned the complete PNG. If it did, persist those exact returned bytes to the approved design-job artifact path without resizing or recompression, verify PNG dimensions and hash, and remove any transient encoded representation. If no complete image was returned, do not invent a browser or filesystem substitute: preserve the capture intent, record the path restriction, and request or recover an approved writable capture path. In both cases, retain only storefront pixels; never persist browser chrome, credentials, tokens, cookies, or private response bodies.
