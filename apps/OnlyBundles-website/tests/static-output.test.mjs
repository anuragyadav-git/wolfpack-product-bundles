import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const distRoot = path.join(workspaceRoot, "dist");

test("home output identifies Only Bundles and prevents indexing", async () => {
  const html = await readFile(path.join(distRoot, "index.html"), "utf8");

  assert.match(html, /<h1[^>]*>\s*Only Bundles\s*<\/h1>/i);
  assert.match(html, /<meta[^>]+name=["']robots["'][^>]+noindex/i);
});

test("404 output explains the missing page and links home", async () => {
  const html = await readFile(path.join(distRoot, "404.html"), "utf8");

  assert.match(html, /page (?:could not be found|was not found)/i);
  assert.match(html, /<a[^>]+href=["']\/["'][^>]*>/i);
  assert.match(html, /<meta[^>]+name=["']robots["'][^>]+noindex/i);
});

test("robots output blocks all crawlers", async () => {
  const robots = await readFile(path.join(distRoot, "robots.txt"), "utf8");

  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Disallow: \/$/m);
});

test("the approved application icon is included in static output", async () => {
  const icon = await stat(path.join(distRoot, "only-bundles-icon.png"));

  assert.equal(icon.isFile(), true);
  assert.ok(icon.size > 0);
});
