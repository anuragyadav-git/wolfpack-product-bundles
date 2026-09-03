import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(workspaceRoot, "dist");
const publicRoutes = [
  "",
  "demo",
  "pricing",
  "features",
  "features/full-page-bundles",
  "features/product-page-bundles",
  "features/incentives-and-merchandising",
  "features/design-and-templates",
  "features/targeting-and-scheduling",
  "features/analytics",
  "help",
  "help/getting-started",
  "help/choosing-a-bundle-type",
  "help/publishing-full-page-bundles",
  "help/publishing-product-page-bundles",
  "help/page-builder-integrations",
  "blog",
  "blog/full-page-vs-product-page-bundles",
  "blog/how-to-build-a-guided-bundle-journey",
  "blog/merchandising-discounts-gifts-add-ons-upsells",
  "changelog",
  "privacy",
  "terms",
];

const outputPath = (route) => route === ""
  ? path.join(distRoot, "index.html")
  : path.join(distRoot, route, "index.html");

test("every public launch route is pre-rendered with indexable metadata", async () => {
  for (const route of publicRoutes) {
    const html = await readFile(outputPath(route), "utf8");
    assert.match(html, /<title>[^<]+\| Only Bundles<\/title>/i, route || "/");
    assert.match(html, /<meta[^>]+name="description"[^>]+content="[^"]+"/i, route || "/");
    assert.match(html, /<meta[^>]+name="robots"[^>]+content="index, follow"/i, route || "/");
    assert.match(html, /<link[^>]+rel="canonical"[^>]+href="https:\/\/only-bundles-website\.onlybundlesapp\.workers\.dev\//i, route || "/");
  }
});

test("home identifies both bundle surfaces and verified calls to action", async () => {
  const html = await readFile(outputPath(""), "utf8");
  assert.match(html, /Two ways to bundle\. One beautiful storefront\./i);
  assert.match(html, /Full-page bundles/i);
  assert.match(html, /Product-page bundles/i);
  assert.match(html, /href="\/demo\/"/i);
  assert.match(html, /href="https:\/\/apps\.shopify\.com\/wolfpack-product-bundles-1"/i);
});

test("pricing reflects verified Shopify plans and its audit date", async () => {
  const html = await readFile(outputPath("pricing"), "utf8");
  assert.match(html, />Free</i);
  assert.match(html, />Growth</i);
  assert.match(html, /\$19\.99/);
  assert.match(html, /\$199/);
  assert.match(html, /14-day/i);
  assert.match(html, /verified[^<]*September 3, 2026/i);
});

test("privacy policy identifies the provider and actual application data flows", async () => {
  const html = await readFile(outputPath("privacy"), "utf8");
  assert.match(html, /Only Bundles/i);
  assert.match(html, /Delhi, India/i);
  assert.match(html, /onlybundlesappsupport@gmail\.com/i);
  assert.match(html, /merchant.*controller/i);
  assert.match(html, /processor|service provider/i);
  for (const disclosure of ["Shopify account", "storefront", "order attribution", "support", "public website", "international transfer", "retention", "privacy rights"]) {
    assert.match(html, new RegExp(disclosure, "i"), disclosure);
  }
  assert.doesNotMatch(html, /Cloudflare Web Analytics|static\.cloudflareinsights\.com/i);
});

test("terms publish the complete Only Bundles service contract", async () => {
  const html = await readFile(outputPath("terms"), "utf8");
  for (const term of ["Shopify", "billing", "acceptable use", "intellectual property", "termination", "disclaimer", "limitation of liability", "indemn", "India", "onlybundlesappsupport@gmail.com"]) {
    assert.match(html, new RegExp(term, "i"), term);
  }
});

test("sitemap contains every public route including the approved legal pages", async () => {
  const xml = await readFile(path.join(distRoot, "sitemap.xml"), "utf8");
  for (const route of publicRoutes) {
    const suffix = route ? `${route}/` : "";
    assert.match(xml, new RegExp(`<loc>https://only-bundles-website\\.onlybundlesapp\\.workers\\.dev/${suffix}</loc>`));
  }
});

test("demo discloses and mounts the production storefront renderer", async () => {
  const html = await readFile(outputPath("demo"), "utf8");
  assert.match(html, /same production storefront renderer/i);
  assert.match(html, /Full-page.*Standard/i);
  assert.match(html, /Product List/i);
  assert.match(html, /nothing can be added to a real cart/i);
});

test("robots permits public crawling and declares the sitemap index", async () => {
  const robots = await readFile(path.join(distRoot, "robots.txt"), "utf8");
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Sitemap: https:\/\/only-bundles-website\.onlybundlesapp\.workers\.dev\/sitemap-index\.xml$/m);
});

test("404 explains the missing page and links home", async () => {
  const html = await readFile(path.join(distRoot, "404.html"), "utf8");
  assert.match(html, /page (?:could not be found|was not found)/i);
  assert.match(html, /<a[^>]+href="\/"/i);
  assert.match(html, /<meta[^>]+name="robots"[^>]+content="noindex, nofollow"/i);
});

test("approved application imagery is included in static output", async () => {
  for (const file of [
    "only-bundles-icon.png",
    "products/sage-trail-bottle.webp",
    "products/waffle-cotton-throw.webp",
    "products/field-notes-sunglasses.webp",
    "products/everyday-balm.webp",
  ]) {
    const asset = await stat(path.join(distRoot, file));
    assert.equal(asset.isFile(), true);
    assert.ok(asset.size > 0);
  }
});
