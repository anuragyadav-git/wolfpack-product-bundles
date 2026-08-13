# Wolfpack Product Bundles — Comprehensive Bundle Template Design-System Plan

**Document purpose:** Create a complete, reusable, testable design system for all Wolfpack storefront bundle templates.

**Product families**

- **FPB — Full Page Bundles**
  - Standard
  - Classic
  - Compact
  - Horizontal
- **PPB — Product Page Bundles**
  - Grid
  - List
  - Vertical Slots
  - Horizontal Slots

**Primary outcome:** One coherent bundle design system in which shared bundle semantics are implemented once, FPB and PPB each have a family-level component contract, and the eight templates are presentation adapters rather than separate product implementations.

---

## 1. Scope, evidence discipline, and completeness rule

This plan covers:

1. Design foundations and semantic tokens.
2. Shared bundle primitives.
3. FPB family components and all four FPB templates.
4. PPB family components and all four PPB templates.
5. Universal, component, business, responsive, accessibility, loading, error, and content-stress states.
6. All known bundle configuration axes.
7. All storefront copy surfaces that are or may be merchant-editable.
8. Admin-preview and storefront parity.
9. Automated functional, visual, responsive, accessibility, console, network, and performance testing through Chrome DevTools.
10. Governance, versioning, migration, rollout, and stopping criteria.

### 1.1 Configuration status labels

Every setting and copy field must be assigned one of these statuses. Do not merge these categories:

| Status | Meaning |
|---|---|
| `CONFIRMED_CURRENT` | The field is verified in the current repository, database/schema, admin form, serialized payload, and storefront runtime. |
| `DISCOVERED_CURRENT` | The field was found during the design-system audit but was not part of the initial known inventory. |
| `PROPOSED_MERCHANT_SETTING` | The storefront surface exists, but merchant configurability is not yet verified or does not yet exist. |
| `SYSTEM_GENERATED` | The value is computed from bundle state, product data, pricing, inventory, locale, or accessibility semantics. |
| `LOCALIZABLE_SYSTEM_COPY` | Product-owned copy that should support localization but should not normally be freely edited per merchant. |
| `DESIGN_ONLY` | A token or behavior needed by the design system but not exposed in the merchant UI. |
| `NOT_APPLICABLE` | The capability does not apply to the relevant family or template. |
| `DEPRECATED` | The field or alias must not be used for new designs. |

### 1.2 No-guessing gate

The first phase must extract the exact current configuration and copy schemas from the live codebase. The design system is not complete merely because the visual component library looks complete.

The audit must inspect:

- database models and migrations;
- server DTOs, validators, and serializers;
- Admin UI controls and form state;
- API request and response payloads;
- bundle create, update, duplicate, sync, and publish paths;
- storefront settings extraction;
- runtime globals and serialized bundle data;
- defaults and fallback logic;
- CSS variables and template selectors;
- hard-coded storefront text;
- existing fixtures, tests, and screenshots;
- all help or setup content that defines hidden behavior.

Known source-of-truth categories already include:

- FPB step/category data;
- PPB conditions;
- variant display as individual products;
- variant display as swatches;
- discount configuration;
- default/preselected products;
- FPB preset identity;
- PPB template identity;
- box-selection state;
- bundle summary title and subtitle;
- storefront runtime settings.

The exact field names, allowed values, defaults, dependencies, and merchant exposure must still be generated from the current repository before implementation.

---

## 2. Definition of done

The design-system programme is complete only when all of the following are true:

1. Every current bundle setting has one canonical entry in `configuration-registry.yaml`.
2. Every merchant-editable or localizable copy field has one canonical entry in `copy-registry.yaml`.
3. Every storefront state has one canonical entry in `state-registry.yaml`.
4. Every state lists:
   - trigger;
   - data precondition;
   - applicable configurations;
   - expected visual result;
   - expected interaction result;
   - expected accessibility semantics;
   - desktop behavior;
   - mobile behavior;
   - automated assertions;
   - screenshot requirement;
   - approval status.
5. Every configuration maps to:
   - Admin control;
   - persisted field;
   - storefront runtime value;
   - affected components;
   - fixture;
   - test cases;
   - applicable templates.
6. Every copy field maps to:
   - Admin control;
   - fallback;
   - allowed placeholders;
   - validation and length guidance;
   - applicable states;
   - localization behavior;
   - fixture and test.
7. All eight templates pass the mandatory Chrome QA matrix.
8. Shared component changes pass sibling-template non-regression.
9. No merchant-configurable value is hard-coded in a template adapter.
10. No template duplicates bundle selection, pricing, validation, inventory, or cart logic.
11. No visual state depends on color alone.
12. No mandatory state is marked passed without browser evidence.
13. Admin preview and storefront output use the same token, copy, and state contracts.
14. Approved design decisions and baselines are revisioned.
15. All critical and high-severity issues are resolved or explicitly waived by an identified approver.

---

## 3. Target design-system architecture

Use five layers.

### Layer 1 — Product semantics

Owns business truth and must remain independent of template presentation:

- selected products and variants;
- quantity;
- step/category completion;
- conditions;
- box/tier selection;
- discount eligibility and pricing;
- default-included products;
- gifts and add-ons;
- inventory and availability;
- validation;
- add-to-cart lifecycle;
- errors and recovery.

### Layer 2 — Shared design foundations

Owns semantic tokens, accessibility baselines, content rules, motion, responsive conventions, iconography, and component geometry primitives.

### Layer 3 — Family contracts

Two family-level systems:

- `FPB`
- `PPB`

Each family owns its component anatomy and responsive composition, but not duplicated business rules.

### Layer 4 — Template adapters

Eight thin presentation adapters:

- FPB Standard
- FPB Classic
- FPB Compact
- FPB Horizontal
- PPB Grid
- PPB List
- PPB Vertical Slots
- PPB Horizontal Slots

A template adapter may define layout, density, alignment, image geometry, control placement, and aesthetic treatment. It must not reimplement selection, pricing, conditions, variants, or cart behavior.

### Layer 5 — Merchant theme and content overrides

Owns merchant-approved tokens and copy. It must resolve through a validated schema and safe fallback hierarchy.

### 3.1 Token resolution order

Use this order:

1. product-safe system fallback;
2. shared semantic token;
3. family token;
4. template alias;
5. merchant override;
6. state transformation.

Example:

```text
system.button.primary.background
→ bundle.button.primary.background
→ fpb.button.primary.background
→ fpb.classic.cardAction.background
→ merchant.primaryButtonColor
→ state.disabled.opacity
```

State styling must transform a token, not replace business semantics.

---

## 4. Required design-system artifacts

Create a durable, version-controlled design-system package:

```text
design-system/
├── README.md
├── CHANGELOG.md
├── design-system-manifest.yaml
├── 00-inventory/
│   ├── configuration-registry.yaml
│   ├── configuration-coverage.csv
│   ├── copy-registry.yaml
│   ├── copy-coverage.csv
│   ├── state-registry.yaml
│   ├── component-registry.yaml
│   ├── template-registry.yaml
│   ├── ownership-map.md
│   ├── duplicate-style-audit.md
│   └── gaps-and-decisions.md
├── 01-foundations/
│   ├── design-tokens.json
│   ├── merchant-token-contract.json
│   ├── typography.md
│   ├── color.md
│   ├── spacing-and-density.md
│   ├── radii-borders-shadows.md
│   ├── iconography.md
│   ├── imagery.md
│   ├── motion.md
│   ├── breakpoints.md
│   ├── z-index-and-overlays.md
│   └── accessibility-foundations.md
├── 02-shared-components/
│   ├── buttons.md
│   ├── price-group.md
│   ├── quantity-control.md
│   ├── variant-selector.md
│   ├── product-media.md
│   ├── badges.md
│   ├── progress.md
│   ├── feedback.md
│   ├── modal.md
│   └── selected-product-row.md
├── 03-fpb/
│   ├── family-contract.md
│   ├── state-matrix.md
│   ├── configuration-matrix.md
│   ├── copy-matrix.md
│   ├── responsive-contract.md
│   ├── standard/
│   ├── classic/
│   ├── compact/
│   └── horizontal/
├── 04-ppb/
│   ├── family-contract.md
│   ├── state-matrix.md
│   ├── configuration-matrix.md
│   ├── copy-matrix.md
│   ├── responsive-contract.md
│   ├── grid/
│   ├── list/
│   ├── vertical-slots/
│   └── horizontal-slots/
├── 05-copy/
│   ├── copy-schema.json
│   ├── placeholder-contract.md
│   ├── fallback-rules.md
│   ├── length-guidance.md
│   ├── localization.md
│   └── copy-preview-fixtures.yaml
├── 06-fixtures/
│   ├── products.json
│   ├── bundles/
│   ├── states/
│   ├── locales/
│   └── images/
├── 07-prototypes/
│   ├── shared/
│   ├── fpb/
│   └── ppb/
├── 08-qa/
│   ├── browser-test-plan.yaml
│   ├── chrome-devtools-protocol.md
│   ├── visual-comparison-rubric.md
│   ├── accessibility-matrix.md
│   ├── performance-budget.md
│   ├── release-matrix.md
│   └── reports/
└── scripts/
    ├── extract-config-registry.mjs
    ├── extract-copy-registry.mjs
    ├── validate-registry.mjs
    ├── generate-fixtures.mjs
    ├── validate-token-coverage.mjs
    ├── validate-state-coverage.mjs
    ├── validate-copy-coverage.mjs
    ├── generate-browser-test-plan.mjs
    └── compare-images.py
```

File paths may be adapted to current repository conventions. The artifact responsibilities must remain.

---

## 5. Phase 0 — Exhaustive configuration and copy discovery

### Goal

Produce the authoritative inventory before drawing final component variants.

### Tasks

1. Read all applicable repository instructions.
2. Locate all FPB and PPB Admin creation and editing flows.
3. Locate all persisted bundle fields and defaults.
4. Locate all serializers and storefront extraction code.
5. Locate all FPB and PPB runtime settings.
6. Locate all template/preset registries.
7. Locate every text input, text area, label editor, and message configuration.
8. Locate every storefront text literal.
9. Locate all CSS variables, data attributes, modifier classes, and injected styles.
10. Locate all feature flags and conditional components.
11. Locate all existing tests and deterministic fixtures.
12. Open the Admin UI through Chrome DevTools and traverse every bundle settings section.
13. For every relevant feature card, read setup/help content before classifying behavior.
14. Change one setting at a time in a non-production test bundle and verify:
    - persisted value;
    - serialized payload;
    - storefront runtime value;
    - rendered effect;
    - affected templates.
15. Record unsupported or dead settings separately.
16. Run case-sensitive and case-insensitive searches for obsolete template labels. Use only:
    - Grid
    - List
    - Vertical Slots
    - Horizontal Slots
17. Do not retain competitor-related names in production identifiers.

### Required registry fields

Each configuration entry must contain:

```yaml
id:
family:
templates:
admin_label:
admin_location:
field_name:
persisted_location:
runtime_location:
type:
allowed_values:
default:
nullable:
dependencies:
mutual_exclusions:
visibility_condition:
affected_components:
affected_states:
merchant_editable:
responsive_impact:
accessibility_impact:
fixture_ids:
test_case_ids:
status:
evidence:
notes:
```

Each copy entry must contain:

```yaml
id:
family:
templates:
surface:
admin_label:
field_name:
fallback:
required:
merchant_editable:
localizable:
allowed_placeholders:
character_guidance:
supports_pluralization:
supports_rich_text:
sanitization:
affected_states:
fixture_ids:
test_case_ids:
status:
evidence:
```

### Exit criteria

- No unexplained Admin input remains.
- No unexplained persisted storefront field remains.
- No unexplained runtime setting remains.
- No unexplained visible storefront copy remains.
- All 25+ PPB runtime settings are accounted for individually.
- Every setting has an applicability and test mapping.
- Unknowns are explicitly listed and block “complete” status.

---

## 6. Shared foundations

### 6.1 Color tokens

Create semantic, not template-named, groups:

- canvas;
- surface;
- elevated surface;
- primary text;
- secondary text;
- muted text;
- border;
- divider;
- action primary;
- action secondary;
- action destructive;
- selected;
- focus;
- success;
- warning;
- error;
- disabled;
- discount;
- original price;
- free-gift;
- included-product;
- skeleton;
- backdrop;
- toast;
- progress empty;
- progress filled.

For every color token define:

- default;
- merchant-editable status;
- contrast pair;
- dark/light background behavior;
- disabled transformation;
- high-contrast fallback.

### 6.2 Typography

Define semantic roles:

- bundle page title;
- bundle subtitle;
- step/category title;
- body;
- product title;
- product metadata;
- price primary;
- price original;
- badge;
- progress message;
- summary title;
- summary total;
- button;
- helper;
- validation/error;
- modal title.

Each role needs desktop and mobile values, line-height, weight, wrapping, truncation, and maximum-line policy.

### 6.3 Spacing and density

Use a shared scale and explicit density modes:

- comfortable;
- standard;
- compact.

Template adapters consume density aliases. They must not create arbitrary one-off spacing.

### 6.4 Geometry

Define:

- card minimum and maximum widths;
- card image aspect ratios;
- control heights;
- touch target minimums;
- sidebar widths;
- modal widths;
- tray heights;
- progress track;
- badge geometry;
- border widths;
- radii;
- selected-state inset rules.

A selected border must not change the external component dimensions.

### 6.5 Motion

Define:

- duration scale;
- easing;
- hover lift;
- selection transition;
- quantity morph;
- modal open/close;
- tray expand/collapse;
- progress fill;
- toast enter/exit;
- skeleton animation;
- reduced-motion replacement.

### 6.6 Responsive foundations

Default validation widths:

```text
320 × 720   narrow mobile stress
360 × 800   baseline mobile
390 × 844   primary mobile
414 × 896   wide mobile
768 × 1024  tablet portrait
1024 × 768  tablet landscape / small desktop
1280 × 800  desktop
1440 × 900  primary desktop
1536 × 960  wide desktop
```

At every critical transformation breakpoint test:

- one pixel below;
- exact breakpoint;
- one pixel above.

### 6.7 Accessibility foundations

Mandate:

- semantic buttons and form controls;
- visible focus;
- keyboard completion;
- accessible names for icon-only controls;
- selected/current/expanded/disabled state exposure;
- no color-only state;
- focus restoration after modal close;
- focus containment where required;
- reduced motion;
- zoom to 200%;
- meaningful image alternatives;
- minimum target size;
- contrast checks for merchant-configurable pairs.

---

## 7. Shared component primitives

Create shared primitives before family components.

| Primitive | Required configurations | Required states |
|---|---|---|
| Primary button | icon/text, full/auto width, merchant colors, optional price/count | default, hover, focus, pressed, disabled, loading, success, error |
| Secondary button | outlined/filled, back/cancel/clear | default, hover, focus, pressed, disabled |
| Icon button | plus, check, remove, close, expand, carousel | default, hover, focus, pressed, disabled |
| Price group | regular, compare-at, sale, free, total, savings | no discount, discount, free, unavailable, long currency |
| Quantity control | decrement/display/increment, min/max | quantity 1, >1, maximum, disabled, loading |
| Variant selector | button, swatch, select, secondary panel | unselected, selected, unavailable, overflow, multi-axis |
| Product media | square/portrait/landscape, contain/cover | loaded, missing, slow, error, badge overlay |
| Badge | selected, discount, free, included, quantity, unavailable | default, long copy, high count |
| Progress | simple/stepped, one/many tiers | zero, partial, reached, final, disabled |
| Selected product row | image, title, variant, quantity, price, remove | populated, long title, missing image, remove loading |
| Skeleton | card, row, slot, summary | initial, partial hydration, reduced motion |
| Toast | message, undo, close | success, info, warning, error, hiding |
| Modal shell | sheet/dialog, close, backdrop | closed, opening, open, closing, error |
| Empty state | icon, title, body, action | initial empty, filtered empty, unavailable |
| Error state | inline/banner/toast | recoverable, blocking, retrying |

---

# PART I — FPB DESIGN SYSTEM

## 8. FPB family contract

FPB is a full-page, step-aware bundle-building experience. The shared FPB contract must support:

- one or multiple steps;
- product- or collection-backed steps/categories;
- category navigation;
- search;
- required and optional selection rules;
- box/tier selection;
- product cards;
- variants;
- product details modal;
- default-included products;
- free gifts;
- add-ons/upsells;
- discount messaging and progress;
- summary sidebar on applicable desktop layouts;
- mobile summary tray/footer;
- back/next/continue/add-to-cart lifecycle;
- loading, error, and recovery.

### 8.1 FPB configuration inventory

The design system must cover these axes. The audit determines which are currently merchant-exposed and their exact field names.

#### Bundle identity and page content

- bundle title;
- bundle subtitle;
- page content title;
- page content subtitle;
- bundle instructions;
- promo banner enabled;
- promo eyebrow/subtitle;
- promo title;
- promo note;
- promo image;
- promo background;
- promo alignment;
- promo discount-aware treatment.

#### Template and layout

- Standard / Classic / Compact / Horizontal;
- template/preset ID;
- page maximum width;
- content/sidebar ratio;
- cards per row;
- card width;
- card gap;
- density;
- product image ratio;
- image fit;
- card CTA mode:
  - icon;
  - text;
  - inline quantity;
  - modal/options;
- desktop summary type;
- mobile tray/footer type;
- sticky/fixed behavior;
- product-list scroll behavior.

#### Step and category configuration

- single step;
- multiple steps;
- step name;
- step description/subtext;
- step icon/image;
- required/optional step;
- locked/unlocked navigation;
- step completion rules;
- category type;
- manually selected products;
- collections;
- category label;
- category section title;
- category tab/pill/row treatment;
- step timeline or step tabs;
- search enabled;
- search placeholder;
- no-results behavior;
- included/default step.

#### Selection and quantity

- bundle-level minimum;
- bundle-level maximum;
- exact required quantity;
- per-step minimum;
- per-step maximum;
- per-product minimum;
- per-product maximum;
- duplicate quantities;
- box size;
- multiple box sizes;
- tier/box selector;
- default/preselected products;
- required included products;
- removable/non-removable included products;
- add button behavior;
- quantity control behavior;
- dim/lock products when a limit is reached.

#### Product and variant presentation

- show/hide price;
- show compare-at price;
- show discount price;
- show variant badge;
- variant required before add;
- inline variants;
- variants in modal;
- variant buttons;
- color swatches;
- select control;
- display variants as individual products where supported;
- unavailable variant treatment;
- out-of-stock treatment;
- product details modal enabled;
- image carousel;
- product description;
- title clamp;
- missing-image fallback.

#### Pricing and discount

- no discount;
- one discount tier;
- multiple discount tiers;
- simple progress;
- step-based progress;
- progress hidden;
- quantity-driven thresholds;
- amount/value-driven thresholds where supported;
- percentage discount;
- fixed-amount discount;
- fixed bundle price where supported;
- compare-at/original total;
- final total;
- savings amount;
- savings percentage;
- first-tier message;
- between-tier message;
- tier-reached message;
- final-tier message;
- discount badge;
- success banner.

#### Gifts, included products, add-ons, and upsells

- free-gift disabled;
- gift locked;
- gift unlocked;
- gift automatically included;
- gift manually selected;
- gift unavailable;
- gift badge;
- default-included product;
- non-removable included product;
- add-on disabled/enabled;
- add-on eligible/reached;
- upsell slot disabled/enabled;
- upsell threshold;
- upsell selected;
- upsell unavailable.

#### Feedback and submission

- bundle initial loading;
- product loading;
- image loading;
- custom loading animation;
- add pending;
- quantity update pending;
- remove pending;
- clear-all pending;
- cart submit pending;
- cart submit success;
- cart submit failure;
- recoverable network failure;
- stock changed;
- price changed;
- toast position;
- undo enabled;
- retry enabled.

---

## 9. FPB universal component state catalog

### 9.1 Page shell and header

Required states:

- loading;
- loaded;
- empty bundle;
- no eligible products;
- fatal load error;
- recoverable load error;
- disabled/unpublished bundle;
- long title;
- long subtitle;
- hidden header;
- promo banner hidden;
- promo banner no discount;
- promo banner discount active;
- promo image missing;
- modal open;
- mobile tray expanded;
- reduced motion;
- high zoom;
- narrow viewport;
- wide viewport.

### 9.2 Step navigation

Required states:

- single step;
- first step active;
- middle step active;
- final step active;
- inactive;
- completed;
- included;
- locked;
- unlocked after completion;
- optional step;
- required step incomplete;
- hover;
- focus-visible;
- pressed;
- disabled;
- loading;
- many steps overflow;
- long step name;
- icon loaded;
- icon missing;
- horizontal scroll on mobile;
- keyboard traversal.

### 9.3 Category navigation and search

Required states:

- category tabs hidden;
- one category;
- multiple categories;
- inactive category;
- active category;
- completed category where applicable;
- hover;
- focus-visible;
- horizontal overflow;
- long category name;
- category rows mode;
- search hidden;
- search empty;
- search focused;
- search with query;
- clear visible;
- clear activated;
- results filtered;
- no results;
- search loading;
- search error;
- long placeholder.

### 9.4 Box/tier selection

Required states:

- selector absent;
- no selection;
- option inactive;
- option active;
- hover;
- focus;
- pressed;
- disabled;
- loading;
- unavailable option;
- one option;
- many options;
- horizontal overflow;
- long option title;
- long subtext;
- selection changes required count;
- selection changes discount;
- prior selections invalidated;
- validation message.

### 9.5 Product grid and product card

Required card states:

- unselected;
- hover;
- focus-visible;
- pressed;
- selected;
- selected quantity one;
- selected quantity greater than one;
- maximum quantity;
- minimum quantity;
- add loading;
- quantity update loading;
- remove loading;
- add error;
- quantity error;
- dimmed after bundle limit;
- locked step;
- default included;
- included and non-removable;
- free gift locked;
- free gift unlocked;
- free gift selected;
- regular price;
- compare-at price;
- discounted price;
- free price;
- variant required;
- variant selected;
- multiple variants;
- unavailable variant;
- out of stock;
- product unavailable after selection;
- details modal available;
- no details modal;
- long title;
- one-word title;
- long variant name;
- high price;
- wide currency format;
- missing image;
- slow image;
- portrait image;
- landscape image;
- quantity 10+;
- selected indicator;
- no color-only selected treatment;
- reduced motion;
- high zoom;
- content translated to a long locale.

Required grid states:

- zero cards;
- one card;
- fewer cards than one row;
- complete row;
- incomplete final row;
- many cards;
- loading skeleton;
- collection pagination/loading;
- filtered result;
- no result;
- viewport transition;
- no horizontal overflow.

### 9.6 Variant selector

Required states:

- no variants;
- one variant;
- multiple option dimensions;
- no selection;
- selected;
- button mode;
- swatch mode;
- select mode;
- individual-product mode where supported;
- secondary options collapsed;
- secondary options expanded;
- overflow trigger;
- overflow panel open;
- available;
- unavailable;
- partially available combination;
- out of stock;
- keyboard selected;
- focus-visible;
- long label;
- long value;
- selected variant already exists;
- variant breakdown open;
- variant removed;
- add another variant.

### 9.7 Product details modal

Required states:

- closed;
- opening;
- open desktop;
- open mobile sheet;
- closing;
- backdrop click;
- close button;
- Escape close;
- focus moved inside;
- focus trapped;
- focus restored;
- image one;
- image carousel;
- thumbnail active;
- image loading;
- image error;
- regular price;
- sale price;
- variant required;
- variant selected;
- unavailable variant;
- quantity 1;
- quantity >1;
- max quantity;
- add enabled;
- add disabled;
- add pending;
- add success;
- add error;
- out of stock;
- selection summary;
- existing variants notice;
- variant breakdown popup;
- long description;
- scrollable content;
- sticky CTA;
- reduced motion.

### 9.8 Discount message and progress

Required states:

- discount feature absent;
- progress hidden;
- simple progress;
- step-based progress;
- one tier;
- multiple tiers;
- zero progress;
- partial before first tier;
- first tier reached;
- between tiers;
- later tier reached;
- final tier reached;
- progress decreases after removal;
- no longer eligible after removal;
- quantity threshold;
- amount threshold where supported;
- original and final total;
- savings amount;
- savings percentage;
- long merchant copy;
- placeholder failure fallback;
- progress animation;
- reduced motion;
- mobile compressed labels;
- tier overflow.

### 9.9 Desktop summary/sidebar

Required states:

- sidebar not applicable;
- loading skeleton;
- empty;
- one selection;
- partial;
- minimum reached;
- between tiers;
- tier reached;
- final tier reached;
- discount applied;
- original and final total;
- no discount total;
- box selection visible;
- box selection changed;
- product with variant;
- product quantity >1;
- default included product;
- free gift locked;
- free gift unlocked;
- add-on/upsell eligible;
- add-on/upsell reached;
- short list;
- long list;
- internal scrolling;
- product removed;
- clear all;
- clear pending;
- clear failure;
- back hidden;
- back visible;
- next disabled;
- next enabled;
- final CTA enabled;
- submit pending;
- submit failure;
- product unavailable;
- long title;
- long copy;
- high zoom;
- sticky at top;
- viewport too short;
- no horizontal overflow.

### 9.10 Mobile summary tray/footer

Required states:

- replacement absent outside mobile;
- collapsed empty;
- collapsed partial;
- collapsed complete;
- collapsed discount reached;
- expanded empty;
- expanded partial;
- expanded complete;
- expanded long list;
- internal scroll;
- backdrop open;
- backdrop closed;
- toggle focus;
- accessible `aria-expanded`;
- count badge zero;
- count badge one;
- count badge many;
- original and final total;
- CTA disabled;
- CTA enabled;
- submit loading;
- submit failure;
- narrow width;
- wide mobile;
- landscape;
- safe-area inset;
- software keyboard interaction;
- content padding prevents overlap;
- body scroll preserved or intentionally locked;
- close through toggle;
- close through backdrop where specified;
- close through Escape where specified;
- reduced motion.

### 9.11 Free gift, included product, add-on, and upsell

Required states:

- feature absent;
- locked;
- progress toward unlock;
- unlocked;
- automatically added;
- manually selected;
- removed where allowed;
- non-removable;
- out of stock;
- substitute required;
- original price shown;
- free price shown;
- badge text long;
- gift image missing;
- add-on eligible;
- add-on selected;
- add-on removed;
- upsell threshold not reached;
- upsell threshold reached;
- upsell selected;
- upsell unavailable.

### 9.12 Feedback

Required states:

- initial loading spinner;
- custom loading GIF/animation;
- skeleton;
- add success toast;
- remove success toast;
- undo available;
- undo activated;
- clear success;
- validation warning;
- recoverable error;
- blocking error;
- network error;
- stale price;
- stale stock;
- cart submit error;
- retrying;
- toast top;
- toast bottom;
- toast dismissed;
- long translated message.

---

## 10. FPB template specifications

Each template must have a template manifest containing:

```yaml
template:
family: FPB
intent:
density:
desktop_layout:
tablet_layout:
mobile_replacement:
product_card_adapter:
summary_adapter:
navigation_adapter:
progress_adapter:
modal_adapter:
allowed_overrides:
prohibited_overrides:
supported_configurations:
not_applicable_configurations:
required_state_boards:
required_viewports:
```

### 10.1 FPB Standard

**Role:** Family reference and complete feature baseline.

Design-system work:

- establish the canonical FPB anatomy;
- support the widest feature combination;
- define the base product card;
- define the base desktop summary;
- define the base mobile tray/footer;
- define step/category navigation;
- define simple and step-based discount progress;
- define product/variant/modal interaction;
- define skeleton and empty rows;
- define original/final totals;
- define default, gift, and add-on treatments.

Mandatory Standard boards:

1. no discount, no variants;
2. one tier;
3. multiple tiers;
4. one step;
5. multiple steps;
6. default-included products;
7. free gift;
8. variants inline;
9. variants in modal;
10. empty/partial/complete summary;
11. mobile collapsed/expanded;
12. loading/error;
13. long-content stress.

### 10.2 FPB Classic

**Role:** Compact, image-led cards with a right-side summary and compact mobile summary treatment.

Design-system work:

- preserve Classic-specific composition while consuming shared semantics;
- define icon CTA and its selected treatment;
- define compact product metadata;
- define card dimensions without selection layout shift;
- define the relationship between a denser grid and summary;
- define the Classic skeleton;
- define the Classic mobile two-column card behavior;
- define the Classic expanded summary tray;
- ensure variants remain discoverable even when not shown inline;
- ensure quantity is operable when the icon CTA expands or opens another interaction;
- remove static style ownership from runtime injection where the architecture permits.

Mandatory Classic boards:

1. unselected and selected card;
2. add icon and selected check;
3. inline quantity or alternate quantity interaction;
4. variant-required product;
5. compact four-column desktop stress;
6. two-column mobile stress;
7. empty/sidebar skeleton;
8. partial summary;
9. discount reached;
10. long selected-product list;
11. mobile collapsed/expanded;
12. narrow mobile;
13. long product title;
14. high zoom.

### 10.3 FPB Compact

**Role:** Highest information density while preserving legibility and touch accessibility.

Design-system work:

- define compact density aliases rather than arbitrary reduced values;
- preserve minimum tap target sizes;
- define compact image ratio and text clamps;
- decide whether price, variant, and quantity share one row;
- define summary density;
- define mobile transformation rather than merely shrinking desktop;
- validate long copy and translated content;
- prevent hidden functionality caused by density.

Mandatory Compact boards:

1. default dense grid;
2. selected quantity control;
3. compare-at and final price;
4. variants;
5. free gift and included badges;
6. progress with multiple tiers;
7. summary empty/partial/complete;
8. mobile tray;
9. 320px width;
10. 200% zoom;
11. long title and variant;
12. many selected products.

### 10.4 FPB Horizontal

**Role:** Lateral product cards with image, content, price, variant, and actions arranged horizontally.

Design-system work:

- define card row anatomy;
- define image width and vertical alignment;
- define action placement;
- define wrapping under long content;
- define mobile stacking;
- define row hover/selected/focus behavior;
- define quantity expansion without row-height instability;
- define list spacing and separators;
- define summary relationship.

Mandatory Horizontal boards:

1. regular row;
2. selected row;
3. quantity >1;
4. variant controls;
5. compare-at and final price;
6. long title;
7. missing image;
8. out of stock;
9. multi-row list;
10. summary states;
11. mobile stacked card;
12. narrow mobile;
13. high zoom.

---

# PART II — PPB DESIGN SYSTEM

## 11. PPB family contract

PPB is an embedded product-page bundle experience. It must coexist with the theme and product page while preserving bundle rules.

The shared PPB contract must support:

- parent product/page context;
- conditions;
- selectable products or collections;
- optional categories/groups;
- variants as individual products;
- variants as swatches or selectors;
- default/preselected products;
- quantity and slot constraints;
- discount messaging;
- price summary;
- primary bundle CTA;
- native product-page integration;
- loading, unavailable, and error states;
- four template compositions.

### 11.1 PPB configuration inventory

The exact 25+ runtime fields must be extracted. At minimum, the design system must cover these axes.

#### Identity and content

- widget title;
- widget subtitle;
- instruction text;
- parent product context;
- optional promotional copy;
- condition/progress copy;
- selected-count copy;
- CTA copy.

#### Template and layout

- Grid;
- List;
- Vertical Slots;
- Horizontal Slots;
- template ID;
- density;
- image size and ratio;
- grid columns;
- row layout;
- slot count;
- slot orientation;
- horizontal scroll;
- modal or inline product selection;
- placement relative to native product form;
- sticky behavior where applicable.

#### Product sources and grouping

- manual product selection;
- collections;
- conditions;
- group/category labels;
- products eligible by condition;
- hidden/ineligible products;
- default products;
- required products;
- duplicate product policy where supported;
- product ordering.

#### Variants

- display variants as individual products;
- display variants as swatches;
- inline button selector;
- dropdown selector;
- modal selector;
- multiple option dimensions;
- variant availability;
- parent product variant synchronization where applicable;
- selected variant summary.

#### Selection and conditions

- no minimum;
- minimum quantity;
- maximum quantity;
- exact quantity;
- minimum amount/value where supported;
- maximum amount/value where supported;
- per-product limits;
- per-group limits;
- required slots;
- optional slots;
- selection replacement;
- selection removal;
- invalid selection recovery.

#### Pricing and discount

- no discount;
- one tier;
- multiple tiers;
- quantity thresholds;
- amount thresholds where supported;
- percentage discount;
- fixed amount;
- fixed bundle price where supported;
- original subtotal;
- final subtotal;
- savings;
- per-product price visibility;
- discount progress;
- success message.

#### CTA and cart behavior

- CTA disabled until conditions met;
- CTA enabled;
- button text;
- button with total/count;
- loading;
- success;
- failure;
- retry;
- coexistence with or replacement of native add-to-cart where applicable;
- sold-out bundle;
- stock changed;
- cart validation message.

#### Merchant styling

- widget background;
- card/row/slot background;
- primary/secondary text;
- border;
- selected;
- button;
- focus;
- progress;
- discount;
- image fit;
- radius;
- spacing/density;
- typography;
- responsive visibility.

---

## 12. PPB universal component state catalog

### 12.1 Widget shell

Required states:

- loading;
- loaded;
- hidden/not eligible;
- unavailable parent product;
- no products;
- fatal error;
- recoverable error;
- title/subtitle short;
- title/subtitle long;
- theme background light;
- theme background dark;
- narrow product column;
- wide product column;
- high zoom;
- reduced motion.

### 12.2 Conditions and progress

Required states:

- no condition;
- minimum not started;
- partial;
- one item remaining;
- minimum met;
- exact quantity met;
- below exact quantity;
- above exact quantity;
- maximum not reached;
- maximum reached;
- amount condition partial;
- amount condition met;
- multiple conditions;
- conflicting/invalid condition data;
- no discount;
- one discount tier;
- multiple tiers;
- tier reached;
- final tier reached;
- selection removal reduces progress;
- long condition copy;
- placeholders and pluralization.

### 12.3 PPB product item

Required states:

- unselected;
- hover;
- focus;
- pressed;
- selected;
- selected quantity one;
- quantity >1;
- max quantity;
- disabled after condition limit;
- required/default selected;
- non-removable;
- regular price;
- compare-at and sale price;
- variant required;
- variant selected;
- individual variant item;
- swatch selector;
- unavailable variant;
- out of stock;
- image missing;
- long title;
- long variant;
- loading;
- update error;
- narrow container;
- high zoom.

### 12.4 Slot primitive

Required states:

- empty;
- active target;
- focused;
- hover;
- filled;
- filled with quantity;
- filled with variant;
- required;
- optional;
- locked;
- disabled;
- loading;
- invalid;
- product unavailable;
- replace available;
- remove available;
- remove disabled;
- duplicate disallowed;
- duplicate allowed where supported;
- long product title;
- missing image;
- many slots;
- horizontal overflow;
- vertical overflow;
- drag/reorder only if supported;
- keyboard selection;
- modal selector open.

### 12.5 PPB summary and CTA

Required states:

- zero selected;
- partial;
- conditions met;
- exact quantity met;
- over-limit invalid;
- original subtotal;
- final subtotal;
- savings;
- no discount;
- discount applied;
- selected count singular;
- selected count plural;
- CTA disabled;
- CTA enabled;
- CTA loading;
- CTA success;
- CTA failure;
- stock changed;
- price changed;
- validation message;
- long copy;
- sticky/mobile behavior if applicable.

### 12.6 PPB modal or picker

Required states:

- closed;
- opening;
- open;
- search;
- category filter;
- no results;
- product selected;
- variant selected;
- product unavailable;
- replace slot;
- add to slot;
- close;
- Escape;
- focus trap;
- focus restore;
- mobile sheet;
- long list;
- loading/error.

### 12.7 Native product-page integration

Required states:

- theme form not yet hydrated;
- PPB widget hydrated;
- parent variant changed;
- parent product unavailable;
- native quantity changed where relevant;
- native add-to-cart coexistence;
- native button replaced/disabled only where specified;
- bundle CTA submit;
- theme section re-render;
- accelerated checkout present;
- sticky product form;
- dynamic checkout present;
- app block removed;
- app block moved;
- no duplicate cart submissions;
- no duplicate network requests;
- no layout shift.

---

## 13. PPB template specifications

### 13.1 PPB Grid

**Role:** Card-based comparison and selection.

Design-system work:

- define responsive columns based on container width, not only viewport;
- define card height and title clamp;
- define selected and quantity states;
- define variants as cards or swatches;
- define progress and CTA relationship;
- define mobile density;
- ensure odd final rows and narrow theme columns are stable.

Mandatory boards:

1. default grid;
2. selected card;
3. quantity control;
4. variants individual;
5. variants swatches;
6. discount progress;
7. conditions unmet/met;
8. CTA disabled/enabled;
9. narrow product column;
10. mobile;
11. long content;
12. out of stock.

### 13.2 PPB List

**Role:** Information-rich product rows.

Design-system work:

- define image/content/price/action columns;
- define responsive wrapping;
- keep quantity and variant controls aligned;
- define row selected treatment;
- define separators;
- define mobile stacking;
- handle long titles and many option values.

Mandatory boards:

1. default row;
2. selected row;
3. quantity >1;
4. variant controls;
5. compare-at and final price;
6. required/default product;
7. OOS;
8. long list;
9. condition progress;
10. CTA states;
11. narrow mobile;
12. 200% zoom.

### 13.3 PPB Vertical Slots

**Role:** Sequential, vertically stacked slot-filling flow.

Design-system work:

- define slot numbering;
- define empty and filled anatomy;
- define active slot;
- define required/optional treatment;
- define replace/remove;
- define picker/modal;
- define vertical progression and completion;
- keep CTA visible after long lists;
- define mobile behavior.

Mandatory boards:

1. all empty;
2. first slot active;
3. partial filled;
4. complete;
5. slot with variant;
6. invalid/unavailable slot;
7. replace flow;
8. remove flow;
9. condition and discount reached;
10. long product names;
11. mobile;
12. loading/error.

### 13.4 PPB Horizontal Slots

**Role:** Horizontally arranged slot-filling flow.

Design-system work:

- define slot width and horizontal overflow;
- define scroll affordance;
- define active/filled state;
- preserve keyboard access;
- define snap behavior only if appropriate;
- ensure CTA and progress are not pushed off-screen;
- define mobile horizontal scrolling;
- define many-slot stress.

Mandatory boards:

1. all empty;
2. one active;
3. partial;
4. complete;
5. many slots overflow;
6. variant selected;
7. replace/remove;
8. unavailable slot;
9. discount reached;
10. desktop narrow container;
11. mobile;
12. keyboard focus during horizontal scroll.

---

## 14. FPB/PPB configuration applicability matrix

Legend:

- `R` — required design-system support;
- `A` — applicable through family/template adapter;
- `D` — discovery required before confirming current merchant exposure;
- `N/A` — not normally applicable.

| Configuration | FPB Std | FPB Classic | FPB Compact | FPB Horizontal | PPB Grid | PPB List | PPB Vertical Slots | PPB Horizontal Slots |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Bundle title/subtitle | R | R | R | R | R | R | R | R |
| Promo banner | R | A | A | A | D | D | D | D |
| Multiple steps | R | R | R | R | N/A/D | N/A/D | N/A/D | N/A/D |
| Step timeline/tabs | R | A | A | A | N/A/D | N/A/D | N/A/D | N/A/D |
| Category navigation | R | R | R | R | D | D | D | D |
| Search | R | R | R | R | D | D | D | D |
| Product/collection sources | R | R | R | R | R | R | R | R |
| Conditions | R | R | R | R | R | R | R | R |
| Box/tier selection | R | R | R | R | D | D | D | D |
| Default/preselected products | R | R | R | R | R | R | R | R |
| Required/included products | R | R | R | R | R | R | R | R |
| Variants as individual products | D | D | D | D | R | R | R | R |
| Variants as swatches | R/D | R/D | R/D | R/D | R | R | R | R |
| Variants in modal | R | R | R | R | A | A | R | R |
| Inline quantity | R | A | R | R | R | R | A | A |
| Product details modal | R | R | R | R | D | D | A | A |
| Compare-at/final price | R | R | R | R | R | R | R | R |
| No discount | R | R | R | R | R | R | R | R |
| Single discount tier | R | R | R | R | R | R | R | R |
| Multiple discount tiers | R | R | R | R | R | R | R | R |
| Simple progress | R | R | R | R | R | R | R | R |
| Step-based progress | R | R | R | R | D | D | D | D |
| Free gift | R | R | R | R | D | D | D | D |
| Add-on/upsell | R | R | R | R | D | D | D | D |
| Desktop summary sidebar | R | R | R | R | N/A | N/A | N/A | N/A |
| Mobile summary tray/footer | R | R | R | R | N/A/D | N/A/D | N/A/D | N/A/D |
| Inline PPB summary | N/A | N/A | N/A | N/A | R | R | R | R |
| Empty slots | N/A | N/A | N/A | N/A | N/A | N/A | R | R |
| Replace slot | N/A | N/A | N/A | N/A | N/A | N/A | R | R |
| Native PDP integration | N/A | N/A | N/A | N/A | R | R | R | R |
| Merchant copy | R | R | R | R | R | R | R | R |
| Merchant design tokens | R | R | R | R | R | R | R | R |
| Loading/error/toast | R | R | R | R | R | R | R | R |

`D` cannot remain in a release-ready registry. It must become `CONFIRMED_CURRENT`, `PROPOSED_MERCHANT_SETTING`, or `NOT_APPLICABLE`.

---

# PART III — MERCHANT-EDITABLE COPY SYSTEM

## 15. Copy architecture

Create one typed copy schema shared across Admin preview and storefront.

### 15.1 Rules

1. Every copy field has a stable semantic ID.
2. Do not bind components directly to Admin labels.
3. Preserve safe system fallbacks.
4. Validate placeholders.
5. Support pluralization.
6. Escape or sanitize merchant input.
7. Rich text is disabled unless explicitly required.
8. Copy fields cannot inject scripts, attributes, or arbitrary HTML.
9. Empty merchant values follow an explicit policy:
   - hide optional surface;
   - use fallback;
   - block save for required fields.
10. Preview all dynamic states in Admin.
11. Warn when copy is likely to overflow, but do not silently truncate the stored text.
12. Store copy separately from visual tokens.
13. Support future localization without renaming IDs.
14. Accessibility labels must remain meaningful even when visible copy is highly customized.

### 15.2 Allowed placeholders

Use a documented set such as:

```text
{{bundle_title}}
{{step_name}}
{{category_name}}
{{selected_count}}
{{required_count}}
{{remaining_count}}
{{minimum_count}}
{{maximum_count}}
{{box_size}}
{{tier_name}}
{{discount_value}}
{{discount_type}}
{{remaining_amount}}
{{subtotal}}
{{original_total}}
{{final_total}}
{{savings_amount}}
{{savings_percent}}
{{product_title}}
{{variant_title}}
{{quantity}}
{{gift_title}}
```

Every field must declare its allowed subset. Unsupported placeholders should produce an Admin validation error and use a safe fallback on the storefront.

---

## 16. Merchant copy catalog

The initial audit must mark each entry as currently editable, newly discovered, proposed, system-generated, or localizable system copy.

### 16.1 Shared bundle identity

| Copy ID | Surface | Example fallback | Dynamic values |
|---|---|---|---|
| `bundle.title` | Primary bundle heading | Build your bundle | — |
| `bundle.subtitle` | Supporting heading | Choose your favourites and save | — |
| `bundle.instructions` | General instructions | Select products to complete your bundle | required/selected |
| `bundle.unavailable` | Unavailable bundle | This bundle is currently unavailable | — |
| `bundle.loadError` | Fatal load error | We couldn’t load this bundle | — |
| `bundle.retry` | Retry action | Try again | — |

### 16.2 FPB page, step, and category copy

| Copy ID | Surface | Example fallback | Dynamic values |
|---|---|---|---|
| `fpb.contentTitle` | Full-page content title | Build your box | — |
| `fpb.contentSubtitle` | Full-page content subtitle | Complete each step below | — |
| `fpb.stepTitle` | Step heading | Step {{step_name}} | step |
| `fpb.stepSubtext` | Step helper | Choose {{required_count}} items | required |
| `fpb.stepComplete` | Completion message | Step complete | step |
| `fpb.stepLocked` | Locked message | Complete the previous step first | step |
| `fpb.categoryTitle` | Category section title | Choose from {{category_name}} | category |
| `fpb.searchPlaceholder` | Search input | Search products | — |
| `fpb.searchClear` | Clear search accessible copy | Clear search | — |
| `fpb.noSearchResultsTitle` | Filtered empty title | No products found | — |
| `fpb.noSearchResultsBody` | Filtered empty body | Try another search | — |
| `fpb.previousStep` | Back button | Back | — |
| `fpb.nextStep` | Next button | Next | — |
| `fpb.continue` | Continue button | Continue | — |
| `fpb.finish` | Final-step action | Review bundle | — |

Step and category names entered by the merchant are content, even when they are stored inside step/category data rather than a dedicated text configuration object.

### 16.3 Promo banner copy

| Copy ID | Surface | Example fallback |
|---|---|---|
| `promo.eyebrow` | Banner eyebrow/subtitle | Build and save |
| `promo.title` | Banner title | Create your perfect bundle |
| `promo.noteNoDiscount` | No-discount note | Choose products to get started |
| `promo.noteDiscountAvailable` | Discount note | Save more as you add products |
| `promo.noteDiscountReached` | Reached note | Your discount is active |

### 16.4 Product card and selection copy

| Copy ID | Surface | Example fallback | Status guidance |
|---|---|---|---|
| `product.add` | Text CTA | Add | merchant-editable where text CTA exists |
| `product.added` | Selected text | Added | merchant-editable/localizable |
| `product.chooseOptions` | Variant CTA | Choose options | merchant-editable/localizable |
| `product.updateOptions` | Variant update CTA | Update options | merchant-editable/localizable |
| `product.remove` | Remove action | Remove | merchant-editable/localizable |
| `product.includedBadge` | Included badge | Included | merchant-editable |
| `product.freeBadge` | Gift badge | Free | merchant-editable |
| `product.selectedBadge` | Selected badge | Selected | merchant-editable/localizable |
| `product.outOfStock` | Stock state | Out of stock | localizable system copy |
| `product.unavailable` | Availability | Unavailable | localizable system copy |
| `product.maxQuantity` | Limit message | Maximum quantity reached | localizable or merchant copy |
| `product.missingImageAlt` | Accessible fallback | Product image unavailable | localizable system copy |

Icon-only plus, check, remove, and quantity controls require accessible labels even when no visible merchant copy is shown.

### 16.5 Variant and quantity copy

| Copy ID | Surface | Example fallback |
|---|---|---|
| `variant.choose` | Variant instruction | Choose an option |
| `variant.selectLabel` | Select label | Select {{variant_title}} |
| `variant.unavailable` | Unavailable option | Unavailable |
| `variant.existingNoticeTitle` | Existing variants notice | Already in your bundle |
| `variant.existingNoticeBody` | Notice body | You have selected other variants of this product |
| `variant.viewSelected` | Link | View selected variants |
| `variant.addAnother` | Action | Add another variant |
| `variant.remove` | Remove variant | Remove |
| `quantity.label` | Quantity label | Quantity |
| `quantity.increase` | Accessible increase label | Increase quantity |
| `quantity.decrease` | Accessible decrease label | Decrease quantity |
| `quantity.value` | Accessible quantity value | Quantity {{quantity}} |

### 16.6 Box and tier copy

| Copy ID | Surface | Example fallback | Dynamic values |
|---|---|---|---|
| `box.heading` | Selector heading | Choose your box | — |
| `box.instructions` | Selector helper | Select a bundle size to continue | — |
| `box.optionTitle` | Option label | Box of {{box_size}} | size |
| `box.optionSubtext` | Option helper | Choose {{required_count}} products | required |
| `box.changeWarning` | Change warning | Changing size may update your selections | — |
| `tier.label` | Tier label | {{tier_name}} | tier |
| `tier.requirement` | Tier helper | {{required_count}} items | required |

### 16.7 Discount and progress copy

| Copy ID | Surface | Example fallback | Allowed placeholders |
|---|---|---|---|
| `discount.none` | No-discount message | Build your bundle | selected/required |
| `discount.beforeFirstTier` | Before threshold | Add {{remaining_count}} more to unlock {{discount_value}} off | remaining, discount |
| `discount.beforeAmountTier` | Amount threshold | Add {{remaining_amount}} more to unlock {{discount_value}} off | amount, discount |
| `discount.betweenTiers` | Between thresholds | Add {{remaining_count}} more to unlock {{discount_value}} off | remaining, discount |
| `discount.tierReached` | Reached message | You unlocked {{discount_value}} off | discount |
| `discount.finalTierReached` | Final success | You unlocked the best discount | discount |
| `discount.applied` | Applied label | Discount applied | discount |
| `discount.savingsBadge` | Savings badge | Save {{savings_amount}} | savings |
| `discount.percentBadge` | Percentage badge | {{savings_percent}} off | percentage |
| `discount.progressLabel` | Accessible progress | Bundle discount progress | — |
| `discount.tierTitle` | Tier title | {{discount_value}} off | discount |
| `discount.tierSubtitle` | Tier requirement | At {{required_count}} items | required |
| `discount.removedRegression` | After removal | Add {{remaining_count}} more to restore your discount | remaining |

Pluralization must support “1 item” versus “2 items.”

### 16.8 FPB summary/sidebar/footer copy

| Copy ID | Surface | Example fallback | Dynamic values |
|---|---|---|---|
| `summary.title` | Summary heading | Your bundle | — |
| `summary.subtitle` | Summary helper | Review your selections | — |
| `summary.emptyTitle` | Empty title | Your bundle is empty | — |
| `summary.emptyBody` | Empty body | Add products to get started | — |
| `summary.itemCount` | Count | {{selected_count}} selected | selected |
| `summary.itemCountSingular` | Singular count | 1 item selected | — |
| `summary.itemCountPlural` | Plural count | {{selected_count}} items selected | selected |
| `summary.clearAll` | Clear action | Clear all | — |
| `summary.removeItem` | Remove label | Remove {{product_title}} | product |
| `summary.viewItems` | Expand label | View items | selected |
| `summary.hideItems` | Collapse label | Hide items | selected |
| `summary.subtotal` | Subtotal label | Subtotal | — |
| `summary.originalTotal` | Original total label | Original total | — |
| `summary.discount` | Discount label | Discount | — |
| `summary.savings` | Savings label | You save | — |
| `summary.total` | Final total label | Total | — |
| `summary.back` | Back action | Back | — |
| `summary.next` | Next action | Next | — |
| `summary.continue` | Continue action | Continue | — |
| `summary.addToCart` | Final CTA | Add bundle to cart | total/count where allowed |
| `summary.addingToCart` | Loading CTA | Adding… | — |
| `summary.submitError` | Submit error | We couldn’t add this bundle. Try again. | — |
| `summary.retry` | Retry action | Try again | — |

The source inventory should verify current summary title and subtitle fields first, then map all other current copy controls or classify them as proposed/system-owned.

### 16.9 Gift, included product, add-on, and upsell copy

| Copy ID | Surface | Example fallback | Dynamic values |
|---|---|---|---|
| `gift.heading` | Gift section | Free gift | — |
| `gift.locked` | Locked state | Add {{remaining_count}} more to unlock your gift | remaining |
| `gift.unlocked` | Unlocked state | You unlocked {{gift_title}} | gift |
| `gift.badge` | Badge | Free gift | — |
| `gift.price` | Price label | Free | — |
| `included.badge` | Included badge | Included | — |
| `included.message` | Included helper | Included with your bundle | — |
| `addon.heading` | Add-on heading | Complete your bundle | — |
| `addon.message` | Add-on helper | Add an optional extra | — |
| `addon.add` | Add action | Add | — |
| `addon.remove` | Remove action | Remove | — |
| `upsell.beforeThreshold` | Upsell helper | Add {{remaining_count}} more to unlock this option | remaining |
| `upsell.reached` | Eligible state | This option is now available | — |

### 16.10 Modal copy

| Copy ID | Surface | Example fallback |
|---|---|---|
| `modal.close` | Accessible close | Close product details |
| `modal.previousImage` | Carousel action | Previous image |
| `modal.nextImage` | Carousel action | Next image |
| `modal.imageCounter` | Counter | Image {{current}} of {{total}} |
| `modal.add` | Add action | Add to bundle |
| `modal.update` | Update action | Update selection |
| `modal.adding` | Loading action | Adding… |
| `modal.outOfStock` | Disabled action | Out of stock |
| `modal.selectionSummary` | Existing selection | {{quantity}} selected |
| `modal.descriptionHeading` | Optional heading | Product details |

### 16.11 PPB copy

| Copy ID | Surface | Example fallback | Dynamic values |
|---|---|---|---|
| `ppb.title` | Widget heading | Build your bundle | — |
| `ppb.subtitle` | Widget helper | Choose products below | — |
| `ppb.instructions` | Selection instructions | Select {{required_count}} items | required |
| `ppb.selectedCount` | Count | {{selected_count}} selected | selected |
| `ppb.conditionRemaining` | Condition message | Choose {{remaining_count}} more | remaining |
| `ppb.conditionMet` | Condition success | Bundle complete | — |
| `ppb.minimumError` | Validation | Select at least {{minimum_count}} items | minimum |
| `ppb.maximumError` | Validation | Select no more than {{maximum_count}} items | maximum |
| `ppb.exactError` | Validation | Select exactly {{required_count}} items | required |
| `ppb.amountRemaining` | Amount condition | Add {{remaining_amount}} more | amount |
| `ppb.addToCart` | Main CTA | Add bundle to cart | total/count |
| `ppb.addingToCart` | Loading CTA | Adding… | — |
| `ppb.submitError` | Error | We couldn’t add this bundle | — |
| `ppb.retry` | Retry | Try again | — |
| `ppb.soldOut` | Sold-out state | Bundle unavailable | — |

### 16.12 Slot copy

| Copy ID | Surface | Example fallback | Dynamic values |
|---|---|---|---|
| `slot.label` | Slot label | Item {{position}} | position |
| `slot.empty` | Empty state | Choose a product | position |
| `slot.required` | Required marker | Required | — |
| `slot.optional` | Optional marker | Optional | — |
| `slot.select` | Select action | Select product | — |
| `slot.replace` | Replace action | Replace | product |
| `slot.remove` | Remove action | Remove | product |
| `slot.unavailable` | Invalid product | Selection unavailable | — |
| `slot.complete` | Completion | Slot complete | position |
| `slot.progress` | Overall slot progress | {{selected_count}} of {{required_count}} filled | selected/required |

### 16.13 Feedback and validation copy

Classify these carefully. Most should be product-owned localizable copy rather than unrestricted merchant text:

- added to bundle;
- removed from bundle;
- bundle cleared;
- undo;
- dismiss;
- choose a variant;
- minimum not met;
- maximum reached;
- exact quantity required;
- required step incomplete;
- product unavailable;
- variant unavailable;
- stock changed;
- price changed;
- connection error;
- retry;
- cart error;
- generic unexpected error.

### 16.14 Copy stress requirements

Every visible copy surface must be tested with:

- empty optional copy;
- maximum recommended length;
- 2× English length;
- one unbroken long word;
- plural singular;
- plural many;
- currency placeholders;
- unsupported placeholder;
- missing placeholder value;
- HTML-like input;
- emoji;
- right-to-left locale where supported;
- high zoom;
- narrow mobile.

---

# PART IV — CONFIGURATION COMBINATION STRATEGY

## 17. Avoiding a Cartesian test explosion

Do not test only happy paths, but do not blindly render every mathematical combination.

Use four levels.

### Level 1 — Single-axis contract tests

Every configuration is tested independently against its default family template.

### Level 2 — Pairwise interaction coverage

Generate pairwise combinations among:

- template;
- steps/conditions;
- variants;
- quantity;
- discount;
- default products;
- gifts/add-ons;
- summary type;
- mobile replacement;
- copy length;
- merchant colors.

### Level 3 — Critical full combinations

Mandatory integrated fixtures:

1. FPB multi-step + variants + multiple discount tiers + default included.
2. FPB box selection + quantity limits + free gift + add-on.
3. FPB Classic + modal variants + long summary list + mobile expanded tray.
4. FPB Horizontal + long titles + compare-at pricing + quantity 10+.
5. PPB Grid + individual variants + multiple tiers + narrow theme column.
6. PPB List + swatches + OOS variants + long copy.
7. PPB Vertical Slots + exact quantity + replace/remove + discount.
8. PPB Horizontal Slots + many slots + horizontal overflow + keyboard.
9. No discount + no variants + minimal copy.
10. Missing images + slow network + recoverable error.
11. Merchant colors at contrast boundary.
12. Long translated copy at 320px and 200% zoom.

### Level 4 — Release exhaustive matrix

Before design-system release, every confirmed setting must appear in at least one end-to-end browser fixture for every applicable family. Template-specific settings must appear in that template.

---

# PART V — RESPONSIVE DESIGN CONTRACT

## 18. Required responsive documentation

For every component and template, document:

- layout mode;
- order;
- width behavior;
- height behavior;
- min/max;
- visibility;
- replacement component;
- sticky/fixed behavior;
- scroll container;
- overflow policy;
- image fit;
- title clamp;
- control sizing;
- copy wrapping;
- safe-area behavior;
- orientation behavior;
- keyboard interaction;
- high zoom behavior.

“Responsive” is not an acceptable specification by itself.

### 18.1 FPB transformations

At minimum:

- desktop summary sidebar → mobile summary tray/footer;
- desktop multi-column grid → fewer columns;
- horizontal template → stacked mobile card;
- timeline/tabs → scrollable navigation;
- modal dialog → mobile bottom sheet where specified;
- long summary list → bounded internal scroll;
- fixed tray → page bottom padding;
- promo banner → reduced height without unreadable copy.

### 18.2 PPB transformations

At minimum:

- grid columns respond to container width;
- list rows stack at narrow width;
- vertical slots maintain order;
- horizontal slots expose scrolling and focus;
- product controls stay reachable;
- CTA does not overflow;
- widget coexists with theme sticky forms;
- modal/picker becomes a mobile sheet where specified.

---

# PART VI — AUTOMATED TESTING WITH CHROME DEVTOOLS

## 19. Testing layers

### 19.1 Static/schema tests

Test:

- configuration registry validity;
- copy registry validity;
- duplicate IDs;
- allowed values;
- token references;
- merchant override coverage;
- state coverage;
- template applicability;
- placeholder validity;
- copy fallback completeness;
- no obsolete template names;
- no competitor identifiers in production code;
- no hard-coded merchant-controlled colors/copy in template adapters.

### 19.2 Unit tests

Unit tests may assert business and rendering semantics, but must not be used as substitutes for visual placement tests.

Test:

- state reducers/transitions;
- condition completion;
- quantity limits;
- discount tier resolution;
- progress percentage;
- default products;
- gifts;
- variants;
- summary totals;
- copy placeholder interpolation;
- pluralization;
- fallback resolution;
- template adapter selection;
- responsive component replacement decision;
- retry/error state.

Do not write brittle unit tests that assert CSS class names, pixel placement, or stylesheet text.

### 19.3 Integration tests

Test:

- Admin save → persisted data;
- persisted data → serialized storefront payload;
- payload → component state;
- settings change → storefront output;
- add/remove/quantity → totals and progress;
- variant selection → cart data;
- template switch → same business state;
- copy edit → exact storefront copy;
- merchant token edit → correct semantic surface;
- bundle sync/version change where required;
- cart request format and validation.

---

## 20. Chrome DevTools preflight

Chrome QA is a hard gate.

Verify:

- Chrome DevTools MCP connected;
- supported Chrome available;
- intended page selected;
- correct local/development/staging environment;
- app server reachable;
- fixture route available;
- authentication intentional;
- no unrelated sensitive tabs;
- 100% zoom;
- explicit viewport;
- screenshots can be saved to an approved temporary/QA location;
- console inspection works;
- network inspection works;
- repository branch/commit recorded;
- design-system revision recorded;
- baseline revision recorded.

If preflight fails, mark QA `BLOCKED`. Do not claim pass.

### 20.1 Deterministic setup

Before every capture:

1. Use stable fixture products, images, prices, inventory, locale, currency, and time.
2. Bypass cache and hard reload.
3. Clear Cache Storage when appropriate.
4. Wait for application hydration.
5. Wait for `document.fonts.ready`.
6. Wait for all required images.
7. Set deterministic scroll position.
8. Disable nonessential animation for static comparison through reversible test-only CSS.
9. Do not disable the interaction being tested.
10. Hide transient carets only for screenshot stability.
11. Mask only approved dynamic regions.
12. Record viewport and device-pixel-ratio policy.

---

## 21. Chrome test sequence

For every required state:

1. Navigate to deterministic fixture.
2. Set viewport.
3. Hard reload with cache bypass.
4. Take a fresh accessibility-tree snapshot.
5. Locate controls from the current snapshot.
6. Drive interactions through click, hover, keyboard, fill, drag, or dialog tools as applicable.
7. Evaluate in-page semantic and geometry assertions.
8. Capture component screenshot.
9. Capture contextual viewport screenshot where layout relationship matters.
10. Inspect console.
11. Inspect network.
12. Record result and evidence.
13. Reset fixture before the next independent state.

At the end:

- run Lighthouse accessibility and best-practices checks where applicable;
- run a performance trace when layout, image loading, CSS injection, or interaction behavior changed;
- compare against approved baselines;
- create measured remediation;
- rerun affected checks;
- rerun full mandatory matrix before approval.

---

## 22. Mandatory in-page assertions

### Existence and replacement

- expected component exists;
- hidden component is not exposed;
- mobile replacement is active;
- desktop component is inactive on mobile;
- correct template adapter is applied.

### Geometry

- component bounding box within approved tolerance;
- selected and unselected card external dimensions are equal;
- image ratio correct;
- button dimensions correct;
- sidebar/tray width correct;
- gap/padding correct;
- sticky/fixed offset correct;
- tray does not cover CTA or content;
- intended internal scroll container exists.

### Overflow

- no unintended document horizontal overflow;
- no component horizontal overflow unless explicitly designed;
- titles clamp/wrap as specified;
- badges remain inside intended bounds;
- horizontal slots remain keyboard reachable;
- safe-area padding present;
- modal content scrolls without hiding CTA.

### State and interaction

- add occurs once;
- repeated click does not duplicate unintentionally;
- quantity changes once;
- totals update;
- progress updates;
- remove updates state;
- clear resets state;
- box change follows expected selection policy;
- expand/collapse updates visual and accessible state;
- Escape closes specified overlays;
- focus returns;
- CTA gating follows conditions;
- failed submission exposes recovery.

### Style and merchant tokens

- expected token resolves;
- no hard-coded fallback overrides merchant value;
- contrast pair remains valid;
- focus outline visible;
- selected state has non-color cue;
- disabled treatment correct;
- reduced-motion behavior correct.

### Accessibility

- controls have accessible names;
- buttons are semantic buttons;
- `aria-expanded`, selected, current, and disabled states are accurate;
- no duplicate IDs;
- focus order follows task order;
- keyboard completes flow;
- errors are associated and announced;
- images follow alt policy.

### Copy

- exact approved copy;
- correct placeholders;
- correct singular/plural;
- fallback used when optional value missing;
- unsupported placeholder handled;
- long copy follows wrapping policy;
- system errors remain understandable;
- no unsanitized HTML.

### Resource health

- required images have nonzero natural dimensions;
- no failed CSS/JS/image/font requests;
- no unexpected duplicate API requests;
- no uncaught errors;
- no unhandled rejections;
- no new severe warnings.

---

## 23. Browser test tiers

### Per-pull-request smoke

For all eight templates:

- 390 × 844;
- 1440 × 900;
- default;
- selected;
- quantity;
- discount progress;
- CTA disabled/enabled;
- one variant;
- empty/loading;
- console/network.

### Family regression

For all FPB templates:

- empty;
- partial;
- complete;
- multiple tiers;
- variants;
- long summary;
- mobile collapsed/expanded;
- modal.

For all PPB templates:

- zero/partial/complete;
- conditions;
- variants;
- discount;
- CTA;
- narrow container;
- slot states where applicable.

### Nightly/full

- full viewport matrix;
- breakpoint boundaries;
- pairwise configuration fixtures;
- long content;
- missing/slow images;
- reduced motion;
- 200% zoom;
- Lighthouse;
- performance traces;
- visual diffs.

### Release

- every confirmed setting represented;
- every merchant copy field represented;
- all critical combinations;
- no unresolved blocker/high issue;
- complete non-regression.

---

## 24. Visual comparison policy

Use automated and semantic review.

### Automated output

- baseline and actual dimensions;
- mismatch ratio;
- changed-region bounding box;
- allowed masks;
- threshold;
- pass/fail;
- diff image.

### Semantic review

Review:

- hierarchy;
- spacing;
- alignment;
- text wrapping;
- state clarity;
- affordance;
- responsive transformation;
- visual weight;
- sibling regressions.

Do not approve solely from one global pixel percentage.

Recommended principles:

- deterministic component prototypes: strict threshold;
- raster product imagery: mask image content or use image-region tolerance;
- major boundaries: approximately 4 CSS pixels maximum unless approved;
- no unexpected wrapping;
- no horizontal overflow;
- no clipped indicators;
- no layout shift during ordinary selection changes.

Raw investigation screenshots must follow repository policy and should not be committed when prohibited. Store ephemeral evidence in QA artifacts; version approved design specifications and permitted baselines according to project rules.

---

## 25. Performance checks

Record:

- LCP impact when bundle images or CSS affect initial rendering;
- CLS during hydration, image load, selection, quantity morph, progress updates, and tray appearance;
- interaction latency for add, quantity, remove, expand/collapse, modal open, variant selection, and CTA;
- duplicate network requests;
- excessive runtime style injection;
- long-list scrolling;
- modal/tray animation.

Use performance traces, not a single Lighthouse performance score, for component-level diagnosis. Treat local timings as lab evidence.

---

# PART VII — EXECUTION PHASES

## 26. Phase sequence

### Phase 0 — Inventory and evidence

Outputs:

- configuration registry;
- copy registry;
- state registry;
- component registry;
- ownership map;
- gap report.

Stop when every current setting and visible copy surface is classified.

### Phase 1 — Foundations

Outputs:

- tokens;
- merchant token contract;
- typography;
- spacing/density;
- geometry;
- motion;
- responsive and accessibility foundations.

Stop when all existing merchant design settings map to semantic tokens.

### Phase 2 — Shared primitives

Outputs:

- buttons;
- price;
- quantity;
- variants;
- media;
- badges;
- progress;
- rows;
- feedback;
- modal.

Stop when primitives support all universal states without family-specific duplication.

### Phase 3 — FPB family contract and Standard

Outputs:

- FPB anatomy;
- FPB state model;
- Standard design;
- desktop summary;
- mobile tray;
- complete core fixtures.

Stop when Standard passes the full FPB feature matrix.

### Phase 4 — FPB template adapters

Order:

1. Classic
2. Compact
3. Horizontal

For each:

- current screenshot audit;
- approved design direction;
- full state boards;
- responsive contract;
- implementation handoff;
- Chrome QA;
- sibling non-regression.

Stop when all four FPB templates pass shared and template-specific matrices.

### Phase 5 — PPB family contract and Grid

Outputs:

- PPB anatomy;
- conditions/progress;
- item/summary/CTA;
- native PDP integration;
- Grid design;
- core PPB fixtures.

Stop when Grid passes the full PPB non-slot matrix.

### Phase 6 — PPB template adapters

Order:

1. List
2. Vertical Slots
3. Horizontal Slots

Stop when all four PPB templates pass shared and template-specific matrices.

### Phase 7 — Merchant copy completion

Outputs:

- typed copy schema;
- Admin copy editor mapping;
- live previews for all states;
- placeholder validation;
- fallback and localization behavior;
- long-copy QA.

Stop when every merchant-editable copy field has exact Admin-to-storefront verification.

### Phase 8 — Automated QA and visual regression

Outputs:

- generated browser plan;
- deterministic fixtures;
- Chrome evidence;
- visual diffs;
- accessibility report;
- performance report;
- non-regression matrix.

Stop when no mandatory case is missing evidence.

### Phase 9 — Migration and rollout

Tasks:

- map old settings to canonical fields only where current project policy permits;
- otherwise require bundle sync/version update;
- bump widget/design-system version;
- provide merchant preview;
- stage rollout;
- monitor errors and visual regressions;
- document rollback.

Stop when existing supported bundles render correctly after the approved migration/sync policy.

### Phase 10 — Governance

Establish:

- component owner;
- token owner;
- copy owner;
- template owner;
- review rules;
- change classification;
- visual approval;
- changelog;
- deprecation policy;
- quarterly configuration audit.

---

## 27. Task template for each component

Every component task must contain:

```text
Goal
Applicable family/templates
Business semantics
Anatomy
Configurations
Merchant tokens
Merchant copy
States
Responsive behavior
Interaction behavior
Accessibility
Content stress
Fixtures
Admin preview
Storefront implementation ownership
Unit/integration tests
Chrome cases
Visual baselines
Non-regression scope
Acceptance criteria
Stopping criteria
```

---

## 28. Template completion checklist

A template is complete only when:

- [ ] intent and differentiators are documented;
- [ ] shared business logic is reused;
- [ ] template adapter contains presentation only;
- [ ] all applicable configurations are mapped;
- [ ] all applicable copy fields render;
- [ ] default, hover, focus, pressed, disabled, loading, and error states exist;
- [ ] product selection states exist;
- [ ] quantity states exist;
- [ ] variant states exist;
- [ ] pricing and discount states exist;
- [ ] empty/partial/complete states exist;
- [ ] long-content states exist;
- [ ] missing-image and out-of-stock states exist;
- [ ] desktop and mobile contracts exist;
- [ ] 320px and 200% zoom pass;
- [ ] keyboard completion passes;
- [ ] focus-visible passes;
- [ ] contrast passes;
- [ ] no horizontal overflow;
- [ ] console and network pass;
- [ ] required visual diffs pass;
- [ ] sibling templates pass;
- [ ] Admin preview matches storefront;
- [ ] approved design revision is recorded.

---

## 29. Programme-level stopping criteria

Do not declare the design system complete until:

1. The inventory reports zero unexplained active settings.
2. The copy report shows every visible storefront string as:
   - merchant field;
   - product-owned localized copy;
   - product/variant data;
   - generated numeric copy.
3. Every configuration has at least one deterministic fixture.
4. Every applicable template has a test for that fixture or an explicit family-level equivalence proof.
5. Every template has desktop, tablet, mobile, narrow-mobile, and high-zoom evidence.
6. Every interactive state has keyboard and accessibility evidence.
7. Every merchant color pair has contrast validation.
8. Every merchant copy surface has long-copy validation.
9. No shared component change breaks any sibling.
10. No template-specific rule overrides merchant settings unintentionally.
11. No static presentation is unnecessarily injected from JavaScript.
12. No duplicated business behavior exists between templates.
13. No critical or high-severity defect remains.
14. All approved deviations are documented.
15. Rollback and versioning are available.

---

## 30. Recommended implementation order for the first practical cycle

Use this sequence to establish the system without trying to finish eight templates simultaneously:

1. Run Phase 0 inventory across the entire repository.
2. Freeze the shared configuration, copy, and state registries.
3. Build foundations.
4. Build product card, price, quantity, variant, progress, selected row, and button primitives.
5. Complete FPB Standard as the family reference.
6. Complete FPB Classic, including desktop summary and mobile tray.
7. Complete FPB Compact.
8. Complete FPB Horizontal.
9. Complete PPB Grid as the family reference.
10. Complete PPB List.
11. Complete PPB Vertical Slots.
12. Complete PPB Horizontal Slots.
13. Finish Admin copy previews and placeholder validation.
14. Run full Chrome release matrix.
15. Version and release the design system.

This order minimizes duplicated work and exposes shared-contract mistakes before they spread across all eight templates.
