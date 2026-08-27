import * as fs from "node:fs";
import { join } from "node:path";

const requiredTopics = [
  "app_purchases_one_time/update",
  "app_subscriptions/update",
  "app/uninstalled",
  "app/scopes_update",
  "products/delete",
];

const removedTopics = [
  "orders/create",
  "products/update",
  "inventory_levels/update",
];

const webhookApiVersion = "2026-07";

function readConfig(configPath: string) {
  // Test fixture paths are fixed by the table below.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return fs.readFileSync(join(process.cwd(), configPath), "utf8");
}

function readTopics(configPath: string) {
  const source = readConfig(configPath);
  const topicsBlock = source.match(/topics\s*=\s*\[([\s\S]*?)\]/)?.[1] ?? "";
  return [...topicsBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

function readWebhookApiVersion(configPath: string) {
  const source = readConfig(configPath);
  return source.match(/\[webhooks\]\s+api_version\s*=\s*"([^"]+)"/)?.[1];
}

describe("Shopify webhook subscriptions", () => {
  it.each([
    ["SIT", "shopify.app.wolfpack-product-bundles-sit.toml"],
    ["production", "shopify.app.toml"],
  ])("%s config subscribes only to required operational webhook topics", (_label, configPath) => {
    const topics = readTopics(configPath);

    expect(topics.sort()).toEqual([...requiredTopics].sort());
    for (const topic of removedTopics) {
      expect(topics).not.toContain(topic);
    }
  });

  it.each([
    ["SIT", "shopify.app.wolfpack-product-bundles-sit.toml"],
    ["production", "shopify.app.toml"],
  ])("%s config serializes webhooks with the supported API version", (_label, configPath) => {
    expect(readWebhookApiVersion(configPath)).toBe(webhookApiVersion);
  });
});
