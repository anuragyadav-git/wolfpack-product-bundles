// eslint-disable-next-line @typescript-eslint/no-require-imports
const { JSDOM } = require("jsdom");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  createPpbVariantSelectorElement,
  resolvePpbCategoryVariantSelectorConfiguration,
  resolvePpbSwatchColor,
  resolvePpbTooltipPosition,
} = require("../../../app/assets/widgets/product-page/variant-selector-modes.js");

function product() {
  return {
    id: "gid://shopify/Product/1",
    variantId: "gid://shopify/ProductVariant/11",
    options: ["Color"],
    variants: [
      {
        id: "gid://shopify/ProductVariant/11",
        title: "Navy",
        option1: "Navy",
        available: true,
        image: { src: "https://cdn.example/navy.jpg" },
      },
      {
        id: "gid://shopify/ProductVariant/12",
        title: "Soft pink",
        option1: "Soft pink",
        available: true,
        image: { src: "https://cdn.example/pink.jpg" },
      },
      {
        id: "gid://shopify/ProductVariant/13",
        title: "Sold out",
        option1: "Sold out",
        available: false,
      },
    ],
  };
}

describe("PPB variant selector modes", () => {
  const runtimeDocument = new JSDOM("<!doctype html><html><body></body></html>").window.document;

  it("resolves the active category configuration without inventing mappings", () => {
    expect(resolvePpbCategoryVariantSelectorConfiguration({
      categories: [
        { variantSelectorMode: "pill" },
        {
          variantSelectorMode: "color_swatch",
          swatchTooltipEnabled: true,
          variantColorMap: { Navy: "#001F3F" },
        },
      ],
    }, 0, { 0: 1 })).toEqual({
      variantSelectorMode: "color_swatch",
      swatchTooltipEnabled: true,
      variantColorMap: { Navy: "#001F3F" },
    });
    expect(resolvePpbSwatchColor("Unknown", { Navy: "#001F3F" })).toBeNull();
  });

  it("renders semantic pills and reports an exact selected variant", () => {
    const changes: string[] = [];
    const selector = createPpbVariantSelectorElement({
      product: product(),
      configuration: { variantSelectorMode: "pill" },
      label: "Select variant",
      document: runtimeDocument,
      onVariantChange: (variantId: string) => changes.push(variantId),
    });

    expect(selector.getAttribute("role")).toBe("radiogroup");
    const pink = selector.querySelector('input[value="gid://shopify/ProductVariant/12"]');
    expect(pink.getAttribute("aria-label")).toBe("Soft pink");
    pink.checked = true;
    pink.dispatchEvent(new runtimeDocument.defaultView.Event("change", { bubbles: true }));

    expect(changes).toEqual(["gid://shopify/ProductVariant/12"]);
    expect(selector.querySelector('[aria-live="polite"]').textContent).toBe("Soft pink");
  });

  it("renders mapped color swatches with focus descriptions and no guessed color", () => {
    const selector = createPpbVariantSelectorElement({
      product: product(),
      configuration: {
        variantSelectorMode: "color_swatch",
        swatchTooltipEnabled: true,
        variantColorMap: { Navy: "#001F3F" },
      },
      label: "Select color",
      document: runtimeDocument,
    });

    const navy = selector.querySelector('input[value="gid://shopify/ProductVariant/11"]');
    const navyControl = navy.closest("label");
    const tooltip = navyControl.querySelector('[role="tooltip"]');
    expect(navy.getAttribute("aria-describedby")).toBe(tooltip.id);
    expect(tooltip.textContent).toBe("Navy");
    expect(navyControl.style.getPropertyValue("--wpb-ppb-swatch-color")).toBe("#001F3F");

    const pink = selector.querySelector('input[value="gid://shopify/ProductVariant/12"]');
    expect(pink.closest("label").style.getPropertyValue("--wpb-ppb-swatch-color")).toBe("");
  });

  it("uses variant imagery for image swatches and removes unavailable values from focus", () => {
    const selector = createPpbVariantSelectorElement({
      product: product(),
      configuration: { variantSelectorMode: "image_swatch" },
      label: "Select variant",
      document: runtimeDocument,
      isUnavailable: (variant: { available?: boolean }) => variant.available === false,
    });

    expect(selector.querySelector('input[value="gid://shopify/ProductVariant/11"] + span img').src)
      .toBe("https://cdn.example/navy.jpg");
    expect(selector.querySelector('input[value="gid://shopify/ProductVariant/13"]').disabled).toBe(true);
  });

  it("clamps tooltip placement and flips it below a top-edge anchor", () => {
    expect(resolvePpbTooltipPosition({
      anchorLeft: 4,
      anchorTop: 3,
      anchorWidth: 44,
      tooltipWidth: 120,
      tooltipHeight: 28,
      viewportWidth: 390,
      edgeGap: 8,
    })).toEqual({ placement: "below", shiftX: 42 });
  });
});
