---
schema_version: 1
id: storefront-app-embed-ownership
title: Storefront App Embed Ownership
type: test-spec
status: active
summary: Verify that each storefront app embed runtime reads the marker emitted by its own theme app extension instance.
last_audited: 2026-09-04
owners:
  - engineering
domains:
  - storefront
systems:
  - theme-app-extension
source_paths:
  - app/storefront/app-embed-marker.ts
  - app/storefront/app-embed.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - storefront
  - app-embed
keywords:
  - proxy root
  - extension ownership
---

# Test Spec: Storefront App Embed Ownership

**Spec ID:** storefront-app-embed-ownership **Created:** 2026-09-04

## Purpose

Keep each loaded app-embed script bound to the adjacent marker emitted by the same Shopify theme app extension. This prevents another installed Wolfpack app from supplying the active proxy root.

## Test Cases

### FindOwnedAppEmbedMarker

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Multiple app embeds are present | The second app embed script element | Return the second script's adjacent marker | Preserves extension ownership |
| 2 | The script has no adjacent marker | A detached script and a document with one marker | Return the document marker | Keeps isolated runtime/test loading functional |
| 3 | No marker is present | A detached script and an empty document | Return null | Fails without fabricating configuration |

## Acceptance Criteria

- [x] A SIT app embed cannot read the PROD app embed marker merely because PROD appears first in the document.
- [x] The runtime retains the existing single-marker behavior.
- [x] No proxy fallback or hardcoded environment path is introduced.
- [x] All listed test cases pass.
