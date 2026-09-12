---
schema_version: 1
id: storefront-variant-selectors-browser-report
title: Storefront Variant Selectors Browser Test Report
type: design-job-qa-report
status: active
summary: Records direct Chrome evidence for stable FPB and PPB product-card tracks and coordinated two-dimensional variant selection.
last_audited: 2026-09-12
owners:
  - Aditya Awasthi
domains:
  - browser-qa
systems:
  - only-bundles-storefront
source_paths:
  - apps/OnlyBundles-app/app/assets/widgets/full-page-css/shared/responsive-layout.css
  - apps/OnlyBundles-app/app/assets/widgets/shared/variant-selector.ts
  - apps/OnlyBundles-app/app/assets/widgets/product-page/variant-selector-modes.ts
  - apps/OnlyBundles-app/app/assets/widgets/product-page/methods/modal-methods.ts
  - apps/OnlyBundles-app/app/assets/widgets/product-page-css/templates/inpage-grid.css
  - apps/OnlyBundles-app/app/assets/widgets/product-page-css/templates/inpage-cascade.css
related_docs:
  - design-jobs/storefront-variant-selectors-across-product-cards-and-modal-20260911/acceptance-criteria.md
  - design-jobs/storefront-variant-selectors-across-product-cards-and-modal-20260911/visual-qa-report.md
tags:
  - fpb
  - variant-selectors
keywords:
  - card-geometry
  - chrome-qa
---

# Browser Test Report

Artifact job ID: storefront-variant-selectors-across-product-cards-and-modal-20260911
Artifact revision: 4
Artifact status: complete

## Job, implementation, and Chrome QA preflight

- Environment: SIT, Agent store `agent-5sfidg3m`, signed FPB Preview Bundle route.
- Browser: Chrome 152.0.0.0 in the connected default profile; no isolated context.
- Repository baseline: `feature/26.05-UI-changes` at `bc954fc5c022e81c75f0b6835e8e0d7cac7412b8` plus the current uncommitted implementation.
- Fixture: adjacent `14k Dangling Obsidian Earrings` (no meaningful variants) and `Black Crew Neck T-Shirt` (seven Size values by four Color values).
- Served assets: widget `22.0.0`; current full-page JS and responsive CSS returned HTTP 200 after cache-storage clearing and cache-bypassed reloads.
- Available capabilities: page selection, real-window resize, cache-bypassed navigation, accessibility snapshot, screenshot, evaluation, console, and network inspection.
- Mobile capability: after the user resized the actual Chrome window, all four templates were exercised at a measured 390px inner width without viewport or device emulation. Browser chrome produced inner heights between 787px and 831px.
- Preflight status: passed with inline evidence. Direct Chrome screenshots were reviewed in the session and intentionally not persisted or committed.

| Mandatory preflight check | Status | Direct evidence | Blocker | Recovery action |
|---|---|---|---|---|
| Chrome MCP connected | Passed | Page 141 was selected and inspected through direct Chrome DevTools. | None | None |
| Supported Chrome available | Passed | Chrome 152.0.0.0 on macOS. | None | None |
| Intended page selected | Passed | Signed Agent-store FPB preview for bundle `cmtmv15r10001v0rp8j79t9bx`. | None | None |
| Server, environment, and fixture reachable | Passed | Preview document, storefront products, controls, language, widget JS, and widget CSS returned HTTP 200. | None | None |
| Authentication intentional and sensitive tabs avoided | Passed | User-provided Agent-store session; only the relevant Shopify Admin, storefront, and public Shopify documentation surfaces were inspected. | None | None |
| Resize, snapshot, screenshot, console, and network work | Passed | Direct Chrome inspection worked at desktop and a real 390px mobile width. Inline screenshots, geometry, accessibility snapshots, console, and network evidence were reviewed for all four FPB templates. | None | None |
| Repository, job revision, and baseline identified | Passed | Branch, baseline commit, job revision 4, and live widget version 22.0.0 were recorded. | None | None |

## Conditions

| Case group | Requested viewport | Achieved viewport | Zoom | Locale | Currency | Theme | State |
|---|---:|---:|---:|---|---|---|---|
| FPB desktop | 1280x800 | 1280x800 | 100% | en | USD | Agent active theme | No-variant adjacent to Size x Color |
| FPB mobile | actual Chrome window, 390px target width | 390px width; 787px to 831px inner height | 100% | en | USD | Agent active theme | Same deterministic fixture |

## Gate summary

| Gate | Status | Evidence | Waiver or not-applicable reason |
|---|---|---|---|
| Functional | Passed | Color `Navy` plus Size `S` selected the exact variant, changed product media, and kept the card price at `$30.00`. | None |
| Visual | Passed for executed FPB cases | Direct viewport review found no clipping, congestion, misplaced selector column, or covered sticky footer. Size and Color share one inline origin at 390px. | None |
| Geometry | Passed for executed FPB cases | Every tested template had equal adjacent card heights, aligned media/identity/price/action/selector origins, and zero card overflow. | None |
| Responsive | Passed for FPB ordering slice | All four templates passed at desktop and a real 390px Chrome width. | Browser chrome changed the available inner height; the required mobile width and breakpoint behavior were fully exercised. |
| Console | Passed | No widget exception or hydration error. The only error was the store-owned `/favicon.ico` 404; one Shopify Early Hints preload warning was non-blocking. | Store favicon is outside widget ownership. |
| Network | Passed | Required widget assets and product hydration requests returned HTTP 200; the only aborted request belonged to Shopify's embedded Shop login flow. | None |
| Accessibility | Passed for exercised controls | The seven Size choices remain named radio controls, Color remains a labeled native select, and measured controls retain 44px targets. | Full page Lighthouse remains outstanding for final design-job approval. |
| Performance | Not run | This pass verified stable post-hydration geometry and no interaction-driven card-height change. | A trace is still required before design-job final approval. |
| Non-regression | Passed for FPB mixed-card matrix | Standard, Classic, Compact, and Horizontal preserved neighboring card, media, price, action, selector, and sticky-footer ownership. | Broader PPB design-job cases remain outside this FPB slice. |

## Geometry results

Desktop values are CSS pixels from the final 1280x800 hard-reloaded fixture. Origins are equal between the adjacent no-variant and Size x Color cards within each row.

| Template | Equal card height | Media origin/height | Identity origin/height | Price origin | Selector origin | Selector widths | Overflow |
|---|---:|---|---|---:|---:|---|---:|
| Standard | 543.34 | y 129.38 / 194.58 | y 331.95 / 50 | y 596.72 | y 389.95 | 246.25 / 246.25 | 0 |
| Classic | 545.77 | y 134.38 / 194.58 | y 340.95 / 50 | y 588.14 | y 403.95 | 373.38 / 373.39 | 0 |
| Compact | 548.11 | y 130.38 / 169.20 | y 307.58 / 50 | y 572.48 | y 368.58 | 209 / 209 | 0 |
| Horizontal | 326.23 | y 134.38 / 300.23 | y 134.38 / 53.59 | y 404.48 | y 188.97 | 241.06 / 241.08 | 0 |

Mobile real-window evidence. Selector, price, and action origins refer to the two-dimensional product card:

| Template | Achieved viewport | Equal card height | Selector origin/width/height | Size origin/width | Color origin/width | Price origin | Action origin | Card/document overflow |
|---|---:|---:|---|---|---|---:|---:|---:|
| Standard | 390x787 | 513.16 | x 53.19 / 272.63 / 185.16 | x 53.19 / 272.63 | x 53.19 / 272.63 | y 1103.31 | y 1128.31 | 0 / 0 |
| Classic | 390x830 | 524.16 | x 30.19 / 318.63 / 185.16 | x 30.19 / 318.63 | x 30.19 / 318.63 | y 1094.31 | y 1120.31 | 0 / 0 |
| Compact | 390x828 | 576.95 | x 204.50 / 148.31 / 233.95 | x 204.50 / 148.31 | x 204.50 / 148.31 | y 592.95 | y 640.95 | 0 / 0 |
| Horizontal | 390x831 | 313.75 | x 131.38 / 217.44 / 185.16 | x 131.38 / 217.44 | x 131.38 / 217.44 | y 704.38 | y 694.50 | 0 / 0 |

## Case results

| Case | Viewport | Functional | Visual | Geometry | Console | Network | Result |
|---|---|---|---|---|---|---|---|
| FPB Standard mixed row | 1280x800 | Passed | Passed | Passed | Passed | Passed | Passed |
| FPB Classic mixed row | 1280x800 | Passed | Passed | Passed | Passed | Passed | Passed |
| FPB Compact mixed row | 1280x800 | Passed | Passed | Passed | Passed | Passed | Passed |
| FPB Horizontal mixed row | 1280x800 | Passed | Passed | Passed | Passed | Passed | Passed |
| FPB Standard mobile | 390x787 | Passed | Passed | Passed | Passed | Passed | Passed |
| FPB Classic mobile | 390x830 | Passed | Passed | Passed | Passed | Passed | Passed |
| FPB Compact mobile | 390x828 | Passed | Passed | Passed | Passed | Passed | Passed |
| FPB Horizontal mobile | 390x831 | Passed | Passed | Passed | Passed | Passed | Passed |
| Exact Shopify variant update | 1280x800 | Passed | Passed | Stable height | Passed | Passed | Passed |

## Screenshot index

The viewport captures were inspected inline and intentionally not persisted or committed. The repository rule against committed Chrome investigation screenshots is preserved.

| Case | Kind | Phase | Persistence | Viewport | Result |
|---|---|---|---|---|---|
| Four FPB templates | Viewport | Final | In-memory only | 1280x800 | Passed semantic visual review |
| Four FPB templates | Viewport | Final | Inline only | 390px width | Passed semantic visual and measured geometry review |

## Console allowlist

| Exact or pattern | Reason | Owner | Review date | Baseline evidence |
|---|---|---|---|---|
| `GET /favicon.ico 404` | Active store theme has no favicon at this path; unrelated to widget code. | Store theme | 2026-09-12 | Network request 3656 |
| `bundle-widget-bootstrap.css ... preloaded ... not used within a few seconds` | Shopify Early Hints emitted an obsolete development-extension preload while the active extension asset loaded successfully. | Shopify development preview | 2026-09-12 | Console message 74 and active widget asset HTTP 200 responses |

No blanket warning suppression was used.

## Network observations

- `bundle-widget-full-page-bundled.js`, the full-page base CSS, responsive CSS, template CSS, controls settings, language settings, and storefront product hydration all returned HTTP 200.
- The one `net::ERR_ABORTED` request was immediately followed by Shopify's normal redirected Shop login authorization request and did not affect the widget.
- No cart or destructive Admin mutation was issued during this QA pass.

## Retry history and cleanup

| Attempt | Classification | Status | Evidence | Remediation | Cleanup confirmed |
|---:|---|---|---|---|---|
| 1 | Infrastructure | Blocked | Earlier fresh preview returned 404 for required development-extension assets. | User restarted the SIT tunnel; a fresh signed Preview Bundle URL was opened. | Yes |
| 2 | Product geometry | Failed then remediated | Standard/Classic/Compact internal origins shifted and the selector inherited an implicit narrow grid column. | Added canonical stable tracks and explicit price/action grid columns, rebuilt and hard reloaded. | Yes |
| 3 | Rerun | Passed at available widths | All four desktop and narrow FPB templates now pass geometry and visual review; widget 22.0.0 is served. | None | Chrome restored to 1280x800. |
| 4 | Recovered mobile-width rerun | Passed | User-resized real Chrome windows reached 390px. All four FPB templates aligned Size and Color, kept selectors above price/action, retained equal card heights, and had zero overflow. | Added complete-grid selector spanning and canonical semantic order. | Temporary QA controls removed; final screenshots remained inline only. |

## Final approval status

## PPB Direction A completion evidence

- Environment: SIT Agent store, signed PPB Preview Bundle route, bundle `cmtmuwtyu0000v0rpfubzp36c`.
- Served asset: widget `22.1.0`, 248884-byte product-page bundle with the in-page step rerender branch present after a cache-bypassed hard reload.
- Fixture: `Black Crew Neck T-Shirt` with Size x Color beside `14k Dangling Obsidian Earrings` without meaningful variants.
- Selector policy: Dropdown stays one native select per dimension. Pills and Shopify-backed swatches retain the configured visual control only on the compactest eligible dimension; remaining dimensions use labeled native selects. Missing canonical Shopify swatch data uses labeled native selects and never guesses color or substitutes variant imagery.
- Functional proof: Product Grid changed `S / Black -> M / Black -> M / Navy`; Size and Color remained selected, the Navy product image loaded, and price remained `$30.00`.
- Console: no widget exception or hydration error. The only error was the store theme's `/favicon.ico` 404; Shopify emitted one non-blocking Early Hints preload warning.

Desktop evidence was captured in a real 2560x1186 Chrome window, which satisfies the required desktop minimum.

| PPB template | Card/row result | Selector result | Price/action result | Overflow |
|---|---|---|---|---|
| Product Grid | Adjacent cards equal at 205x466.8 | 205x71, two approximately 100px columns | Price y834.5; action y863.5 | 0 |
| Product List | Variant row remains compact; non-variant row keeps native list anatomy | 317x65, two 154.5px columns spanning the content region | Price and Add remain below selectors | 0 |
| Horizontal Slots | Modal cards equal at 286x462.4 | 260x71, two 128px columns | Both prices y738.3; both actions y759.3 | 0 |
| Vertical Slots | Modal cards equal at 286x462.4 | 260x71, two 128px columns | Both prices y738.3; both actions y759.3 | 0 |

At the narrowest genuine Chrome window available in this session, 500x844:

| PPB template | Card/row result | Selector result | Price/action result | Overflow |
|---|---|---|---|---|
| Product Grid | Adjacent cards equal at 205.5x467.3 | 205.5x71, two 100.5px columns | Price y576; action y605 | 0 |
| Product List | Variant row 442x188.2 | 318x65, two 156.5px columns | Price and Add share the following row | 0 |
| Horizontal Slots | Modal cards equal at 209x473.5 | 187x146, one intrinsic column | Both prices y651.1; both actions y677.1 | 0 |
| Vertical Slots | Modal cards equal at 209x473.5 | 187x146, one intrinsic column | Both prices y651.1; both actions y677.1 | 0 |

The fixture was restored to Vertical Slots after QA. Direct screenshots were reviewed inline and were not persisted or committed.

The FPB and PPB implementation slices are ready for review. The overall design job remains active because the PPB exact 390px real-window capture, Lighthouse, and performance trace remain separate final-approval gates.
