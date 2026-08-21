---
schema_version: 1
id: page-builder-integrations-guide
title: Page Builder Integrations Guide
type: merchant-guide
status: authoritative
summary: User-friendly source copy for explaining and setting up Wolfpack bundle embeds in PageFly, GemPages, and Shogun.
last_audited: 2026-08-21
owners:
  - product
  - marketing
  - engineering
domains:
  - storefront
  - integrations
systems:
  - theme-app-extension
  - storefront-runtime
source_paths:
  - app/storefront/page-builder-embed.ts
  - app/routes/api/api.page-builder-embed[.]json.tsx
  - extensions/bundle-builder/blocks/bundle-page-builder-embed.liquid
  - extensions/bundle-builder/blocks/bundle-app-embed.liquid
related_docs:
  - internal docs/EB Integrations Reference.md
  - internal docs/Architecture/Widget Architecture.md
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - page-builders
  - merchant-guide
  - blog-source
keywords:
  - PageFly bundles
  - GemPages bundles
  - Shogun bundles
  - Shopify page builder integration
  - embedded bundle builder
---

# Add Wolfpack Bundles to PageFly, GemPages, and Shogun

Wolfpack Bundles can be placed inside custom storefront layouts created with PageFly, GemPages, and Shogun. This lets shoppers build a bundle without leaving the page you designed.

The integration uses your existing Wolfpack app embed together with a lightweight placement block. You do not need to install a second app embed, duplicate bundle scripts, or rebuild your bundle for each page builder.

## The Simple Version

There are two parts:

1. **Wolfpack Bundle app embed** — enabled once in your Shopify theme. It securely finds the correct bundle, loads the required storefront assets, and runs the bundle builder.
2. **Page Builder bundle block** — placed wherever you want the bundle to appear. It tells Wolfpack which bundle to show and provides the exact rendering location.

```text
Existing Wolfpack app embed
        ↓ finds
Page Builder bundle block
        ↓ securely resolves
Selected or eligible bundle
        ↓ renders
Bundle builder in your custom layout
```

The placement block does not load a second copy of Wolfpack. It is an anchor used by the existing app embed.

## What You Can Embed

The block supports three bundle sources.

### Eligible bundle for the current product

Use this on a product page when Wolfpack should automatically show the first Bundle Embed configuration that is eligible for the product.

This mode follows the targeting configured in Wolfpack, including:

- all eligible products in the bundle;
- specific product pages;
- specific product collections;
- localized embed title and subtitle; and
- optional preselection of the product currently being viewed.

This is the best choice when the same page-builder template is shared by multiple products.

### Specific Product Page Bundle

Use this when a page should always show one particular Product Page Bundle, regardless of the product or page being viewed.

In the app block, select the Shopify parent product generated for that bundle. Wolfpack uses its product handle to resolve the bundle securely.

This is useful for:

- campaign landing pages;
- editorial or gift-guide pages;
- custom product layouts; and
- a reusable page-builder section dedicated to one bundle.

### Specific Full Page Bundle

Use this when a custom page should show one particular Full Page Bundle.

Enter the bundle's public number in the app block. The public number belongs to the current store and does not expose an internal database identifier.

This is useful when the page builder owns the surrounding header, content, or promotional sections while Wolfpack owns the interactive bundle builder.

## Before You Begin

Make sure that:

- the bundle is saved as **Active** or **Unlisted**;
- the current theme has the **Wolfpack Bundle** app embed enabled;
- the latest Wolfpack theme app extension is installed;
- the page-builder page uses the same Shopify theme where the app embed is enabled; and
- you know which of the three bundle sources you want to use.

Draft bundles are not shown to storefront visitors.

## Enable the Wolfpack App Embed

You only need to do this once per theme.

1. In Shopify Admin, go to **Online Store → Themes**.
2. Select **Customize** for the theme used by your page-builder page.
3. Open **App embeds**.
4. Enable **Wolfpack Bundle**.
5. Save the theme.

Keep this app embed enabled. The page-builder block depends on it for secure bundle resolution and asset loading.

## Add the Placement Block

When your page builder exposes Shopify app blocks:

1. Add the page builder's Shopify app-block or app-element component to your layout.
2. Choose **Page Builder bundle** from the Wolfpack Bundles app blocks.
3. Choose a **Bundle source**.
4. If using a specific Product Page Bundle, select its parent product.
5. If using a specific Full Page Bundle, enter its public number.
6. Save or publish the layout.
7. Open the storefront page in a fresh tab and confirm that the bundle appears.

Only the setting associated with the selected source is used.

## PageFly Setup

Use PageFly's **Shopify App Block** element whenever it is available.

1. Open the page in PageFly.
2. Add the **Shopify App Block** element to the desired location.
3. Open the connected Shopify Theme Editor experience.
4. Add **Page Builder bundle** to the PageFly app-block area.
5. Configure the bundle source.
6. Save the Shopify theme and publish the PageFly page.

PageFly supports one Shopify App Block element per page, but that element can contain multiple Shopify app blocks. If the page already has one, add Wolfpack inside the existing element instead of creating another.

## GemPages Setup

Use the GemPages **Shopify App Element** whenever it is available.

1. Add the Shopify App Element to the desired position in GemPages.
2. Publish the GemPages page.
3. Open the page through Shopify Theme Editor.
4. Add **Page Builder bundle** to the GemPages app area.
5. Select the bundle source and its associated setting.
6. Save the theme.

Publishing before configuring the app element is important because Shopify Theme Editor owns the final app-block configuration.

## Shogun Setup

For Shogun layouts that preserve Shopify Online Store 2.0 theme sections, add the **Page Builder bundle** app block through Shopify Theme Editor.

For a Shogun Custom Layout that does not expose Shopify app blocks, use Shogun's HTML embed capability and the fallback marker described below. Standard Shogun HTML elements do not evaluate Shopify Liquid, so use plain HTML with a concrete parent-product handle or Full Page Bundle public number.

## Custom Code Fallback

Use this only when the page builder cannot insert Shopify app blocks. Add one marker at the location where the bundle should appear.

Do not copy Wolfpack JavaScript or CSS URLs into the page builder. The existing app embed loads the correct Shopify-hosted assets.

### Current product eligibility

Use only on a Shopify product page:

```html
<div
  data-wpb-page-builder-embed
  data-embed-mode="eligible-product"
></div>
```

### Specific Product Page Bundle

Replace `your-bundle-parent-product-handle` with the handle from the bundle parent product's Shopify URL:

```html
<div
  data-wpb-page-builder-embed
  data-embed-mode="product-page-bundle"
  data-parent-product-handle="your-bundle-parent-product-handle"
></div>
```

For example, if the parent product URL ends in `/products/summer-gift-bundle`, use `summer-gift-bundle`.

### Specific Full Page Bundle

Replace `123` with the bundle's public number:

```html
<div
  data-wpb-page-builder-embed
  data-embed-mode="full-page-bundle"
  data-public-number="123"
></div>
```

## Placement and Page Behavior

The page-builder block has placement priority. The bundle renders inside the first valid **Page Builder bundle** block found on the page.

For eligible-product mode, this custom location takes precedence over Wolfpack's automatic placement before the product's primary Add to Cart button.

For a specifically selected Product Page or Full Page Bundle:

- the bundle renders directly inside the block;
- Wolfpack does not add a second automatic bundle builder;
- the response is reused during Shopify section reloads;
- the appropriate bundle assets are loaded only after a valid bundle is found; and
- restored shopper selections are preserved.

The ordinary page form remains owned by the theme or page builder. A direct embed does not replace unrelated forms or purchasing controls.

## What Not to Do

- Do not disable the global Wolfpack app embed after adding the placement block.
- Do not install or enable a second Wolfpack app embed.
- Do not paste Shopify CDN asset URLs into custom code.
- Do not paste internal bundle database IDs into the block.
- Do not use a draft bundle for a public page.
- Do not add multiple competing placement markers to the same page. Wolfpack uses the first valid marker.
- Do not assign a page-builder preview page as the bundle's parent product.

## Troubleshooting

### The block is visible in the editor, but no bundle appears

Check that the Wolfpack app embed is enabled in the same theme, the bundle is Active or Unlisted, and the selected source has its required value.

For a Product Page Bundle, confirm that you selected the generated bundle parent product. For a Full Page Bundle, confirm that its public number is a positive whole number.

### Eligible-product mode shows nothing

The current product must match an enabled Bundle Embed target in Wolfpack. Review whether the configuration targets all bundle products, specific products, or specific collections.

### The app block is not listed

Confirm that the latest Wolfpack theme app extension has been deployed or installed for the store. Then reopen Shopify Theme Editor. Page builders sometimes require the page to be published before its app-block area becomes available.

### The custom HTML marker shows nothing

Confirm that:

- the page builder preserved the `data-wpb-*` attributes;
- the marker is present in the initial published page markup;
- the app embed is enabled; and
- the parent-product handle or public number is correct.

Do not add script tags as a workaround.

### Two bundle builders appear

Remove duplicate app blocks or custom markers. A page should have one intentional page-builder placement. Also check whether old manually embedded Wolfpack scripts remain in the page-builder layout and remove them.

## Frequently Asked Questions

### Is this a separate app embed?

No. It uses the existing Wolfpack Bundle app embed. The page-builder block is a placement and configuration anchor.

### Can one page contain several Wolfpack bundle builders?

The integration intentionally uses the first valid page-builder block and maintains one primary bundle builder per page. Build separate landing pages when you need to promote different bundles.

### Does the page builder receive private bundle data?

No. The browser requests the bundle through Wolfpack's signed Shopify app-proxy endpoint. Resolution is isolated to the current shop.

### Can I embed a Product Page Bundle on a regular page?

Yes. Choose **Specific Product Page Bundle** and select its generated parent product, or use the corresponding plain-HTML marker.

### Can I embed a Full Page Bundle inside a page-builder layout?

Yes. Choose **Specific Full Page Bundle** and enter its public number. The page builder can own the surrounding content while Wolfpack renders the bundle experience.

### Will an embedded Product Page Bundle automatically add the current product?

Only eligible-product mode can use the Bundle Embed setting that preselects the product being viewed. A directly selected Product Page Bundle does not infer a browsed product. Existing shopper selections are never overwritten.

### Do I need to update the integration when switching page builders?

No bundle migration is required. Keep the app embed enabled and place the same Wolfpack block or marker in the new layout.

## Suggested Blog Positioning

Recommended headline:

> Embed Shopify Bundle Builders in PageFly, GemPages, and Shogun with Wolfpack Bundles

Recommended description:

> Add Product Page Bundles and Full Page Bundles to custom Shopify layouts without duplicating scripts or replacing your theme's purchasing experience.

Core message:

> Design the page in your preferred builder. Place the bundle where it belongs. Wolfpack securely resolves and renders the shopping experience.

Suggested calls to action:

- Create your bundle in Wolfpack Bundles.
- Enable the Wolfpack Bundle app embed.
- Add the Page Builder bundle block to your layout.
- Publish and test the storefront page.

Before publishing external blog copy, replace any screenshots and navigation labels with evidence from the current production release.
