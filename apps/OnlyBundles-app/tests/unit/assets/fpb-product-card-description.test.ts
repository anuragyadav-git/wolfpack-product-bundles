import { fullPageProductCardFooterMethods } from "../../../app/assets/widgets/full-page/methods/product-card-footer-methods.js";
import { JSDOM } from "jsdom";

describe("FPB product card description", () => {
  it("omits merchant product descriptions from storefront cards", () => {
    const originalDocument = (global as { document?: unknown }).document;
    (global as { document?: unknown }).document = new JSDOM('<!doctype html><html><body></body></html>').window.document;

    try {
      const card = fullPageProductCardFooterMethods.createProductCard.call(
        {
          selectedProducts: [{}],
          selectedBundle: {
            variantSelectorEnabled: false,
            steps: [{}],
          },
          getFullPageDesignPreset: () => "STANDARD",
          buildPaidAddonProductDisplayData: (product: unknown) => product,
          isVariantOutOfStock: () => false,
          getProductCardAddButtonText: () => "Add",
          applyStandardExpandedVariantTitle: () => undefined,
          attachProductCardListeners: () => undefined,
        },
        {
          id: "variant-1",
          title: "Daily Essential",
          description: "Merchant description belongs in the product modal.",
          price: 1299,
          imageUrl: "https://cdn.example.test/product.jpg",
        },
        0,
      ) as HTMLElement;

      expect(card.textContent).toMatch(/Daily Essential/);
      expect(card.textContent).not.toMatch(/Merchant description belongs in the product modal\./);
    } finally {
      (global as { document?: unknown }).document = originalDocument;
    }
  });
});
