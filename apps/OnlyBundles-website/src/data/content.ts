export const SITE_ORIGIN = "https://only-bundles-website.onlybundlesapp.workers.dev";
export const SHOPIFY_LISTING = "https://apps.shopify.com/wolfpack-product-bundles-1";

export const featurePages = [
  {
    slug: "full-page-bundles",
    eyebrow: "Full-page bundles",
    title: "Turn bundle building into a guided shopping journey",
    description: "Create a dedicated build-a-box experience with steps, categories, quantity rules, progress, and a live summary.",
    intro: "Full-page bundles give shoppers room to explore a curated assortment one decision at a time. Only Bundles hosts the builder through Shopify while your active theme keeps the surrounding storefront familiar.",
    image: "/showcase/guided-bundle.png",
    imageAlt: "Only Bundles full-page bundle builder shown on desktop and mobile",
    points: [
      ["Guide each decision", "Organize products into steps and categories, then set the quantity rules that make the bundle complete."],
      ["Keep progress visible", "Show shoppers what they have selected, what comes next, and how the bundle total changes."],
      ["Publish without a Shopify Page", "The bundle uses its dedicated storefront route and does not require a merchant-created Shopify Page."],
    ],
  },
  {
    slug: "product-page-bundles",
    eyebrow: "Product-page bundles",
    title: "Let shoppers mix and match without leaving the product page",
    description: "Place a responsive bundle selector alongside an existing product and let customers build a set in context.",
    intro: "Product-page bundles make the offer part of the product story. Shoppers can choose products, quantities, and variants while the theme continues to own the surrounding product form.",
    image: "/showcase/product-page-bundle.png",
    imageAlt: "Only Bundles product-page mix-and-match experience",
    points: [
      ["Flexible product browsing", "Use list, grid, horizontal-slot, or vertical-slot templates for the assortment and page around it."],
      ["Variant choices that fit", "Present variants through dropdowns, pills, color swatches, or image swatches when the catalog supports them."],
      ["Theme-native placement", "Add the Shopify app block to the product template or use the supported page-builder placement block."],
    ],
  },
  {
    slug: "incentives-and-merchandising",
    eyebrow: "Merchandising",
    title: "Reward better bundles without hiding the rules",
    description: "Combine tiered discounts, gifts, add-ons, upsells, and selling plans in a shopper-readable experience.",
    intro: "A bundle should explain why the next choice matters. Only Bundles keeps eligibility, progress, and totals visible while Shopify remains authoritative for the cart and checkout.",
    image: "/showcase/merchandising.png",
    imageAlt: "Only Bundles merchandising controls for discounts, gifts, add-ons, and upsells",
    points: [
      ["Progressive discounts", "Create quantity-based tiers and communicate the active saving as selections change."],
      ["Useful extras", "Unlock free gifts, offer paid add-ons, or surface a complementary upsell without disguising the final total."],
      ["Recurring options", "Use selling plans already owned by Shopify or a subscription provider rather than duplicating subscription infrastructure."],
    ],
  },
  {
    slug: "design-and-templates",
    eyebrow: "Design and templates",
    title: "Start with a proven layout, then make it yours",
    description: "Choose from eight responsive templates and tune the visual system with live preview controls.",
    intro: "Four full-page and four product-page templates cover guided, compact, grid, list, and slot-based experiences. Brand controls keep the builder connected to the storefront around it.",
    image: "/showcase/templates.png",
    imageAlt: "Gallery of eight Only Bundles storefront templates",
    points: [
      ["Four full-page templates", "Standard, Classic, Compact, and Horizontal give guided journeys distinct rhythms without changing the bundle rules."],
      ["Four product-page templates", "Product List, Product Grid, Horizontal Slots, and Vertical Slots adapt to different assortments and product layouts."],
      ["Responsive by design", "Layouts reflow around content and the available storefront container instead of targeting one captured screen size."],
    ],
  },
  {
    slug: "targeting-and-scheduling",
    eyebrow: "Offers and targeting",
    title: "Show the right offer in the right storefront context",
    description: "Control product eligibility, specific links, countries, campaign schedules, and truthful urgency from one offer policy.",
    intro: "Only Bundles uses Shopify’s storefront context for regional eligibility and real saved campaign dates for urgency. It does not infer visitor geography from an IP address or reset a fake timer.",
    image: "/showcase/guided-bundle.png",
    imageAlt: "Only Bundles offer preview with campaign controls",
    points: [
      ["Storefront eligibility", "Target eligible products, collections, campaign placements, or a specific bundle link."],
      ["Country-aware offers", "Use Shopify’s currently selected country as the canonical regional signal."],
      ["Real campaign timing", "Derive countdown presentation from the saved offer end date and define what happens when the campaign expires."],
    ],
  },
  {
    slug: "analytics",
    eyebrow: "Analytics",
    title: "Understand how shoppers move from bundle view to order",
    description: "Review engagement, add-to-cart activity, attributed orders, revenue, and campaign performance in the app.",
    intro: "Only Bundles connects shopper activity to bundle outcomes so merchants can compare offers and improve the journey. Analytics are presented as merchant evidence, not public marketing promises.",
    image: "/showcase/merchandising.png",
    imageAlt: "Only Bundles analytics and merchandising overview",
    points: [
      ["See the funnel", "Follow bundle views, engagement, successful add-to-cart events, and attributed orders."],
      ["Compare bundles", "Use bundle and campaign breakdowns to find where shoppers progress or leave."],
      ["Keep attribution useful", "Review historical order and revenue attribution without turning the marketing site into a customer-data collector."],
    ],
  },
] as const;

export const helpPages = [
  {
    slug: "getting-started",
    title: "Getting started with Only Bundles",
    description: "Choose a bundle type, create the offer, preview it, and publish it to your Shopify storefront.",
    intro: "A reliable first launch starts with the shopping journey you want to create. Build the smallest complete offer, test it in the active theme, and expand it after the storefront behavior is clear.",
    steps: [
      ["Choose the bundle surface", "Use a Full Page Bundle for a guided build-a-box journey or a Product Page Bundle for an offer that belongs inside a product page."],
      ["Add products and rules", "Create the steps or categories, select eligible products, and define the quantities needed to continue."],
      ["Configure the offer", "Add pricing, gifts, add-ons, upsells, subscriptions, and visibility only when they support the intended journey."],
      ["Preview and publish", "Review the complete bundle at desktop and mobile sizes, save it as active, and confirm its storefront placement."],
    ],
  },
  {
    slug: "choosing-a-bundle-type",
    title: "Choose between full-page and product-page bundles",
    description: "Match the bundle surface to the number of decisions shoppers need to make and where the offer belongs.",
    intro: "The two bundle types share merchandising capabilities but solve different storefront problems. Start with the surface, then select a template that fits the assortment.",
    steps: [
      ["Choose full-page for guided discovery", "Use steps and categories when shoppers need to build a complete set across several groups of products."],
      ["Choose product-page for contextual offers", "Keep the bundle on a product page when the anchor product and its companions should stay together."],
      ["Check the host", "Full-page bundles use a dedicated storefront route. Product-page bundles use a theme app block on the chosen product template."],
    ],
  },
  {
    slug: "publishing-full-page-bundles",
    title: "Publish a full-page bundle",
    description: "Prepare the app embed, activate the bundle, and open its dedicated storefront route.",
    intro: "Full-page bundles are served through the signed Shopify app proxy and rendered inside the active theme. They do not need a separately created Shopify Page.",
    steps: [
      ["Enable the app embed", "Open the active theme in Shopify Theme Editor, enable the Only Bundles app embed, and save the theme."],
      ["Complete each step", "Confirm every step has eligible products and a quantity rule shoppers can satisfy."],
      ["Activate the bundle", "Save the bundle as active or unlisted, then use its storefront link to test the complete journey."],
      ["Test the cart", "Select a valid combination and confirm Shopify receives the real component variants and quantities."],
    ],
  },
  {
    slug: "publishing-product-page-bundles",
    title: "Publish a product-page bundle",
    description: "Place the Only Bundles app block on the correct product template and verify the offer in context.",
    intro: "Product-page bundles render where the merchant places the app block. The existing theme continues to own the product page outside the bundle experience.",
    steps: [
      ["Activate the bundle", "Complete the product/category rules and save the Product Page Bundle as active."],
      ["Open Theme Editor", "Choose the product template used by the bundle’s parent or eligible product."],
      ["Add the app block", "Place the Only Bundles product-page block where the offer belongs and save the template."],
      ["Verify eligibility", "Open a matching storefront product, bypass cached assets, and confirm products, variants, totals, and cart behavior."],
    ],
  },
  {
    slug: "page-builder-integrations",
    title: "Use Only Bundles with PageFly, GemPages, and Shogun",
    description: "Place a bundle inside a page-builder layout while the Only Bundles app embed owns loading and behavior.",
    intro: "Use the supported Shopify app-block or app-element path whenever the page builder exposes it. The placement block identifies where the bundle belongs; it does not load a second copy of the runtime.",
    steps: [
      ["Keep the app embed enabled", "Enable the Only Bundles app embed once in the same Shopify theme used by the page-builder page."],
      ["Add the placement block", "Insert the Page Builder bundle block or Shopify App Block element at the intended location."],
      ["Choose one source", "Resolve the eligible bundle for the current product, a specific Product Page Bundle, or a specific Full Page Bundle."],
      ["Publish and verify", "Publish the page-builder layout, save the theme, and test the live storefront in a fresh tab."],
    ],
  },
] as const;

export const blogPages = [
  {
    slug: "full-page-vs-product-page-bundles",
    title: "Full-page or product-page bundles: choose the right journey",
    description: "A practical framework for choosing between guided build-a-box and contextual mix-and-match experiences.",
    dek: "The best bundle surface is determined by the decisions shoppers need to make, not by whichever template looks newest.",
    sections: [
      ["Start with shopping intent", "A full-page experience works when the bundle itself is the destination: a routine, box, kit, or curated set built across several decisions. A product-page experience works when one product anchors the offer and the bundle should stay close to its existing description, media, and buying controls."],
      ["Count the decisions", "More steps, categories, and cross-category choices benefit from the space and visible progress of a dedicated journey. A smaller assortment with immediate variant choices often feels clearer inside the product page."],
      ["Keep merchandising secondary", "Discounts, gifts, add-ons, upsells, and selling plans can support either surface. Choose the journey first, then add only the incentives that make the offer easier to understand."],
    ],
  },
  {
    slug: "how-to-build-a-guided-bundle-journey",
    title: "How to build a guided bundle journey shoppers can finish",
    description: "Organize bundle steps, quantity rules, progress, and summaries around a clear customer outcome.",
    dek: "A guided bundle should reduce decisions in each moment while keeping the complete goal visible.",
    sections: [
      ["Give each step one job", "Group products by the choice a shopper is making—such as a base, accessory, or finish—rather than by the way the catalog happens to be organized internally."],
      ["Make quantity rules readable", "Tell shoppers how many items are required before they start selecting. Update progress and the summary immediately so a blocked next step never feels arbitrary."],
      ["Use the summary as reassurance", "Keep product names, variants, quantities, savings, and the final total visible enough to review. The summary should explain the bundle, not compete with the current step."],
      ["Test the smallest screen", "Long titles, several variants, missing images, and sold-out products create the real stress cases. Verify the journey on an actually resized mobile window before publishing."],
    ],
  },
  {
    slug: "merchandising-discounts-gifts-add-ons-upsells",
    title: "Use bundle incentives without making the offer harder to trust",
    description: "Plan discounts, gifts, add-ons, and upsells as a clear progression instead of a stack of competing promotions.",
    dek: "The strongest bundle incentive is the one a shopper can explain back in one sentence.",
    sections: [
      ["Lead with the bundle value", "Start with the products and outcome. A tiered discount should clarify why another item is useful, not force shoppers to reverse-engineer a pricing rule."],
      ["Separate rewards from paid extras", "A free gift has an eligibility threshold. An add-on or upsell has its own price and selection state. Label and total them separately so the cart result is predictable."],
      ["Keep urgency factual", "If an offer has an end date, show a countdown derived from that saved deadline and define the expired state. Do not reset a timer for every visitor."],
      ["Check the Shopify result", "The storefront preview is only one layer. Confirm the selected component variants, quantities, discounts, gifts, and paid extras remain correct in Shopify cart and checkout."],
    ],
  },
] as const;
