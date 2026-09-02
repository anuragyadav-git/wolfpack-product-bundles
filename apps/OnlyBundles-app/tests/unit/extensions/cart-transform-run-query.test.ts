import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Cart Transform input query", () => {
  const query = readFileSync(
    join(process.cwd(), "extensions/bundle-cart-transform-rs/src/run.graphql"),
    "utf8",
  );
  const normalizedQuery = query.replace(/\s+/g, " ");

  it.each([
    ["component_reference", "component_reference"],
    ["component_quantities", "component_quantities"],
    ["price_adjustment", "price_adjustment"],
    ["component_pricing", "component_pricing"],
  ])("queries app-owned %s metafield with the app namespace", (_label, key) => {
    expect(normalizedQuery).toContain(`metafield(namespace: "$app", key: "${key}")`);
  });

  it("queries cart-transform owner settings with the app namespace", () => {
    expect(query).toMatch(
      /runtimeConfiguration:\s*metafield\(namespace:\s*"\$app",\s*key:\s*"runtime_configuration"\)/,
    );
    expect(normalizedQuery).not.toContain('key: "bundle_cart_line_messaging"');
    expect(normalizedQuery).not.toContain('key: "runtime_token_secret"');
  });

  it("stays within Shopify's maximum input-query complexity", () => {
    const metafieldCost = (normalizedQuery.match(/\bmetafield\(/g) ?? []).length * 3;
    const attributeCost = (normalizedQuery.match(/\battribute\(/g) ?? []).length;
    const requiredLeafCost = 6;

    expect(metafieldCost + attributeCost + requiredLeafCost).toBeLessThanOrEqual(30);
    expect(normalizedQuery).toContain("sellingPlanAllocation { __typename }");
    expect(normalizedQuery).toContain("localization { country { isoCode } }");
  });

  it("reuses bundle display properties instead of adding offer-analytics query leaves", () => {
    expect(normalizedQuery).toContain('bundleDisplayProperties: attribute(key: "_bundle_display_properties")');
    expect(normalizedQuery).not.toContain('attribute(key: "_wpb_');
  });

  it("groups merge lines from EB public cart attributes instead of private bundle IDs", () => {
    expect(normalizedQuery).toContain('wolfpackProductBundleOfferId: attribute(key: "_wolfpackProductBundle:OfferId")');
    expect(normalizedQuery).not.toContain('attribute(key: "_bundleName")');
    expect(normalizedQuery).toContain('runtimeToken: attribute(key: "_wolfpack_bundle_runtime")');
    expect(normalizedQuery).not.toContain('attribute(key: "_addon_offer_id")');
    expect(normalizedQuery).not.toContain('metafield(namespace: "$app", key: "component_parents")');
    expect(normalizedQuery).not.toContain('attribute(key: "_bundle_id")');
    expect(normalizedQuery).not.toContain('attribute(key: "_bundle_name")');
  });
});
