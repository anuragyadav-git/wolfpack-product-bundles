---
schema_version: 1
id: storefront-design-director-state-matrix-template
title: State Matrix Template
type: design-job-template
status: active
summary: Records complete behavioral and evidence coverage for every applicable component state.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/state-matrix.md
related_docs:
  - .agents/skills/storefront-design-director/references/state-coverage-catalog.md
tags:
  - template
keywords:
  - states
  - assertions
---

# State Matrix

Artifact job ID: storefront-variant-selectors-across-product-cards-and-modal-20260911
Artifact revision: 2
Artifact status: complete

| State ID | Trigger | Data precondition | Visible result | Available interaction | Accessibility | Desktop | Mobile | Screenshot | Automated assertion | Approval |
|---|---|---|---|---|---|---|---|---|---|---|
| VS-01 single variant | Product renders | Exactly one hydrated variant | No selector region; card rhythm remains intact | Normal quantity/Add actions | No empty or redundant control announced | Same | Same | Context only | Renderer returns no selector for one variant | Contracted |
| VS-02 dropdown default | Product renders | Multiple variants; dropdown mode | Visible option label and current value in a full-width control | Open and choose available value | Native labeled select/combobox semantics; unavailable options disabled | Fits card/details region | Reflows at full available width or uses the existing FPB drawer policy | Yes, every owning surface | Options and current value match hydrated variants | Contracted |
| VS-03 pill default | Product renders | PPB pill mode or FPB button presentation | Every applicable value appears in an intrinsic normal-flow matrix | Choose any available value | One named group per dimension; each value has an accessible name | Intrinsic columns use available width | Fewer columns; long values take wider/full rows | Yes | Every available value is reachable in source order and change callback receives its variant/value | Contracted |
| VS-04 mapped color swatch | Product renders | PPB color mode; Shopify color swatch exists | Canonical color sample plus persistent selected-value text | Choose available color; optional merchant tooltip on hover/focus | Accessible label and selected state do not depend on color or tooltip | Tooltip may supplement label | Persistent label remains; no hover dependency | Yes | Canonical swatch color is applied and accessible label comes from Shopify option value | Contracted |
| VS-05 missing color swatch | Product renders | PPB color mode; Shopify swatch missing | Neutral labeled choice in the same matrix footprint | Choose if variant is available | Full accessible option label; no inferred color | Same | Same | Yes | No color inference; neutral labeled control is emitted | Contracted |
| VS-06 mapped image swatch | Product renders | PPB image mode; Shopify swatch image exists | Image sample and persistent selected-value text | Choose available image value | Decorative sample does not replace the option's accessible name | Intrinsic matrix | Fewer columns with preserved media ratio | Yes | Canonical swatch image URL is used and selection callback is unchanged | Contracted |
| VS-07 missing image swatch | Product renders | PPB image mode; Shopify swatch image missing | Neutral labeled choice; no broken-image icon or fabricated product image | Choose if available | Full accessible label | Same footprint as mapped control | Same | Yes | No variant/product-image fallback is used as a swatch | Contracted |
| VS-08 selected | Merchant chooses an available value | Valid combination exists | Selected treatment changes without changing control dimensions; product image/price/stock context updates | Choose another available value | Checked/selected state is programmatic and visible beyond color | Stable card height | Stable card/sheet height | Yes | Active variant and existing delegated image/price/availability updates match selection | Contracted |
| VS-09 pressed | Pointer or keyboard activation is in progress | Enabled value | Temporary pressed feedback only | Complete or cancel activation | No semantic state loss | No geometry change | No geometry change | Optional | Activation fires once and does not trigger card-level Add/details behavior | Contracted |
| VS-10 focus visible | Keyboard focus enters a value | Enabled or selected control | Visible focus treatment contained within selector bounds | Arrow/Tab/Space/Enter according to native control semantics | Focus order follows Shopify option/value order | No clipping at card edge | No clipping at sheet/card edge | Yes | Keyboard can complete selection without pointer; focus remains on the chosen control | Contracted |
| VS-11 unavailable | Product renders or selected availability changes | One or more variants unavailable | Value remains visible with disabled/unavailable treatment and unchanged footprint | Cannot select unavailable value | Disabled semantics and accessible unavailable name | Same | Same | Yes | Disabled value never calls change handler | Contracted |
| VS-12 all unavailable | Product renders | Every combination unavailable | All values remain visible but disabled; Add path remains blocked through existing stock behavior | No variant selection or Add | Group remains understandable; existing stock feedback announces failure | Same | Same | Yes | No enabled selector option and existing out-of-stock gate remains authoritative | Contracted |
| VS-13 long labels | Product renders | One or more long option/value labels | Text wraps without clipping siblings or reducing target size | All values remain selectable | Full text remains programmatically available | Intrinsic track may span more columns/full row | Full-row reflow where necessary | Yes | Content remains present and accessible; geometry verified only in Chrome | Contracted |
| VS-14 many values | Product renders | At least twelve values in one dimension | All values wrap in normal flow; no `+N` hiding control or horizontal option rail | Every available value remains directly selectable | Complete source-order traversal | Card row initially stretches to tallest content | Card grows in normal flow above sticky actions | Yes | Rendered control count equals source value count; no overflow-disclosure state | Contracted |
| VS-15 multiple dimensions | Product renders | At least two Shopify options | Separate labeled groups appear in canonical option order; invalid combinations follow current selection logic | Choose values across groups | One accessible group/label per dimension | Groups stack with internal intrinsic matrices | Groups stack in one column | Yes | Choosing a dimension resolves the same available variant combination as current behavior | Contracted |
| VS-16 adjacent controls | Variant changes | Card also has price, stock, quantity, Add, badge, or compare-at content | Adjacent content updates without overlap, clipping, or selector-induced event leakage | Quantity/Add remain independently operable | Names and focus order remain intact | Same-row cards remain equal height | Sticky footer remains unobscured | Yes | Variant click does not invoke card Add/details; quantity and Add events still fire once | Contracted |
| VS-17 FPB modal open | Open product details | Multi-variant FPB product | Selector appears after identity/price and before quantity/Add in the existing dialog | Select variant, change quantity, Add, close | Existing modal focus trap, name, Escape, and restoration remain | Two-column modal shell unchanged | Existing single-column sheet | Yes | Modal selection updates its product state and close restores focus | Contracted |
| VS-18 PPB picker open | Open Horizontal/Vertical Slots picker | Multi-variant PPB product | Approved selector mode appears inside picker card; no nested details modal | Select variant, change quantity/Add, close picker | Existing picker dialog semantics and focus behavior remain | Modal card uses relaxed density | Existing picker sheet uses intrinsic reflow | Yes | Mode/selection callback matches in-page contract; no nested modal created | Contracted |
| VS-19 FPB mobile drawer | Activate a Standard/Classic selector whose current policy owns a drawer | Multiple FPB variants and drawer presentation | Existing selector drawer shows product identity, all available/unavailable values, price, and close affordance | Choose, backdrop/Escape close, or close control | Dialog semantics, focus containment/restoration, and disabled values | Not applicable | Existing drawer contract remains; no nested scroll owner added by matrix styling | Yes | Drawer opens once, dismiss paths work, selection closes and updates the product | Contracted |
| VS-20 high zoom | Browser zoom increases | Any multi-variant selector | Controls reflow; no clipped label or inaccessible value | Complete selection and Add | Logical order and target usability remain | Test at 200% within desktop window | Narrow reflow equivalent | Yes | Behavioral semantics unchanged; geometry verified only in Chrome | Contracted |
| VS-21 reduced motion | Reduced motion is active | Tooltip, drawer, modal, or focus transition present | No selector-critical information depends on animation | All interactions remain available | Motion reduction does not remove feedback | Same | Same | Optional | Existing reduced-motion policy is honored; selection callback unchanged | Contracted |
| VS-22 hydration failure | PPB product hydration fails or is incomplete | Missing/malformed/stale Storefront product data | Existing fail-closed product surface blocks selector and Add rather than showing stale choices | Recovery only through existing retry/reload path | Failure is announced by existing widget error owner | Same | Same | Regression screenshot | No selector or Add path is enabled from stale cached product data | Contracted |

## Not applicable

| Catalog state | Reason |
|---|---|
| Selector-owned loading spinner | Loading belongs to the widget/product hydration surface; the selector must not invent a second loading state. |
| Selector-owned error message | Validation and hydration errors remain owned by existing widget feedback surfaces. |
| Empty product collection | This is a bundle-step/product-source state outside selector ownership. |
| Discount, free-gift, default-included, locked-step, or dimmed visuals | These remain product-card non-regression states, not new selector states; VS-16 covers adjacency. |
| Bundle summary/sidebar/footer progress states | Out of selector scope; only non-obstruction is required. |
| Tabs and step progress states | Out of selector scope. |
| Modal image-carousel behavior | Product media behavior is unchanged and covered only as non-regression. |
| Clear all and product removal | Bundle-selection behavior is unchanged and outside selector ownership. |

## Coverage

- Required: 22 selector, adjacency, modal, responsive, accessibility, and failure states.
- Covered: All 22 have explicit triggers, data preconditions, visible results, interactions, accessibility requirements, viewport behavior, screenshot needs, and behavior assertions.
- Missing: Rendered evidence remains pending for multi-variant fixtures, every PPB mode/template, FPB card/modal modes, high zoom, failure behavior, and actual 390x844 Chrome.
- Status: Contract complete; implementation and evidence pending.
