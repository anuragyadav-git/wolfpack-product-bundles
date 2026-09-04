import { findOwnedAppEmbedMarker } from "../../../app/storefront/app-embed-marker";
import { JSDOM } from "jsdom";

describe("findOwnedAppEmbedMarker", () => {
  it("returns the marker adjacent to the current app embed script", () => {
    const document = new JSDOM(`<!doctype html><body>
        <div data-wpb-app-embed data-storefront-proxy-root="/apps/product-bundles"></div>
        <script src="prod-embed.js"></script>
        <div data-wpb-app-embed data-storefront-proxy-root="/apps/product-bundles-sit"></div>
        <script src="sit-embed.js"></script>
      </body>`).window.document;

    const scripts = document.querySelectorAll("script");
    const marker = findOwnedAppEmbedMarker(scripts[1], document);

    expect(marker?.dataset.storefrontProxyRoot).toBe(
      "/apps/product-bundles-sit"
    );
  });

  it("falls back to the document marker when the current script has no adjacent marker", () => {
    const document = new JSDOM(`<!doctype html><body>
        <div data-wpb-app-embed data-storefront-proxy-root="/apps/product-bundles-sit"></div>
      </body>`).window.document;

    const marker = findOwnedAppEmbedMarker(
      document.createElement("script"),
      document
    );

    expect(marker?.dataset.storefrontProxyRoot).toBe(
      "/apps/product-bundles-sit"
    );
  });

  it("returns null when no app embed marker exists", () => {
    const document = new JSDOM("<!doctype html><body></body>").window.document;

    expect(
      findOwnedAppEmbedMarker(document.createElement("script"), document)
    ).toBeNull();
  });
});
