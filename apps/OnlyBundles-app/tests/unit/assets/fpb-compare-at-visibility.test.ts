import { fullPageProductCardFooterMethods } from "../../../app/assets/widgets/full-page/methods/product-card-footer-methods.js";
import { JSDOM } from "jsdom";

describe("FPB compare-at price visibility", () => {
  it.each([true, false, undefined])(
    "renders available compare-at data when the stale storefront flag is %s",
    (showProductComparedAtPrice) => {
      const originalDocument = (global as { document?: unknown }).document;
      (global as { document?: unknown }).document = new JSDOM('<!doctype html><html><body></body></html>').window.document;

      try {
        const card = fullPageProductCardFooterMethods.createProductCard.call(
          {
            selectedProducts: [{}],
            selectedBundle: {
              showProductComparedAtPrice,
              variantSelectorEnabled: false,
              steps: [{}],
            },
            getFullPageDesignPreset: () => "STANDARD",
            buildPaidAddonProductDisplayData: (value: unknown) => value,
            isVariantOutOfStock: () => false,
            getProductCardAddButtonText: () => "Add",
            applyStandardExpandedVariantTitle: () => undefined,
            attachProductCardListeners: () => undefined,
          },
          {
            id: "variant-sale",
            title: "Sale product",
            price: 48900,
            compareAtPrice: 52900,
          },
          0,
        ) as HTMLElement;

        expect(card.textContent).toMatch(/529\.00/);
        expect(card.textContent).toMatch(/489\.00/);
      } finally {
        (global as { document?: unknown }).document = originalDocument;
      }
    },
  );

  it("does not fabricate a compare-at price when product data omits it", () => {
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
          buildPaidAddonProductDisplayData: (value: unknown) => value,
          isVariantOutOfStock: () => false,
          getProductCardAddButtonText: () => "Add",
          applyStandardExpandedVariantTitle: () => undefined,
          attachProductCardListeners: () => undefined,
        },
        {
          id: "variant-regular",
          title: "Regular product",
          price: 48900,
        },
        0,
      ) as HTMLElement;

      expect(card.textContent).toMatch(/489\.00/);
      expect(card.textContent).not.toMatch(/529\.00/);
    } finally {
      (global as { document?: unknown }).document = originalDocument;
    }
  });
});
