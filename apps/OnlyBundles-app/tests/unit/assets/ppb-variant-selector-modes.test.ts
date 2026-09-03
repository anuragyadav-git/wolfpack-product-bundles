// eslint-disable-next-line @typescript-eslint/no-require-imports
const { JSDOM } = require("jsdom");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  createPpbVariantSelectorElement,
  resolvePpbCategoryVariantSelectorConfiguration,
  resolvePpbVariantSwatch,
  resolvePpbTooltipPosition,
} = require("../../../app/assets/widgets/product-page/variant-selector-modes.js");

function product() {
  return {
    id: "gid://shopify/Product/1",
    variantId: "gid://shopify/ProductVariant/11",
    options: [{
      id: "gid://shopify/ProductOption/1",
      name: "Color",
      optionValues: [
        {
          id: "gid://shopify/ProductOptionValue/1",
          name: "Navy",
          swatch: { color: "#001F3F", image: null },
        },
        {
          id: "gid://shopify/ProductOptionValue/2",
          name: "Soft pink",
          swatch: {
            color: null,
            image: { src: "https://cdn.example/shopify-pink.jpg", altText: "Soft pink" },
          },
        },
        {
          id: "gid://shopify/ProductOptionValue/3",
          name: "Sold out",
          swatch: null,
        },
      ],
    }],
    variants: [
      {
        id: "gid://shopify/ProductVariant/11",
        title: "Navy",
        option1: "Navy",
        selectedOptions: [{ name: "Color", value: "Navy" }],
        available: true,
        image: { src: "https://cdn.example/navy.jpg" },
      },
      {
        id: "gid://shopify/ProductVariant/12",
        title: "Soft pink",
        option1: "Soft pink",
        selectedOptions: [{ name: "Color", value: "Soft pink" }],
        available: true,
        image: { src: "https://cdn.example/pink.jpg" },
      },
      {
        id: "gid://shopify/ProductVariant/13",
        title: "Sold out",
        option1: "Sold out",
        selectedOptions: [{ name: "Color", value: "Sold out" }],
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
        },
      ],
    }, 0, { 0: 1 })).toEqual({
      variantSelectorMode: "color_swatch",
      swatchTooltipEnabled: true,
    });
    expect(resolvePpbVariantSwatch(product(), product().variants[0])).toEqual({
      color: "#001F3F",
      image: null,
      label: "Navy",
    });
  });

  it("skips selected options without Shopify swatches", () => {
    const multiOptionProduct = product();
    multiOptionProduct.options.unshift({
      id: "gid://shopify/ProductOption/2",
      name: "Size",
      optionValues: [{
        id: "gid://shopify/ProductOptionValue/4",
        name: "Small",
        swatch: null,
      }],
    });
    multiOptionProduct.variants[0].selectedOptions.unshift({
      name: "Size",
      value: "Small",
    });

    expect(resolvePpbVariantSwatch(
      multiOptionProduct,
      multiOptionProduct.variants[0],
    )).toEqual({
      color: "#001F3F",
      image: null,
      label: "Navy",
    });
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

  it("renders Shopify color swatches with focus descriptions and no guessed color", () => {
    const selector = createPpbVariantSelectorElement({
      product: product(),
      configuration: {
        variantSelectorMode: "color_swatch",
        swatchTooltipEnabled: true,
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

  it("uses Shopify option-value imagery for image swatches and removes unavailable values from focus", () => {
    const selector = createPpbVariantSelectorElement({
      product: product(),
      configuration: { variantSelectorMode: "image_swatch" },
      label: "Select variant",
      document: runtimeDocument,
      isUnavailable: (variant: { available?: boolean }) => variant.available === false,
    });

    expect(selector.querySelector('input[value="gid://shopify/ProductVariant/11"] + span img'))
      .toBeNull();
    expect(selector.querySelector('input[value="gid://shopify/ProductVariant/12"] + span img').src)
      .toBe("https://cdn.example/shopify-pink.jpg");
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
