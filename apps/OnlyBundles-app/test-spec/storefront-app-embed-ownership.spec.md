---
schema_version: 1
id: storefront-app-embed-ownership
title: Storefront App Embed Ownership
type: test-spec
status: active
summary: Verify that each storefront app embed runtime reads the marker and Shopify-hosted PPB context emitted by its own theme app extension instance.
last_audited: 2026-09-09
owners:
  - engineering
domains:
  - storefront
systems:
  - theme-app-extension
source_paths:
  - app/storefront/app-embed-marker.ts
  - app/storefront/app-embed.ts
  - app/storefront/ppb-bundle-embed.ts
  - extensions/bundle-builder/blocks/bundle-app-embed.liquid
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

Keep each loaded app-embed script bound to the adjacent marker emitted by the same Shopify theme app extension. Refuse to bootstrap when multiple Only Bundles app embeds are active on one theme so script order cannot select the storefront environment.

## Test Cases

### FindOwnedAppEmbedMarker

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Multiple app embeds are present | The second app embed script element | Return the second script's adjacent marker | Preserves extension ownership |
| 2 | The script has no adjacent marker | A detached script and a document with one marker | Return the document marker | Keeps isolated runtime/test loading functional |
| 3 | No marker is present | A detached script and an empty document | Return null | Fails without fabricating configuration |
| 4 | Automatic PPB embed | Owned marker has a valid Shopify-hosted runtime snapshot and currency context | Expose the runtime before initializing the PPB widget | Direct block and app-embed hydration use the same current snapshot |
| 5 | Missing or malformed runtime | Owned marker has no valid runtime snapshot | Leave the runtime absent | PPB hydration fails closed instead of using another environment or fabricated token |
| 6 | One app embed marker | Current script is adjacent to the only marker | Resolve `owned` with that marker | Normal storefront behavior is unchanged |
| 7 | No app embed marker | Document contains no marker | Resolve `missing` with no marker | No configuration is fabricated |
| 8 | PROD and SIT app embeds share one theme | Document contains two Only Bundles markers with different proxy roots | Resolve `conflict` with both proxy roots and no active marker | Neither environment may win through script order |

## Acceptance Criteria

- [x] A SIT app embed cannot read the PROD app embed marker merely because PROD appears first in the document.
- [x] The runtime retains the existing single-marker behavior.
- [x] No proxy fallback or hardcoded environment path is introduced.
- [x] Automatic and page-builder PPB embeds receive their owning Shopify-hosted runtime and currency context.
- [x] Missing or malformed runtime data is not replaced with fallback configuration.
- [x] A document with multiple Only Bundles app embeds fails closed before either runtime publishes shared state or hydrates a bundle surface.
- [x] The conflict diagnostic identifies the competing proxy roots without selecting one.
- [x] All listed test cases pass.
