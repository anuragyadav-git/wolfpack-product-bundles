---
schema_version: 1
id: bundlex-urgency-swatches-tier-badges
title: Bundlex Urgency, Swatch Tooltips, and Tier Badges
type: competitor-analysis
status: current
summary: Documents installed Admin controls and desktop/mobile storefront evidence for Bundlex countdown, low-stock, sticky cart, swatch tooltip, and tier badge capabilities.
last_audited: 2026-08-30
owners:
  - product
  - engineering
domains:
  - competitive-research
  - storefront
  - offer-design
systems:
  - bundlex
  - wolfpack-admin
  - wolfpack-storefront
source_paths:
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/
  - app/routes/app/_shared/bundle-configure/
  - app/lib/bundle-config/category-contracts.ts
  - app/lib/bundle-config/category-runtime.ts
  - app/assets/widgets/product-page/
  - app/assets/widgets/shared/
  - prisma/schema.prisma
related_docs:
  - docs/competitor-analysis/20-bogos-personalization-analytics-offer-operations.md
  - docs/competitor-analysis/22-bogos-bundlex-wolfpack-feasibility.md
  - internal docs/Architecture/Admin Configure Page.md
  - internal docs/Architecture/Widget Architecture.md
tags:
  - bundlex
  - urgency
  - swatches
  - badges
keywords:
  - countdown-timer
  - low-stock-alert
  - sticky-add-to-cart
  - swatch-tooltip
  - tier-badges
---

# Bundlex urgency, swatch tooltips, and tier badges

## Executive finding

Bundlex is the stronger visual merchandising reference. Its advantage is not one isolated effect; it is the coherence between offer content, style tokens, optional add-ons, and a live preview. The most important feature for Wolfpack is the swatch tooltip because it solves a real comprehension problem without increasing card height. Tier badges are also high-value and comparatively low-risk. Countdown, low-stock, and sticky add-to-cart are feasible, but they require stricter truthfulness, inventory, timing, accessibility, and theme-integration contracts than their simple toggles suggest.

The installed app provided exact Admin controls. Bundlex's public interactive demo provided rendered desktop and responsive mobile evidence. A controlled Agent-store offer was scoped to Copper Light, activated, and then removed; despite the app embed being enabled, the Bundlex widget did not render in Horizon. That failed render is an integration finding, not storefront proof. The offer was deactivated and deleted, the embed disabled, and the app uninstalled.

## Research method and evidence boundary

Bundlex was installed on `agent-5sfidg3m.myshopify.com` on 2026-08-30. Shopify disclosed access to device/activity data, owner and staff information, and products, orders, discounts, and Online Store data. No billing step was required.

The research used three evidence layers:

| Evidence | What it proves |
| --- | --- |
| Authenticated installed Admin | Exact field names, defaults, bounds, option sets, and preview behavior. |
| Bundlex interactive demo | Rendered widget hierarchy, hover tooltip, urgency presentation, tier shapes, desktop/mobile responsiveness. |
| Bundlex help center | Persistence, device, inventory, threshold, and expiry semantics not inferable from a still frame. |

No screenshot files were committed. Visual captures were retained only in the research conversation.

## Admin information architecture

Bundlex's editor is organized into four tabs:

1. **Offers** — product targeting and tier content/discount mechanics.
2. **Style** — layout, color presets, card/typography/image/variant/badge styling, container sizing, and custom CSS.
3. **Add-ons** — variant selector, quantity selector, subscriptions, upsell, progressive gifts, countdown, and sticky add-to-cart.
4. **Advanced** — compare-price behavior, low-stock alert, quantity limits, per-variant counting, unavailable variants, checkout behavior, B2B/tag visibility, labels, page-builder support, and Markets.

This separation is effective: offer economics remain distinct from presentation and optional conversion devices. Wolfpack should keep a similar conceptual separation while using its existing Configure rail and Polaris web components rather than copying Bundlex's custom Admin chrome.

The template picker is unusually strong. It presents visual cards and filters for Colors, Decoration, Badge, and Image, with offer-type tabs for All, Volume, Bundle, BOGO, Upsell, and Gift. This makes customizability discoverable before the merchant sees individual style controls.

## Swatch tooltip — priority feature

### Installed Admin contract

Enabling **Variant selector** exposed:

- Show variant image;
- Hide theme variant picker;
- Collapse variant selectors;
- color, pill, image, and dropdown presentation styling;
- color swatch border, radius `0–50%`, gap `0–40px`, and size `16–64px`;
- **Show color name on hover**;
- pill typography, colors, radii, gaps, and padding;
- optional variant image inside pills;
- image-swatch borders, radii, gaps, and padding; and
- variant-image borders, radius, size, and optional label.

The tooltip toggle appears specifically in the **Color swatch** style group. Bundlex documentation confirms that the hover tooltip is for color swatches, appears immediately on mouse hover and keyboard focus, and is skipped on phone/tablet layouts. It is not a generic tooltip for dropdowns, pills, or image swatches.

### Storefront proof

In Bundlex's interactive desktop demo:

- enabling Variants exposed Color, Image, Pill, and Dropdown modes plus Circle, Rounded, and Square shapes;
- enabling Swatch tooltip and choosing Color rendered circular swatches for each selected tier item;
- hovering the first swatch displayed a compact dark tooltip reading `Serum` directly above the swatch;
- the tooltip did not alter the surrounding card geometry.

At `390×844`, the responsive widget retained the swatches and offer selection without a hover-dependent label being forced into the layout. This is consistent with Bundlex's documented mobile omission, though viewport resizing alone is not touch-device emulation.

### Why this matters for Wolfpack

Wolfpack already persists `StepCategory.displayVariantsAsSwatches` and projects it into category runtime. That boolean is a latent display mode, not a complete swatch system. Current evidence does not establish a production PPB tooltip, color-value resolver, keyboard tooltip, or mobile label alternative.

Recommended contract:

- Persist a category-level `variantSelectorMode` enum rather than adding more booleans: `dropdown`, `pill`, `color_swatch`, `image_swatch`.
- Store tooltip enablement only when mode is `color_swatch`.
- Resolve color values deterministically from Shopify swatch/category metafields or an explicit merchant mapping; do not guess arbitrary CSS colors from unrecognized option text.
- Make every swatch a real button or radio with an accessible name equal to the option value.
- Show the tooltip on hover **and focus**; associate it with the control using a stable description relationship.
- Keep selected state independently visible through border/check/outline, not color alone.
- On touch/coarse-pointer layouts, expose the selected option label adjacent to the group or above it because hover is unavailable.
- Clamp or flip tooltip placement near viewport/card edges and ensure it is not clipped by card overflow.
- Disabled/unavailable values remain focusable only if the product design needs an explanation; otherwise remove them from sequential focus and expose a clear unavailable state.

This should be implemented first in PPB where the category-level swatch field already exists, then extracted into the shared product option primitive before FPB adoption.

## Tier badges

### Offer content contract

The installed Quantity Breaks template created three tiers:

- Buy 1, quantity 1, preselected;
- Buy 2, quantity 2, 10% discount, label `Save {{saved_percentage}}`;
- Buy 3, quantity 3, 20% discount, label `Save {{saved_percentage}}`, badge `Best value`.

Each tier separately exposes Title, Discount label, Subtitle, Badge, discount type/amount, quantity, preselection, offer image, Benefits, Upsells, Gift, and Multiple gifts. Bundlex documentation says up to ten tiers are supported, exactly one can be the default, and badge copy can interpolate `{{saved_total}}`.

### Style contract

The installed Style tab's Offer badge section exposed:

- Default;
- Folded;
- Pill;
- Arrow Right;
- Arrow Left;
- Square;
- Banner;
- Banner Rounded;
- Corner Ribbon;
- Side Ribbon;
- Side Ribbon Alt; and
- Side Ribbon Rounded.

Badge font size, font style, foreground, and background are independently configurable. The public demo displayed the same family in compact labels—Folded, Corner, Side, Side round, Side alt, Banner, Banner round, Pill, Square, Arrow L, Arrow R, and Default—and rendered `Most popular` and `Best value` on their tier cards.

### Wolfpack feasibility

Wolfpack pricing rules already have rule messaging and progress-tier concepts, but the current Admin/runtime contract does not provide a per-tier badge plus shape family. Add this as presentation metadata attached to the stable pricing rule ID:

```text
tierBadge:
  enabled
  text
  shape
  tone or explicit color tokens
  visibility
```

Do not persist generated savings text. Persist merchant copy/template and derive savings from the same pricing calculation used for cart/checkout. A missing or invalid variable should fail validation in Admin, not leak braces to the storefront.

Start with three shapes—Pill, Folded, Banner Rounded—because they cover inline, edge-attached, and spanning treatments. Expand only after responsive and long-copy QA. Ribbons and arrows have higher clipping and bidirectional-layout risk.

Badge accessibility rules:

- decorative badges should not pollute control names;
- meaningful claims such as `Best value` should be available in the tier radio's accessible description;
- badges must meet text contrast and work at 200% zoom;
- long translations must wrap or clamp intentionally without obscuring price or selector targets;
- badge position cannot be the sole representation of tier preference.

## Countdown timer

### Installed Admin contract

Enabling Countdown timer exposed:

| Control | Values/defaults |
| --- | --- |
| Layout | Full (digit blocks, default) or Compact (slim bar). |
| Position | Above widget (default) or Below widget for full layout. |
| Timer type | Fixed duration (default), Ends at midnight in user's local time, or Custom end date. |
| Duration | `1–1440` minutes, default `15`. |
| Compact copy | `Hurry! Offer expires in {{timer}}`. |
| Full copy | Title `Hurry up!`, subtitle `Sale ends in:`, editable Days/Hrs/Mins/Secs labels. |
| Expiry action | Hide timer (default), Show zeros, or Show message. |
| Styling | theme presets, single color/gradient, gradient angle, border, radius, padding, shadow, alignment, and typography/colors. |

Bundlex documentation adds these semantics:

- compact layout can also be placed as a sticky top bar;
- fixed duration persists for the shopper and restarts after the browser/session behavior defined by Bundlex;
- midnight is evaluated in shopper-local time;
- custom end date is an absolute deadline; and
- expiry behavior can hide, show zeroes, or replace with a merchant message.

### Storefront proof

The live demo rendered compact copy shaped as `Hurry! Offer ends in 05:13:52`. The controls allowed Compact/Full and Inline/Fixed top selection. The timer updated while the page remained open.

### Feasibility and truthfulness rules

A timer must represent a real availability or price deadline. Wolfpack should reject an evergreen reset-on-every-visit timer unless the merchant explicitly chooses a session-scoped experience and the copy does not falsely claim a global sale is ending.

Implementation needs:

- server-authoritative end instant or schedule-derived deadline;
- client display driven from that instant, recalculated against `Date.now()` rather than decrement drift;
- visibility-change and clock-change recovery;
- shopper-local midnight derived from a documented timezone contract;
- single expiry state transition, safe if repeated;
- `aria-live` restrained to the expiry message, never announce every second;
- `prefers-reduced-motion` support;
- tabular digits or stable inline size to avoid layout shift;
- SSR/first-paint placeholder that does not flash an incorrect time.

Countdown should be implemented after scheduling because schedule-derived truth is the cleanest merchant model.

## Low-stock alert

### Installed Admin contract

The Advanced tab exposed **Show low stock alert**. When enabled:

- Message default: `Only {{stock}} left`;
- Threshold: `1–1000`, default `5`.

Bundlex documentation adds that the alert uses tracked inventory, requires overselling/continue-selling to be off, requires `{{stock}}` in the copy, caps copy at 200 characters, and applies only to per-offer product selection.

The live demo rendered `Only 3 left in stock!` in red beneath the selected tier's variant selectors.

### Wolfpack feasibility

Wolfpack's bundle inventory belongs to component variants. The alert must therefore derive from the same component-availability model that gates selection and cart submission, never from the neutral bundle parent.

For a tier with quantity `q`, a useful scalar is the maximum number of complete tier sets available:

```text
min(floor(available_i / required_i)) across required component variants
```

That formula is valid only after defining location aggregation, selling plans, untracked inventory, continue-selling policy, optional choices, and already-selected quantities. For mix-and-match, one number may be misleading; the UI may need per-option availability or no aggregate alert.

Required states:

- tracked and above threshold: hidden;
- tracked and at/below threshold: show exact or bucketed value according to merchant setting;
- zero: unavailable/disabled, not “Only 0 left”;
- untracked: no low-stock claim;
- continue-selling: no scarcity claim unless inventory is informational and copy says so;
- multiple locations/Markets: use the same sellable inventory context as checkout;
- stale or failed inventory read: suppress the claim.

Because exact stock can change between page view and checkout, the message is advisory and cart/checkout validation remains authoritative.

## Sticky add-to-cart

### Installed Admin contract

Enabling Sticky add to cart exposed:

- Floating (default) or Fixed layout;
- Show on desktop and Show on mobile, both default on;
- optional countdown inside the sticky bar;
- action `Scroll to the offers` (default) or `Add the selected offer to cart`;
- fallback note: if the theme blocks direct add, scroll to the widget;
- Title default `{{product_title}}`;
- Button text default `Choose bundle`;
- theme presets and detailed container/title/button/product-image styling.

The floating preview showed product image, Copper Light, and Choose bundle. The public demo rendered an inline floating bar below the widget with product thumbnail, `Lumé Glow Serum`, and Add to cart. Its control panel also exposed Floating/Fixed and optional timer.

### Wolfpack feasibility

Wolfpack already has sticky summary ownership inside its full-page templates. A product-page sticky ATC must be a separate PPB feature, not a CSS alias of FPB's summary tray.

Recommended state machine:

1. Hidden while the primary widget CTA is visible.
2. Appears after the primary CTA leaves the viewport and a valid offer context exists.
3. `Choose bundle` scrolls/focuses the first invalid or primary offer control.
4. `Add selected offer` uses the exact same validated submission path as the main CTA.
5. Shows pending state once, prevents duplicate adds, and reports failure near both action surfaces.
6. Hides when cart drawer/modal overlays would conflict.

Use IntersectionObserver for visibility, respect mobile safe-area insets, and coordinate z-index with theme headers, cookie banners, chat launchers, and Wolfpack drawers. Fixed bars must reserve or overlay space intentionally; no CTA may cover product controls or the Shopify accelerated checkout surface.

## Customizability assessment

Bundlex's real differentiator is a coherent token system:

- widget and accent color presets;
- transparent/solid/gradient backgrounds;
- independent typography controls;
- borders, radii, gaps, padding, shadows;
- price, compare-price, per-item, label, image, badge, gift, timer, and sticky-bar styling;
- Shopify-default/full/custom container width and margins; and
- custom CSS as a final escape hatch.

Wolfpack already has a production-renderer-backed Settings → Design preview and shared design runtime. New controls should feed that same token pipeline so preview and storefront cannot diverge. The Bundlex lesson is breadth with live feedback, not copying each raw numeric control. Wolfpack should expose curated semantic presets first, then advanced tokens, while preserving responsive content-driven CSS.

## Agent-store integration finding

The controlled Quantity Breaks offer was saved and activated only for Copper Light. The Bundlex app embed showed enabled and saved in Horizon. After cache clearing and a hard reload, the product page contained no Bundlex widget. This could reflect selector/theme compatibility, delayed app detection, or an additional setup requirement. The public demo therefore supplies the storefront behavior evidence in this report.

This failure is strategically relevant: any Wolfpack sticky/urgency enhancement must preserve the existing theme-app-extension placement and server/runtime ownership rather than rely on brittle product-form selectors. Page-builder and selector overrides should remain explicit integration settings, not silent fallbacks.

## Evidence sources

- [Bundlex Shopify App Store listing](https://apps.shopify.com/bundlex)
- [Bundlex variant option display](https://bundlex.io/help/customization/variant-option-display/)
- [Bundlex countdown timer](https://bundlex.io/help/customization/countdown-timer/)
- [Bundlex low-stock alert](https://bundlex.io/help/customization/low-stock-alert/)
- [Bundlex sticky add-to-cart](https://bundlex.io/help/customization/sticky-add-to-cart/)
- [Bundlex widget style elements](https://bundlex.io/help/customization/widget-style-elements/)
- [Bundlex interactive demo](https://bundlex.io/demo/)
- [Shopify inventory management](https://shopify.dev/docs/apps/build/orders-fulfillment/inventory-management-apps)
- [Shopify discounts](https://shopify.dev/docs/apps/build/discounts)

## Verification gaps

- The installed Agent-store widget did not render, so installed-storefront evidence is negative integration evidence rather than visual proof.
- Countdown persistence across browser restarts and actual midnight/custom-date expiry were not time-advanced in the installed store.
- Low stock was not driven by a real Agent-store inventory threshold.
- Direct sticky-bar cart submission and its theme fallback were not executed.
- Keyboard focus showed documented tooltip support but was not independently captured in the demo; hover was captured directly.
- Mobile viewport evidence is responsive layout proof, not a physical touch-device test.
