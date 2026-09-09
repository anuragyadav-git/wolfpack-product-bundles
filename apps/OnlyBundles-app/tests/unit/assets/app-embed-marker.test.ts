import {
  findOwnedAppEmbedMarker,
  resolveAppEmbedOwnership,
} from "../../../app/storefront/app-embed-marker";
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

  it("resolves the only app embed marker as owned", () => {
    const document = new JSDOM(`<!doctype html><body>
        <div data-wpb-app-embed data-storefront-proxy-root="/apps/product-bundles-sit"></div>
        <script src="sit-embed.js"></script>
      </body>`).window.document;

    const resolution = resolveAppEmbedOwnership(
      document.querySelector("script"),
      document,
    );

    expect(resolution).toMatchObject({
      status: "owned",
      marker: expect.objectContaining({
        dataset: expect.objectContaining({
          storefrontProxyRoot: "/apps/product-bundles-sit",
        }),
      }),
    });
  });

  it("resolves a missing app embed without fabricating an owner", () => {
    const document = new JSDOM("<!doctype html><body></body>").window.document;

    expect(
      resolveAppEmbedOwnership(document.createElement("script"), document),
    ).toEqual({ status: "missing", marker: null, proxyRoots: [] });
  });

  it("fails closed when production and SIT app embeds share one theme", () => {
    const document = new JSDOM(`<!doctype html><body>
        <div data-wpb-app-embed data-storefront-proxy-root="/apps/product-bundles"></div>
        <script src="prod-embed.js"></script>
        <div data-wpb-app-embed data-storefront-proxy-root="/apps/product-bundles-sit"></div>
        <script src="sit-embed.js"></script>
      </body>`).window.document;

    const scripts = document.querySelectorAll("script");

    expect(resolveAppEmbedOwnership(scripts[0], document)).toEqual({
      status: "conflict",
      marker: null,
      proxyRoots: ["/apps/product-bundles", "/apps/product-bundles-sit"],
    });
    expect(resolveAppEmbedOwnership(scripts[1], document)).toEqual({
      status: "conflict",
      marker: null,
      proxyRoots: ["/apps/product-bundles", "/apps/product-bundles-sit"],
    });
  });
});
