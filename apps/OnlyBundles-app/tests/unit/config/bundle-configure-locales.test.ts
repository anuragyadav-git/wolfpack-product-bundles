import fs from "node:fs";
import path from "node:path";

describe("Bundle Configure locale access", () => {
  it.each([
    "shopify.app.toml",
    "shopify.app.wolfpack-product-bundles-sit.toml",
  ])("declares read_locales in %s", (configFile) => {
    const config = fs.readFileSync(path.resolve(process.cwd(), configFile), "utf8");
    const scopes = config.match(/^scopes\s*=\s*"([^"]+)"/m)?.[1].split(",") ?? [];

    expect(scopes).toContain("read_locales");
  });
});
