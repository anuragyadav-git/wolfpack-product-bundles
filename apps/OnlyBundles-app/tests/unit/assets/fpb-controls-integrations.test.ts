import {
  buildJudgeMePreviewBadgeUrl,
  fetchJudgeMePreviewBadges,
  filterIrrelevantVariantImages,
  hydrateJudgeMeReviewCards,
} from "../../../app/assets/widgets/full-page/fpb-controls-integrations";
import { JSDOM } from "jsdom";

describe("FPB Controls integrations", () => {
  it("keeps variant media and media sharing the same alt text", () => {
    const product = {
      variants: [{ featured_media: { id: 2 } }],
      media: [
        { id: 1, alt: "Red", src: "red-1.jpg" },
        { id: 2, alt: "Blue", src: "blue-1.jpg" },
        { id: 3, alt: "Blue", src: "blue-2.jpg" },
      ],
      images: [
        { id: 1, src: "red-1.jpg" },
        { id: 2, src: "blue-1.jpg" },
        { id: 3, src: "blue-2.jpg" },
      ],
    };

    expect(filterIrrelevantVariantImages(product)).toMatchObject({
      media: [{ id: 2 }, { id: 3 }],
      images: [{ id: 2 }, { id: 3 }],
    });
  });

  it("builds the Judge.me preview-badge request and returns badges without blocking failures", async () => {
    const url = buildJudgeMePreviewBadgeUrl("test.myshopify.com", "public-token", 11);
    expect(url).toBe(
      "https://api.judge.me/api/v1/widgets/preview_badge?shop_domain=test.myshopify.com&external_id=11&api_token=public-token",
    );

    const fetcher = jest.fn(async (request: RequestInfo | URL) => {
      const productId = new URL(String(request)).searchParams.get("external_id");
      if (productId === "22") return new Response("provider unavailable", { status: 503 });
      return new Response(JSON.stringify({
        product_external_id: Number(productId),
        badge: "<div>4.9 stars</div>",
      }), { status: 200 });
    });

    await expect(fetchJudgeMePreviewBadges({
      shop: "test.myshopify.com",
      token: "public-token",
      productIds: [11, 22],
      fetcher,
    })).resolves.toEqual({
      badges: { "11": "<div>4.9 stars</div>" },
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    await expect(fetchJudgeMePreviewBadges({
      shop: "test.myshopify.com",
      token: "public-token",
      productIds: [11],
      fetcher: jest.fn(async () => { throw new Error("offline"); }),
    })).resolves.toBeNull();
  });

  it("hydrates review badges inside each card identity region", async () => {
    const dom = new JSDOM(`
      <div id="grid">
        <article class="bw-product-card">
          <div class="bw-product-card__body">
            <div class="bw-product-card__text">Product title</div>
          </div>
        </article>
      </div>
    `);
    const root = dom.window.document.querySelector("#grid");
    const fetcher = jest.fn(async () => new Response(JSON.stringify({
      product_external_id: 11,
      badge: "<div>4.9 stars</div>",
    }), { status: 200 }));

    await hydrateJudgeMeReviewCards({
      root,
      products: [{ id: 11 }],
      shop: "test.myshopify.com",
      token: "public-token",
      fetcher,
    });

    expect(root?.querySelector(".bw-product-card__text [data-wpb-judgeme-badge='11']")?.textContent)
      .toBe("4.9 stars");
    expect(root?.querySelector(":scope > .bw-product-card > [data-wpb-judgeme-badge]"))
      .toBeNull();
  });
});
