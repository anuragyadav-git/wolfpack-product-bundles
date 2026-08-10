import { ensureVariantBundleMetafieldDefinitions } from "../../../app/services/bundles/metafield-sync/operations/definitions.server";

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

describe("ensureVariantBundleMetafieldDefinitions", () => {
  it("creates only the current variant-level bundle definitions", async () => {
    const admin = {
      graphql: jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          data: {
            metafieldDefinitionCreate: {
              createdDefinition: { id: "definition-1" },
              userErrors: [],
            },
          },
        }),
      }),
    };

    await ensureVariantBundleMetafieldDefinitions(admin);

    const keys = admin.graphql.mock.calls.map(([, options]) =>
      options.variables.definition.key,
    );
    expect(keys).toEqual([
      "component_reference",
      "component_quantities",
      "price_adjustment",
      "bundle_ui_config",
      "component_pricing",
    ]);
  });
});
