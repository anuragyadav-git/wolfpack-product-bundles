import { APP_BRAND } from "../../../app/lib/app-brand";

describe("Only Bundles brand contract", () => {
  it("exposes the approved visible identity and asset paths", () => {
    expect(APP_BRAND).toMatchObject({
      name: "Only Bundles",
      publisher: "Only Bundles",
      exportSlug: "only-bundles",
      markPath: "/branding/only-bundles/only-bundles-icon.png",
      wordmarkPath: "/branding/only-bundles/only-bundles-icon.png",
      faviconPath: "/branding/only-bundles/only-bundles-favicon-32.png",
    });
  });

  it("uses the approved refined bundle-box palette", () => {
    expect(APP_BRAND.palette).toEqual({
      deepGreen: "#1F3D2E",
      sage: "#A7C29A",
      cream: "#F4EDE2",
      accent: "#FE8A65",
    });
  });
});
