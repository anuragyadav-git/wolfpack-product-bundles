import {
  renderFpbLoadingScreen,
  resolveBundleLoadingScreenSettings,
} from "../../../app/lib/bundle-loading-screen";

describe("bundle loading screen", () => {
  it("accepts Shopify-hosted HTTPS media and a supported CSS color", () => {
    expect(resolveBundleLoadingScreenSettings({
      loadingScreen: {
        gifUrl: "https://cdn.shopify.com/s/files/loading.gif",
        backgroundColor: "rgba(12, 34, 56, 0.5)",
      },
    })).toEqual({
      gifUrl: "https://cdn.shopify.com/s/files/loading.gif",
      backgroundColor: "rgba(12, 34, 56, 0.5)",
    });
  });

  it("rejects unsafe media and color values instead of forwarding them", () => {
    expect(resolveBundleLoadingScreenSettings({
      loadingScreen: {
        gifUrl: "javascript:alert(1)",
        backgroundColor: "red;display:none",
      },
    })).toEqual({ gifUrl: null, backgroundColor: "#ffffff" });
  });

  it("escapes the normalized values rendered by the FPB splash screen", () => {
    const markup = renderFpbLoadingScreen({
      gifUrl: "https://cdn.shopify.com/loading.gif?label=\"safe\"&kind=gif",
      backgroundColor: "#fff",
    });

    expect(markup).toContain("https://cdn.shopify.com/loading.gif?label=&quot;safe&quot;&amp;kind=gif");
    expect(markup).toContain("--wpb-loading-screen-bg:#fff");
  });
});
