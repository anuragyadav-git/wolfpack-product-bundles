import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(workspaceRoot, "dist");
const tutorialIds = [
  "create-your-first-bundle",
  "build-a-full-page-bundle",
  "build-a-product-page-bundle",
  "configure-discounts-and-pricing",
  "place-bundles-on-your-storefront",
  "customize-design-and-language",
  "configure-gifts-add-ons-and-messages",
  "configure-product-page-gifts-and-add-ons",
  "sell-bundle-subscriptions",
  "measure-bundle-performance",
  "control-bundle-visibility",
  "embed-bundles-in-page-builders",
];

const readOutput = (...segments) => readFile(path.join(distRoot, ...segments), "utf8");
const expectedFrontmatterFields = [
  "schema_version", "id", "title", "type", "status", "summary", "last_audited",
  "owners", "domains", "systems", "source_paths", "related_docs", "tags", "keywords",
];

const assertPublicMetadata = (html, expectedPath) => {
  assert.match(html, /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{40,}["']/i);
  assert.match(html, /<meta[^>]+property=["']og:title["']/i);
  assert.match(html, /<meta[^>]+property=["']og:description["']/i);
  assert.match(
    html,
    new RegExp(`<link[^>]+rel=["']canonical["'][^>]+href=["']https://[^"']+${expectedPath.replaceAll("/", "\\/")}["']`, "i"),
  );
  assert.doesNotMatch(html, /<meta[^>]+name=["']robots["'][^>]+noindex/i);
};

test("home output is an indexable Only Bundles learning hub", async () => {
  const html = await readOutput("index.html");
  assert.match(html, /<h1[^>]*>[\s\S]*?Only Bundles[\s\S]*?<\/h1>/i);
  assert.match(html, /<a[^>]+href=["']\/blogs\/["']/i);
  assertPublicMetadata(html, "/");
});

test("blog index links every published tutorial exactly once", async () => {
  const html = await readOutput("blogs", "index.html");
  assertPublicMetadata(html, "/blogs/");
  for (const id of tutorialIds) {
    const matches = html.match(new RegExp(`href=["']\\/blogs\\/${id}\\/["']`, "g")) ?? [];
    assert.equal(matches.length, 1, `${id} should be linked exactly once`);
  }
});

test("tutorial sources use the exact ordered documentation frontmatter", async () => {
  const contentRoot = path.join(workspaceRoot, "src", "content", "tutorials");
  const files = (await readdir(contentRoot)).filter((file) => file.endsWith(".md")).sort();
  assert.equal(files.length, tutorialIds.length);

  for (const file of files) {
    const source = await readFile(path.join(contentRoot, file), "utf8");
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1];
    assert.ok(frontmatter, `${file} should start with YAML frontmatter`);
    const topLevelFields = [...frontmatter.matchAll(/^([a-z_]+):/gm)].map((match) => match[1]);
    assert.deepEqual(topLevelFields, expectedFrontmatterFields, `${file} frontmatter fields should be exact and ordered`);
  }
});

test("all production-audited tutorials build with substantial content and metadata", async () => {
  for (const id of tutorialIds) {
    const html = await readOutput("blogs", id, "index.html");
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    assert.match(html, /<article(?:\s|>)/i, `${id} should render an article`);
    assert.equal((html.match(/<h1(?:\s|>)/gi) ?? []).length, 1, `${id} should have one h1`);
    assert.ok(text.split(" ").length >= 700, `${id} should contain at least 700 rendered words`);
    assert.match(html, /What you(?:'|’|&#39;)ll (?:build|learn)/i, `${id} should explain its outcome`);
    assert.match(html, /Before you begin/i, `${id} should declare prerequisites`);
    assert.match(html, /Troubleshooting/i, `${id} should include troubleshooting`);
    assertPublicMetadata(html, `/blogs/${id}/`);
    assert.match(html, /<script[^>]+type=["']application\/ld\+json["']/i);
  }
});

test("every generated root-relative link and image resolves", async () => {
  const htmlFiles = [
    "index.html",
    path.join("blogs", "index.html"),
    ...tutorialIds.map((id) => path.join("blogs", id, "index.html")),
  ];

  for (const htmlFile of htmlFiles) {
    const html = await readOutput(htmlFile);
    const urls = [...html.matchAll(/(?:href|src)=["'](\/[^"'#?]+\/?)(?:[?#][^"']*)?["']/gi)].map((match) => match[1]);
    const imageTags = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);

    for (const tag of imageTags) {
      assert.match(tag, /alt=["'][^"']+["']/i, `${htmlFile} contains an image without useful alt text`);
    }

    for (const url of new Set(urls)) {
      const relative = url.replace(/^\//, "");
      const target = path.extname(relative)
        ? path.join(distRoot, relative)
        : path.join(distRoot, relative, "index.html");
      const targetStat = await stat(target);
      assert.equal(targetStat.isFile(), true, `${htmlFile} links to missing ${url}`);
    }
  }
});

test("public output uses current visible branding", async () => {
  const html = await Promise.all([
    readOutput("index.html"),
    readOutput("blogs", "index.html"),
    ...tutorialIds.map((id) => readOutput("blogs", id, "index.html")),
  ]).then((documents) => documents.join("\n"));
  assert.doesNotMatch(html, /Easy Bundles|Skai Lama|Bundlex|BOGOS/i);
  assert.doesNotMatch(html, />[^<]*Wolfpack Bundles[^<]*</i);
});

test("404 output explains the missing page and links home", async () => {
  const html = await readOutput("404.html");
  assert.match(html, /page (?:could not be found|was not found)/i);
  assert.match(html, /<a[^>]+href=["']\/["'][^>]*>/i);
  assert.match(html, /<meta[^>]+name=["']robots["'][^>]+noindex/i);
});

test("robots output allows crawlers and advertises the sitemap", async () => {
  const robots = await readOutput("robots.txt");
  assert.match(robots, /^User-agent: \*$/m);
  assert.doesNotMatch(robots, /^Disallow: \/$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Sitemap: https:\/\/[^\s]+\/sitemap-index\.xml$/m);
});

test("sitemap includes the learning hub and every tutorial", async () => {
  const sitemapIndex = await readOutput("sitemap-index.xml");
  const sitemapName = sitemapIndex.match(/<loc>https:\/\/[^<]+\/(sitemap-[^<]+\.xml)<\/loc>/)?.[1];
  assert.ok(sitemapName, "sitemap index should identify a generated sitemap");
  const sitemap = await readOutput(sitemapName);
  assert.match(sitemap, /<loc>https:\/\/[^<]+<\/loc>/);
  assert.match(sitemap, /\/blogs\/<\/loc>/);
  for (const id of tutorialIds) assert.match(sitemap, new RegExp(`/blogs/${id}/<\\/loc>`));
});

test("the approved application icon is included in static output", async () => {
  const icon = await stat(path.join(distRoot, "only-bundles-icon.png"));
  assert.equal(icon.isFile(), true);
  assert.ok(icon.size > 0);
});
