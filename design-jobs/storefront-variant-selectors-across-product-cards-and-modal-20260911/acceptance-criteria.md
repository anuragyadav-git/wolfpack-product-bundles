---
schema_version: 1
id: storefront-design-director-acceptance-template
title: Acceptance Criteria Template
type: design-job-template
status: active
summary: Defines independently testable behavioral, visual, responsive, accessibility, resource, and regression acceptance.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - quality-assurance
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/acceptance-criteria.md
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/browser-test-plan.yaml
tags:
  - template
keywords:
  - acceptance
  - qa
---

# Acceptance Criteria

Artifact job ID: storefront-variant-selectors-across-product-cards-and-modal-20260911
Artifact revision: 4
Artifact status: approved

## Fixture and data gates

- [ ] Multi-variant FPB and PPB fixtures are created through the normal Admin flow and survive an Admin hard reload before storefront evidence is accepted.
- [ ] Storefront previews are opened from fresh signed Preview Bundle actions; no stale signed URL or tunnel URL is used.
- [ ] Shopify option values, variant availability, prices, inventory, and ProductOptionValue.swatch remain the only runtime data sources.
- [ ] Missing Shopify swatch media uses the existing neutral labeled state without inferred colors, images, or fallback maps.
- [ ] PPB Storefront hydration failure remains fail-closed and blocks selection and Add to cart.

## Selector behavior

- [ ] FPB and PPB both preserve dropdown, pill, color_swatch, and image_swatch category modes through save, reload, and storefront runtime projection.
- [ ] Every available option value is directly reachable in normal flow; no value is hidden behind `+N`, a horizontal rail, or a selector-owned scroller.
- [ ] Dropdowns consume the available selector width; pills and swatches use intrinsic responsive columns; long labels receive a wider or full row without truncating required meaning.
- [ ] Unavailable values remain visible, labeled, disabled, and incapable of changing the active variant.
- [ ] A successful activation produces exactly one variant update and cannot bubble into card Add, details, or modal-open actions.
- [ ] The existing owner updates active variant, image, price, compare-at price, availability, inventory context, selected summary, quantity clamp, and Add eligibility.
- [ ] Multiple option dimensions recompute valid combinations without stale availability or lost focus.
- [ ] Duplicate card/modal instances use isolated IDs, names, state, and event callbacks.
- [ ] In `color_swatch` or `image_swatch` mode, a multi-dimensional option with no canonical Shopify swatch of the requested kind uses one native select while mapped dimensions retain their requested swatches.
- [ ] Dropdown retains complete-variant selection. In two-dimensional FPB pill/swatch modes, one visual dimension remains directly reachable and additional dimensions use labeled native selects.
- [ ] Cards reserve independent media, identity, price, selector, and action regions so a no-variant card does not reposition its content beside a two-dimensional card.

## Visual and responsive acceptance

- [ ] FPB Standard, Classic, Compact, and Horizontal pass at actual 1280x800 and actual 390x844 Chrome windows.
- [ ] PPB Grid, List, Horizontal Slots, and Vertical Slots pass at actual 1280x800 and actual 390x844 Chrome windows.
- [ ] Critical boundaries pass at FPB container widths 799/800/801, PPB viewport widths 767/768/769, and PPB Grid widths 479/480/481.
- [ ] Two hundred percent browser zoom remains operable without hidden options or horizontal page/card/modal overflow.
- [ ] No selector, card, modal, drawer, or page clipping, unintended overflow, congestion, or unexpected wrapping is present.
- [ ] Card geometry is stable across selected, unselected, hover, pressed, focus, and unavailable states; same-row cards remain equal height.
- [ ] Adjacent media, title, price, compare-at price, inventory, quantity, Add, and details controls remain readable and unobstructed.
- [ ] The Agent-store Black Crew Neck T-Shirt fixture (seven Size values by four Color values) uses compact coordinated dimension rows and no selected-value row increases card height beneath the controls.
- [ ] FPB mobile drawer, PPB sticky/footer actions, modal close controls, and safe areas remain reachable and are not covered by selector content.
- [ ] Sibling shell, card, grid/list, sidebar, tray, footer, and CTA rectangles show no unintended change beyond one CSS pixel from the approved baseline.

## Interaction and accessibility

- [ ] Dropdown mode exposes a visible label and native select semantics; non-dropdown dimensions expose one named native radio group.
- [ ] IDs and names are unique per component instance, and labels remain persistently visible for selected swatches.
- [ ] Pointer and keyboard users can complete selection; Tab order is logical, native arrow/Space behavior works, and focus remains visible and unclipped.
- [ ] Selected, focused, and unavailable states do not depend on color alone and do not change geometry.
- [ ] Every interactive target is at least 44 by 44 CSS pixels without shrinking text into unreadability.
- [ ] Variant rerenders preserve a logical focus target; FPB/PPB modal and drawer owners preserve focus restoration and scroll locking.
- [ ] Reduced-motion mode removes nonessential selector animation without changing state feedback.

## Verification and delivery

- [ ] The mandatory test spec exists before implementation and tests verify behavior/data flow only, never CSS, classes, placement, or source ordering.
- [ ] Focused selector tests, the full relevant unit suite, raw-widget `node --check`, typecheck, modified-file ESLint, and `git diff --check` pass.
- [ ] `npm run build:widgets` and `npm run minify:assets css` succeed, and generated extension assets match their canonical sources.
- [ ] Knip completes with every remaining selector candidate classified, and `npm run graphify:rebuild` completes with impact evidence recorded.
- [ ] The release-candidate widget receives a MINOR `WIDGET_VERSION` bump before generated assets are produced.
- [ ] Direct Chrome DevTools preflight clears Cache Storage, hard reloads with cache bypass, records actual viewport/DPR/zoom, and passes in the connected default profile.
- [ ] Every browser case records before/after element and viewport PNGs, semantic and geometry assertions, screenshot index, and append-only retry history under the design job QA directory.
- [ ] Console and network gates show no new uncaught error, severe repeated warning, failed required asset, unexpected request failure, duplicate mutation, or destructive request.
- [ ] Desktop/mobile Lighthouse and selector interaction performance traces distinguish pre-existing page findings from change-caused regressions.
- [ ] Screenshots, signed preview URLs, private request data, test-report.json, and unrelated dirty files are not committed.
- [ ] No deploy is run autonomously; the manual SIT deploy gate is handed back only after all local and browser acceptance passes.
