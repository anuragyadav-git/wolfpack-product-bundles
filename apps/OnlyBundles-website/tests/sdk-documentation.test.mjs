import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(workspaceRoot, "dist");
const readOutput = (...segments) => readFile(path.join(distRoot, ...segments), "utf8");

test("SDK guide is indexable and publishes the complete limited-release contract", async () => {
  const html = await readOutput("developers", "sdk", "index.html");
  assert.match(html, /<link[^>]+rel=["']canonical["'][^>]+\/developers\/sdk\//i);
  assert.doesNotMatch(html, /name=["']robots["'][^>]+noindex/i);
  assert.match(html, /Only Bundles SDK/i);
  assert.match(html, /limited release/i);
  assert.match(html, /support-enabled/i);
  assert.match(html, /Product Page Bundles only/i);
  assert.match(html, /Online Store 2\.0/i);
  assert.match(html, /one SDK bundle per page/i);
  assert.match(html, /no npm or public CDN distribution/i);
  assert.match(html, /window\.WolfpackBundles/);
  for (const name of ["addItem", "removeItem", "clearStep", "validateStep", "validateBundle", "getDisplayPrice", "addBundleToCart"]) {
    assert.match(html, new RegExp(name));
  }
  for (const event of ["wbp:ready", "wbp:init-failed", "wbp:item-added", "wbp:item-removed", "wbp:step-cleared", "wbp:cart-success", "wbp:cart-failed"]) {
    assert.match(html, new RegExp(event));
  }
  for (const section of ["availability", "prerequisites", "initialization", "state", "methods", "events", "pricing", "cart-handling", "debugging", "errors", "limitations", "launch-checklist"]) {
    assert.match(html, new RegExp(`id=["']${section}["']`));
  }
  assert.match(html, /textContent/);
  assert.doesNotMatch(html, /innerHTML/);
  assert.doesNotMatch(html, /toggle [“"']?Enable SDK mode|turn SDK mode on|version 12\.3\.0/i);
});

test("header, mobile menu, footer, and sitemap discover the SDK guide", async () => {
  const home = await readOutput("index.html");
  const sitemap = await readOutput("sitemap.xml");
  assert.ok((home.match(/href=["']\/developers\/sdk\/["']/g) ?? []).length >= 3);
  assert.match(sitemap, /\/developers\/sdk\/<\/loc>/);
});
