---
schema_version: 1
id: eb-integrations-reference
title: EB Integrations Reference
type: implementation-reference
status: authoritative
summary: Records live EB integration setup evidence and Wolfpack support boundaries.
last_audited: 2026-08-21
owners:
  - engineering
domains:
  - competitor-analysis
systems:
  - integrations
source_paths:
  - app/lib/admin-configuration-surfaces.ts
  - app/assets/widgets/full-page/fpb-controls-integrations.ts
  - app/storefront/page-builder-embed.ts
  - app/routes/api/api.page-builder-embed[.]json.tsx
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - integrations
keywords:
  - selling plans
---

# EB Integrations Reference

## Live Admin UI

Audited in Chrome on `2026-06-04` from EB Admin route `/integrations`.

Visible page contract:
- Heading: `Integrations Hub`
- Subtitle: `Browse supported integrations to extend your bundle capabilities.`
- Top-right action: `Request Integration`, black compact button with a small command-style icon. In the audited store, clicking it produced a `Something went wrong` toast rather than opening a usable request form.
- Category panels: white cards, 8px radius, light grey border, compact title and description.
- Integration tiles: grey cards inside each category, 8px radius, 36px logo at left, app name and description at right, full-width white `View Setup ->` button below the description.

Original live EB integration inventory from 2026-06-04:
- Pre-orders, Pickup & Delivery: Stoq, Zapiet
- Subscriptions: Skio, Appstle, Bold
- Reviews: Judge.me
- Page Builders: PageFly, GemPages
- Checkout: Gokwik, Shopflo

Current WPB Admin inventory:
- Reviews: Judge.me.
- Page Builders: PageFly, GemPages, Shogun.
- Checkout: GoKwik, Shopflo.
- Settings > Controls > Checkout Integration dropdown keeps the complete redirect/cart callback provider list: Shopify checkout, Theme cart drawer, GoKwik, Shopflo, Zecpay, Rebuy, Shiprocket/Fastrr, Monster cart, Upcart, and Kaching Cart.

WPB interim setup destination:
- All card setup actions and `Request Integration` should point to `https://wolfpackapps.com` until WPB-hosted guides are written.

## Quick Setup Link Findings

### Stoq

EB card opens:
`https://easybundles-help.skailama.app/en/article/enabling-pre-orders-for-bundled-products-via-stoq-integration-dxyj0o/`

Setup requirements:
- Merchant configures products inside Stoq preorder plans.
- Stoq `Continue Selling` must be enabled for the products.
- EB auto-detects Stoq selling plans after Stoq is installed.
- Merchant opens the EB bundle, goes to Bundle Settings, and turns on `Individual Selling Plans`.
- Runtime displays a `Pre-order` tag based on the selected behavior: all products in a Stoq plan, or only out-of-stock products in a Stoq plan.
- If a product has multiple selling-plan options, EB opens a storefront selection popup; if one option exists, it applies automatically.
- Bundle add-to-cart text does not change to preorder text.
- Preorder label text is controlled through EB language settings.

WPB supportability:
- Partially supportable. WPB has subscription/selling-plan concepts from prior bundle settings work, but Stoq-specific preorder display, stock-gated tag behavior, and the storefront plan-choice popup need explicit runtime implementation before claiming full support.

### Zapiet

EB card does not open a help article in the audited store; it behaves as a support-chat setup path.

WPB supportability:
- Provision can be shown in the Integrations page.
- Full support cannot be confirmed from a quick setup article because EB did not expose one from this card. Treat as merchant-specific support until WPB has a documented pickup/delivery integration path.

### Skio, Appstle, Bold

All three cards open the same subscription setup article:
`https://easybundles-help.skailama.app/en/article/classic-subscriptions-integration-subscription-plan-setup-12nd3lb/`

Setup requirements:
- Merchant creates one subscription plan/rule in the subscription app that contains every product in the bundle.
- The article mentions Shopify Subscriptions, generic App Store subscription apps, and Seal as examples.
- Merchant returns to EB, syncs collections, opens the bundle, selects `Subscription`, opens `Subscription Plans`, chooses the synced plan, and saves.

WPB supportability:
- Supportable if WPB continues to use Shopify selling plans as the source of truth and exposes the same plan selection flow for bundles.
- Provider-specific API integrations are not required by the EB guide; the contract is product membership in a selling plan plus bundle-level plan selection.
- The 2026-08-14 FPB/PPB subscription design therefore discovers provider-owned plans and never creates or mutates them. Exact EB successful-save transport remains unobserved, so WPB uses its own versioned persistence contract.

### Judge.me

EB card opens:
`https://easybundles-help.skailama.app/en/article/judgeme-reviews-easy-bundles-integration-1tmhu74/`

Setup requirements:
- Merchant goes to EB Settings > Controls > App configuration > Custom CSS for theme pages.
- Merchant pastes a CSS override to unset visibility for Judge.me preview badge text.
- EB also provides a video guide.

WPB supportability:
- Supported through the Landing Page Controls Judge.me toggle and public API token.
- Agent-store verification on 2026-08-21 installed Judge.me on the free plan, enabled its core Horizon theme app embed, and confirmed `200` responses from Judge.me's current `widgets/preview_badge` API for both FPB products.
- EB's older batch cache endpoint still describes the observed Yash runtime, but a fresh Judge.me installation returns `404 Shop not found` there. WPB uses the current public widget API per Shopify external product ID and isolates failures per product.

### PageFly and GemPages

Both cards open the same product-page page-builder article:
`https://easybundles-help.skailama.app/en/article/embedding-app-scripts-product-page-bundles-on-shopify-page-builders-work-for-ecomposer-gempages-and-other-page-builders-h9gw6d/`

Live findings refreshed on 2026-08-21:
- PageFly and GemPages remain the only Page Builders cards in EB. Shogun is not listed.
- Both cards open the same article, updated 2026-04-27.
- A parent product page uses EB's Product Page Bundle wrapper plus the PPB JS/CSS assets.
- A home page or other non-product page sets `window.easyBundlesPDPConfig = { productHandle: "..." }` before loading the same assets. The previously recorded `window.wolfpackProductBundlesPDPConfig` name was incorrect and is not an EB contract.
- The article names Ecomposer, GemPages, PageFly, and other page builders.
- The related Full Page Bundle article uses a separate target selector, shop name, and numeric bundle ID before loading a dedicated full-page embed script.

Provider documentation findings:
- PageFly's Shopify App Block Element is available on Online Store 2.0, is limited to one App Block Element per page, and can contain multiple Shopify app blocks. Its HTML/Liquid element is the fallback for third-party embed markup.
- GemPages exposes a Shopify App Element that is configured after publishing through Shopify Theme Editor. GemPages V7 Custom Code accepts HTML/Liquid, CSS, and JavaScript as a fallback.
- Shogun existing and Shopify 2.0 product layouts retain theme-app behavior. Shogun Custom Layout accepts all-HTML embed code, but its ordinary HTML element does not evaluate Shopify Liquid. Shogun Custom Elements can use their own Liquid context only on eligible plans and are not required for WPB support.

WPB supportability:
- `bundle-page-builder-embed` is the provider-neutral Shopify app block for eligible-product PPB, direct PPB, and direct FPB modes.
- Direct PPB resolves by the generated parent-product handle. Direct FPB resolves by its per-shop public number. Eligible-product mode reuses canonical Bundle Embed targeting and preselection.
- Manual fallback snippets emit the same marker contract and never load storefront JS/CSS themselves. The globally enabled `bundle-app-embed` owns Shopify `asset_url` assets and signed API resolution.
- PageFly and GemPages use their Shopify App elements first. Shogun custom layouts use the Liquid-free marker fallback with concrete parent handle or public number.
- The three WPB cards temporarily open `https://wolfpackapps.com` until dedicated provider guides are published.

### Checkout and Side-Cart Handoff Providers

The checkout cards use the same checkout/side-cart article:
`https://easybundles-help.skailama.app/en/article/redirecting-the-customers-to-a-different-checkout-app-or-side-cart-using-the-app-functions-15cl0fo/`

Setup requirements:
- EB uses custom functions/callbacks after bundle add-to-cart to redirect or open third-party checkout/cart apps.
- GoKwik example: `window.gokwikSdk.initCheckout(merchantInfo);`
- Shopflo example: `window.Shopflo.openCheckout()`
- Zecpay example: `zecpeCheckFunctionAndCall("handleOcc")`
- Shiprocket/Fastrr example: persist discount state, then call `shiprocketCheckoutBuyCartHandler()`.
- Rebuy example: refresh cart state through `Cart.getCart()`.
- Upcart example: `window.upcartOpenCart()`.
- Kaching Cart example: `kachingCartApi.openCart()` and `kachingCartApi.refreshCart()`.
- Theme cart drawer and Monster cart examples in EB use an EB-owned helper. WPB implements those through WPB-owned cart refresh/open behavior instead of referencing competitor-owned globals in runtime code.

WPB supportability:
- Supported through the FPB Checkout Settings provider dropdown.
- WPB creates a short-lived Shopify app discount code only before invoking checkout handoff providers that bypass native Shopify checkout pricing: GoKwik, Shopflo, Zecpay, and Shiprocket/Fastrr.
- WPB does not call the discount-code endpoint for Theme cart drawer, Rebuy, Monster cart, Upcart, or Kaching Cart because those entries keep the customer in cart drawer/cart refresh flows.
- The exact EB discount-code TTL was not exposed by the help article; WPB defaults generated codes to one use and 30 minutes unless live EB network/Admin evidence proves a different TTL.

## Implementation Notes

- Do not use EB article URLs in WPB card CTAs for now. Point to `https://wolfpackapps.com`.
- Keep quick setup findings in docs only.
- Code must not contain EB or Skailama competitor references.
- Gokwik and Shopflo logos were visible in EB, but local logo downloads were blocked by the execution environment on 2026-06-04, so WPB may temporarily render text-logo fallbacks for those two until assets are added.
