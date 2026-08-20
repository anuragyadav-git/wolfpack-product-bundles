# Wolfpack — Shopify App Store Listing Copy

**Where this goes:** Shopify Partner Dashboard → Apps → Wolfpack Product Bundles → App listing.

**Why this exists:** the App Store listing text is not in the repo; Shopify stores it in the Partner Dashboard. This file is the source-of-truth draft to paste in, per the 5-year forecast research.

Positioning line the whole listing rides on:

> **The BYOB and build-a-box bundle builder for D2C brands that need guided storefront experiences, checkout-safe pricing, inventory sync, and campaign attribution.**

---

## App name

`Wolfpack Bundle Builder, BYOB`

(Keep — matches the App Store URL slug and is already indexed.)

## Tagline (short listing subtitle, ~60 chars)

**Current:** whatever ships today — replace with:

`BYOB & build-a-box bundles for D2C brands on Shopify`

## App description (App Store long copy)

Paste this whole block into the "App description" field. Uses Shopify's supported light-markdown (bold, bullets, headings).

---

**Wolfpack is the BYOB and build-a-box bundle builder for D2C brands on Shopify.**

Shopify keeps compressing basic bundle features into the platform — that's good for merchants, and a real threat to bundle apps that compete on the easy parts. Wolfpack sells the hard parts serious D2C merchants still pay for.

**What Wolfpack ships**

- **Build-your-own-box (BYOB).** Shoppers pick N items from a curated pool at a bundle price. The flagship D2C pattern for gifting brands, skincare routines, hair-care kits, and snack packs.
- **Build-a-box (slot-based).** Merchant-guided box with fixed slots — one candle, one soap, one card. Slots enforce a curated selection while keeping the box feel of BYOB.
- **Full-page bundle builder.** A dedicated landing surface for ad-driven campaigns (Meta, Google, TikTok). Nine layout templates ship out of the box.
- **Product-page bundle.** An inline add-on selector on the PDP for existing high-traffic products.
- **Bundle subscriptions.** Native Shopify purchase-option support on FPB and PPB. A bundle can ship one-time or on a plan without a separate config.

**Why merchants pick Wolfpack over Shopify's native bundles**

- **Checkout correctness.** Bundle pricing routed through Shopify's Discount Function — one code path from cart to checkout, no drift when coupons, subscriptions, or gift cards enter the mix.
- **Theme fit.** Every layout ships as a Theme App Extension so bundles inherit the merchant's type, colour, and spacing tokens instead of clashing with a customised theme.
- **Inventory sync.** Bundle-to-component SKU mapping stays live. Warehouse picks real SKUs, stock levels stay accurate — no opaque virtual product behind the order line.
- **Analytics + campaign attribution.** Documented Web Pixel surface for bundle-level events (view, configure, add, complete) so GA4, Meta CAPI, and TikTok Pixel see the bundle as a first-class object. Merchants can tell which bundle a Meta ad drove.
- **Campaign landing pages.** Full-page bundle builder lives independent of the theme, so ad-driven landings survive theme redesigns.
- **Deeper integrations.** Bundle configuration mirrors into Shopify metafields; storefront fetches sign through App Proxy — the rest of the merchant's stack (loyalty, reviews, subscriptions) can read bundle data cleanly.

**Under the hood**

- Cart Transform Function for line-item shape.
- Discount Function for bundle pricing.
- Theme App Extension for storefront widgets.
- App Proxy for signed storefront fetches.
- Shopify Admin API 2026-07 baseline.

**What Wolfpack is not**

Wolfpack is not another bundle app to boost AOV. If the AOV promise alone is what you're shopping for, Shopify's native bundles are free and getting better — use those. Wolfpack is for merchants who need the hard parts.

---

## Feature bullets (short "Key features" list on the listing)

Use these if Shopify's listing form asks for a discrete features list. Max 6, short:

1. BYOB and build-a-box bundle builders for D2C brands
2. Full-page campaign landings with nine layout templates
3. Product-page add-on bundles + inline upsells
4. Bundle subscriptions on FPB and PPB (native Shopify purchase options)
5. Checkout-safe pricing via Discount Function + Cart Transform
6. Bundle-to-SKU inventory sync + Web Pixel analytics for campaign attribution

## Search keywords (App Store search terms)

Comma-separated, load-bearing:

`byob, build your own box, build a box, bundle builder, product bundles, gift box builder, mix and match, bundle subscription, checkout safe bundles, inventory sync bundle, campaign landing bundle`

## Categories

- **Primary:** Merchandising → Bundles
- **Secondary:** Store design → Landing page builders (if Shopify offers a slot for it)

## Pricing plans (listing text)

**Free**

- BYOB and build-a-box flows.
- Full-page + product-page bundle builders.
- Cart Transform + Discount Function pipeline.
- Native Shopify checkout.

**Paid tiers (arriving)**

Paid plans ship on the billing scaffolding already in place. Feature split TBD — do not commit specific tier names or prices in the listing until they land in-app.

## Screenshot order (upload sequence in the Partner Dashboard)

Wolfpack has 15 listing renders in `topcotchhsolutions-company-website/public/products/wolfpack/listing-v2/`. Reorder the App Store screenshot carousel to lead with BYOB and box flows:

1. `listing-01-alt.png` — Set Up High-Impact Bundle Builders (BYOB gift box on Wolfpack blue) — **hero screenshot**
2. `listing-03.png` — Elevate Gifting Experience: Your Custom Gift Box Builder
3. `listing-01.png` — Maximize AOV with High-Impact Mix & Match Bundles
4. `listing-08.png` — Need custom Designs? SDK and API (build-a-box)
5. `listing-02.png` — Mobile Optimized, Industry Specific Templates
6. `listing-05.png` — Insight-Driven Analytics Dashboard
7. `listing-09.png` — Bundle attribution via Web Pixel for campaign analysis
8. `listing-07.png` — Custom Setup & Design: We Build your perfect bundles
9. `listing-06.png` — Powered By Latest Bundling Tech (SKU breakdown)

Sequence intent: lead with BYOB/gift-box (the flagship pattern), then breadth (mobile, analytics), then proof/support at the end.

## Support + docs links (listing footer fields)

- **Support email:** whatever the current support address is (do not invent).
- **Privacy policy URL:** confirm current URL, do not invent.
- **Marketing URL:** `https://topnotchhsolutions.com/products/wolfpack`

---

## What NOT to put in the listing

- No AOV percentage claims ("+30% AOV", "increase revenue by X"). The research explicitly warns against competing on this promise.
- No customer names or logos unless the merchant has signed off in writing.
- No mention of features that aren't shipped yet (Checkout UI Extension, paid tier specifics, multilingual admin) — those live in the site roadmap, not the listing.
- No "AI-powered", "revolutionary", "unlock potential", or similar SaaS filler.

## After you paste

1. Save the listing draft.
2. Submit for Shopify review (App Store re-review usually takes 3–7 business days).
3. Once approved, the listing goes live at `https://apps.shopify.com/wolfpack-product-bundles-1`.
4. Confirm the tagline + first screenshot render as expected on both desktop and mobile App Store views.
